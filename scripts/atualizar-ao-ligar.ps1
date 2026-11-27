<#
.SYNOPSIS
  Dispara a coleta automatica do OCAD no SICAF ao ligar/desbloquear a maquina
  e sincroniza o repositorio local do localhost apos a conclusao.
#>
param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$RepoOwner = "KVRA-K9"
$RepoName = "OCADAC"
$WorkflowFile = "coletar-sicaf-ocad.yml"
$RunnerName = "seplan-sicaf"
$RunnerDir = "C:\actions-runner"
$RunnerVbs = Join-Path $RunnerDir "runner-ocad-sicaf.vbs"
$RepoDir = "C:\Users\vinicius.farias\Desktop\Projeto_OCAD"
$LogFile = Join-Path $RunnerDir "atualizacao-ao-ligar.log"
$StampFile = Join-Path $RunnerDir "ultima-atualizacao-sucesso.txt"

# Garante git e node no PATH mesmo quando iniciado pelo Agendador de Tarefas
$ExtraPaths = @(
  "C:\Users\vinicius.farias\AppData\Local\hermes\git\cmd",
  "C:\Users\vinicius.farias\AppData\Local\hermes\git\bin",
  "C:\Users\vinicius.farias\AppData\Local\hermes\node"
)
foreach ($p in $ExtraPaths) {
  if ((Test-Path $p) -and ($env:PATH -notlike "*$p*")) {
    $env:PATH = "$p;$env:PATH"
  }
}

function Write-Log {
  param([string]$Message)
  $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $line = "[$ts] $Message"
  Add-Content -Path $LogFile -Value $line -Encoding UTF8
  Write-Host $line
}

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
  $prevPref = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $out = & git @GitArgs 2>&1 | ForEach-Object { "$_" }
    if ($LASTEXITCODE -ne 0) {
      throw "git $($GitArgs -join ' ') falhou (exit $LASTEXITCODE): $($out -join ' | ')"
    }
    return $out
  } finally {
    $ErrorActionPreference = $prevPref
  }
}

# Limita o tamanho do log a ~1 MB
if ((Test-Path $LogFile) -and ((Get-Item $LogFile).Length -gt 1MB)) {
  $tail = Get-Content -Path $LogFile -Tail 500
  Set-Content -Path $LogFile -Value $tail -Encoding UTF8
}

# Evita execucoes simultaneas quando Logon e Unlock disparam juntos
$mutexCreated = $false
$mutex = New-Object System.Threading.Mutex($true, "Local\OCAD_AtualizarAoLigar", [ref]$mutexCreated)
if (-not $mutexCreated) {
  exit 0
}

