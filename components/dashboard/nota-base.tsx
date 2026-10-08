import { useFormat, useT } from "@/lib/i18n";
import { metaBase } from "@/data/base-ocad";

/**
 * Procedência dos números. Toda página que exibe valores declara de qual
 * planilha eles saíram — foi a ausência disso que permitiu, antes, duas páginas
 * mostrarem o mesmo exercício com números diferentes.
 */
export function NotaBase() {
  const t = useT();
  const { formatData } = useFormat();

  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      {t.painel.fonte}:{" "}
      <span className="font-medium">{metaBase.arquivoFonte}</span> —{" "}
      {t.painel.origemBase}.{" "}
      {t.painel.notaBaseArquivo(
        formatData(metaBase.dataArquivo),
        metaBase.acoes,
        metaBase.linhasFonte,
      )}{" "}
      {t.common.ponderacao()}
    </p>
  );
}
