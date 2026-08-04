# Conciliação OCAD 2026 — ROCA publicado × base orçamentária

Apuração da divergência entre o total do Orçamento Criança e Adolescente
publicado no ROCA 2026 e o total da base orçamentária do Estado.

Base vigente: `orcamentos-tematicos-visao-geral-2026-08-04 (2).xlsx`, 139 ações,
data de corte 04/08/2026. É a fonte única do site.

| Fonte | Total OCAD 2026 |
|---|---|
| Painel de orçamentos temáticos — export (2) de 04/08/2026 | **R$ 3.273.033.860,54** |
| Planilha OCAD 05.2026 (instantâneo anterior) | R$ 3.250.119.500,55 |
| ROCA 2026, Tabela 4 | R$ 3.336.053.795,37 |
| | **Diferença para o ROCA: R$ 63.019.934,82** |

A ponderação é idêntica nas duas fontes e **não** é causa de divergência: ações
não exclusivas entram a 36% (população de 0 a 19 anos, metodologia da Fundação
Abrinq) e exclusivas, integralmente. A planilha (2) foi conferida linha a linha:
**zero inconsistências** entre `dotação × ponderador` e os valores ponderados,
nas três colunas (planejado, atualizado e liquidado).

A diferença para a planilha 05.2026 é de R$ 22.914.360,00 e se explica
integralmente por uma ação acrescentada desde então — ver item 1.

## Onde está a diferença

Usando os eixos como o próprio ROCA os define — Eixo I: educação, cultura,
desporto e lazer; Eixo II: saúde, habitação e saneamento; Eixo III: assistência
social e direitos da cidadania:

| Eixo (funções) | ROCA | Base | Δ |
|---|---|---|---|
| Saúde (10, 16, 17) | 863.559.784,65 | 796.736.584,65 | **+66.823.200,00** |
| Assistência Social (08, 14) | 86.850.757,92 | 85.261.277,92 | +1.589.480,00 |
| Educação (12, 13, 27) | 2.385.643.252,80 | 2.391.035.997,97 | −5.392.745,17 |
| **Total** | | | **+63.019.934,83** |

A soma fecha exatamente com a diferença dos totais.

## Situação dos três achados anteriores

### 1. Folha de pagamento da SESACRE — RESOLVIDO

A ação `10302228920700000` aparece em duas unidades do ROCA. Não é duplicidade:
as duas parcelas são classificadas e ambas devem ser contabilizadas. A planilha
(2) passou a trazer a segunda, e as fontes agora coincidem:

| | ROCA | Base (planilha 2) |
|---|---|---|
| `714/607` — SEAD | 398.898.777,04 | 398.898.777,04 |
| `721/607` — SESACRE/FUNDES | 22.914.360,00 | 22.914.360,00 |
| **Soma** | **421.813.137,04** | **421.813.137,04** |

Foi essa inclusão que elevou a base de R$ 3.250.119.500,55 para
R$ 3.273.033.860,54, reduzindo a diferença com o ROCA de R$ 85,9 mi para
R$ 63,0 mi.

A base traz ainda uma segunda ação em duas unidades — `10302228622060000`,
*Manutenção das Atividades Administrativas*, em `721/001` e `721/607` —
igualmente legítima.

### 2. Ponderação da SEMULHER — a base está correta; o relatório, não

Na planilha, a ação `14122228621770000` está **corretamente ponderada**:
R$ 3.557.000,00 × 0,36 = R$ 1.280.520,00. Nada a corrigir na base.

O erro está apenas no PDF do ROCA, pág. 43, que imprime na coluna
`OCAD INICIAL` o valor bruto:

```
14122228621770000 | 3.557.000,00 | NEX | Ref 36,0 | OCAD INICIAL 3.557.000,00
```

Confirmação independente: o `TOTAL SEMULHER` do ROCA é R$ 4.578.161,24 contra
R$ 2.301.681,24 da base — diferença de R$ 2.276.480,00, exatamente
`3.557.000,00 − 1.280.520,00`. Uma única linha explica toda a divergência da
unidade.