try {
  $agora = Get-Date
  $hojeStr = $agora.ToString("yyyy-MM-dd")

  if (-not $Force) {
    # Apenas dias uteis (segunda a sexta)
    if ($agora.DayOfWeek -in @([DayOfWeek]::Saturday, [DayOfWeek]::Sunday)) {
      exit 0
    }

    # So dispara a partir das 06:30 (evita consumir a execucao em reinicios de madrugada)
    if ($agora.TimeOfDay -lt [TimeSpan]::FromHours(6.5)) {
      exit 0
    }

    # Apenas uma atualizacao bem-sucedida por dia
    if (Test-Path $StampFile) {
      $ultimoSucesso = (Get-Content -Path $StampFile -ErrorAction SilentlyContinue | Select-Object -First 1)
      if ($ultimoSucesso -and $ultimoSucesso.Trim() -eq $hojeStr) {
        exit 0
      }
    }
  }

  Write-Log "Iniciando verificacao de atualizacao ao ligar/desbloquear a maquina."

  # Garante que o runner local esta em execucao
  $runnerProc = Get-Process -Name "Runner.Listener" -ErrorAction SilentlyContinue
  if (-not $runnerProc) {
    if (Test-Path $RunnerVbs) {
      Write-Log "Runner.Listener nao encontrado; iniciando $RunnerVbs."
      Start-Process -FilePath "wscript.exe" -ArgumentList "`"$RunnerVbs`""
    } else {
      throw "Arquivo do runner nao encontrado: $RunnerVbs"
    }
  }

  # Obtem token do Git Credential Manager sem grava-lo em log
  $credOut = ("protocol=https`nhost=github.com`n`n" | & git credential fill 2>$null)
  $tokenLine = $credOut | Where-Object { $_ -like "password=*" } | Select-Object -First 1
  if (-not $tokenLine) {
    throw "Token GitHub nao encontrado no Git Credential Manager."
  }
  $token = $tokenLine.Substring("password=".Length)
  $headers = @{
    Authorization = "Bearer $token"
    Accept        = "application/vnd.github+json"
    "User-Agent"  = "ocad-startup-updater"
  }

  # Aguarda rede/SSL estabilizarem e o runner ficar online no GitHub (ate 5 min)
  $runnerOnline = $false
  $deadlineRede = (Get-Date).AddMinutes(5)
  while ((Get-Date) -lt $deadlineRede) {
    try {
      $runnersResp = Invoke-RestMethod -Uri "https://api.github.com/repos/$RepoOwner/$RepoName/actions/runners" -Headers $headers -TimeoutSec 20
      $runner = $runnersResp.runners | Where-Object { $_.name -eq $RunnerName } | Select-Object -First 1
      if ($runner -and $runner.status -eq "online") {
        $runnerOnline = $true
        break
      }
      Write-Log "Aguardando runner '$RunnerName' ficar online (atual: $($runner.status))..."
    } catch {
      Write-Log "Rede/SSL ainda nao disponivel para api.github.com: $($_.Exception.Message)"
    }
    Start-Sleep -Seconds 10
  }

  if (-not $runnerOnline) {
    throw "Runner '$RunnerName' nao ficou online em 5 minutos."
  }
  Write-Log "Runner '$RunnerName' online."

  # Verifica se ja existe execucao hoje (ativa ou concluida com sucesso)
  $runsUri = "https://api.github.com/repos/$RepoOwner/$RepoName/actions/workflows/$WorkflowFile/runs?per_page=10"
  $runsResp = Invoke-RestMethod -Uri $runsUri -Headers $headers -TimeoutSec 20
  $runsHoje = @()
  foreach ($r in $runsResp.workflow_runs) {
    $dataLocal = [DateTimeOffset]::Parse($r.created_at).ToLocalTime().Date
    if ($dataLocal -eq $agora.Date) {
      $runsHoje += $r
    }
  }

  $runAlvo = $runsHoje | Where-Object { $_.status -in @("queued", "in_progress") } | Select-Object -First 1

  if (-not $runAlvo -and -not $Force) {
    $runOk = $runsHoje | Where-Object { $_.status -eq "completed" -and $_.conclusion -eq "success" } | Select-Object -First 1
    if ($runOk) {
      Write-Log "Execucao #$($runOk.id) ja concluida com sucesso hoje. Sincronizando repositorio local."
      Set-Content -Path $StampFile -Value $hojeStr -Encoding ASCII
      $runAlvo = $runOk
    }
  }

  if (-not $runAlvo) {
    $antesDisparo = [DateTimeOffset]::UtcNow.AddSeconds(-5)
    $dispatchUri = "https://api.github.com/repos/$RepoOwner/$RepoName/actions/workflows/$WorkflowFile/dispatches"
    $body = '{"ref":"main"}'
    Invoke-RestMethod -Method Post -Uri $dispatchUri -Headers $headers -Body $body -ContentType "application/json" -TimeoutSec 20 | Out-Null
    Write-Log "Workflow '$WorkflowFile' disparado via workflow_dispatch."

    # Localiza o run recem-criado (ate 60s)
    $deadlineFind = (Get-Date).AddSeconds(60)
    while ((Get-Date) -lt $deadlineFind) {
      Start-Sleep -Seconds 5
      $recentes = Invoke-RestMethod -Uri "$runsUri&event=workflow_dispatch" -Headers $headers -TimeoutSec 20
      foreach ($r in $recentes.workflow_runs) {
        if ([DateTimeOffset]::Parse($r.created_at) -ge $antesDisparo) {
          $runAlvo = $r
          break
        }
      }
      if ($runAlvo) { break }
    }

    if (-not $runAlvo) {
      throw "Workflow disparado, mas nao foi possivel localizar a execucao na API."
    }
    Write-Log "Acompanhando execucao #$($runAlvo.id) ($($runAlvo.html_url))."
  }

  # Aguarda conclusao da execucao (ate 35 min por conta de eventual espera de manutencao do SICAF)
  $deadlineRun = (Get-Date).AddMinutes(35)
  while ($runAlvo.status -ne "completed" -and (Get-Date) -lt $deadlineRun) {
    Start-Sleep -Seconds 15
    $runAlvo = Invoke-RestMethod -Uri "https://api.github.com/repos/$RepoOwner/$RepoName/actions/runs/$($runAlvo.id)" -Headers $headers -TimeoutSec 20
  }

  if ($runAlvo.status -ne "completed") {
    throw "Execucao #$($runAlvo.id) nao concluiu dentro do tempo limite."
  }

  Write-Log "Execucao #$($runAlvo.id) finalizada com conclusion=$($runAlvo.conclusion)."
  if ($runAlvo.conclusion -ne "success") {
    throw "Execucao #$($runAlvo.id) falhou (conclusion=$($runAlvo.conclusion))."
  }

  Set-Content -Path $StampFile -Value $hojeStr -Encoding ASCII

  # Atualiza o repositorio local usado pelo localhost se estiver limpo
  if (Test-Path $RepoDir) {
    Push-Location $RepoDir
    try {
      Invoke-Git fetch origin main | Out-Null
      $dirty = Invoke-Git status --porcelain
      if ($dirty) {
        Write-Log "Repositorio local com alteracoes nao commitadas; git pull ignorado para nao sobrescrever trabalho local."
      } else {
        $pullOut = Invoke-Git pull --ff-only origin main
        Write-Log "Repositorio local atualizado: $($pullOut -join ' | ')"
      }
    } finally {
      Pop-Location
    }
  }
} catch {
  Write-Log "ERRO: $($_.Exception.Message)"
  exit 1
} finally {
  $mutex.ReleaseMutex()
  $mutex.Dispose()
}