### 3. Ações com o mesmo código no relatório — ambas contabilizadas

São ações distintas, cada uma com seu código na base, e todas entram na
contagem. O que está errado é o código impresso no PDF em três linhas.

| Par | Na base | Valor | |
|---|---|---|---|
| PROVITA | `14422147012320000` | 741.600,00 | ambas contabilizadas |
| PPCAM | `14422147012330000` | 1.560.000,00 | ambas contabilizadas |
| Construção/reforma (IEPETC) | `12363143510230000` | 594.360,00 | ambas contabilizadas |
| Consolidação das Políticas para Mulheres | `14422146111460000` | 172.080,00 | ambas contabilizadas |
| Folha do IEPETC | `12362228920810000` | 1.999.818,80 | **só uma existe** |
| — | `12368228920810000` | — | **ausente da base** |

No PDF, a pág. 38 imprime o PPCAM com o código do PROVITA, e a pág. 43 imprime
a ação da SEMULHER com o código do IEPETC — por isso uma varredura automática
as acusa como "mesma ação em duas unidades". Não há dupla contagem de dinheiro.

**Pendência:** `12368228920810000` é impresso na pág. 22 do ROCA
(R$ 5.555.052,22 → R$ 1.999.818,80) e **não existe na planilha**. A base tem
`12362228920810000`, mesma ação e mesmo valor, diferindo no dígito da
subfunção — `368` contra `362`. Aqui não há duas ações a contabilizar: uma das
duas grafias está errada, e é preciso definir qual.

## O que ficou sem explicação

Com o item 1 resolvido, restam **R$ 63.019.934,82**, dos quais o achado 2
explica R$ 2.276.480,00. **Cerca de R$ 60,7 milhões seguem sem causa
identificada**, concentrados na Saúde — e a razão é de leitura, não de
apuração: as tabelas do PDF não são integralmente recuperáveis.

A leitura por célula recuperou 113 das 137 ações. Por bloco do relatório:

| Bloco | Lido | Impresso | |
|---|---|---|---|
| SESACRE (`607`+`302`+`714`) | 854.914.081,46 | 854.914.081,46 | reconcilia |
| ISE (`213`) | 56.032.865,19 | 56.032.865,19 | reconcilia |
| Habitação (`744`) | 4.048.143,19 | 4.048.143,19 | reconcilia |
| SEE (`001`+`601`) | 1.540.971.323,66 | 2.335.791.942,39 | incompleto |
| SEASDH (`760`+`608`+`606`) | 6.143.200,00 | 26.239.731,49 | incompleto |
| IEPETC (`212`) | 55.515.237,96 | 33.490.714,41 | incompleto |
| FEM (`303`) | 8.799.875,99 | 16.360.596,00 | incompleto |
| Saneamento (`754`) | 1.519.560,00 | 4.597.560,00 | incompleto |
| SEMULHER (`762`) | 4.434.161,24 | 4.578.161,24 | incompleto |

Conclusões exaustivas só se sustentam nos blocos que reconciliam. Nos demais,
os achados listados são reais mas a lista **não é necessariamente completa**.

Duas linhas descartadas por não conferirem com a base, e que portanto **não**
entram como achado: `12363143810250000` (IEPETC, pág. 22) e
`13392143212920000` (FEM, pág. 23). Em ambas a extração misturou a linha da
ação com uma de subtotal; a segunda, conferida à mão, está correta no relatório.

Para fechar os R$ 60,7 milhões restantes, o caminho direto é obter da SEPLAN a
planilha que originou o ROCA.

## Como refazer a apuração

```bash
npm run dados:visao-geral                                   # base do site
python scripts/extrair-roca.py caminho/ROCA-2026-FINAL.pdf  # tabelas do PDF
node scripts/conferir-roca.mjs                              # laudo
```

O PDF é o publicado em
<https://seplan.ac.gov.br/wp-content/uploads/2026/05/ROCA-2026-FINAL.pdf>.

`extrair-roca.py` depende de `pdfplumber`. O laudo declara, na seção 7, quais
blocos reconciliam — leia essa seção antes de tratar qualquer lista como
exaustiva.
