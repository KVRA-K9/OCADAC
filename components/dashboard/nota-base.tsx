import { useFormat, useT } from "@/lib/i18n";
import { metaBase, origemBase, type MetaBase } from "@/data/base-ocad";

/**
 * Procedência dos números. Toda página que exibe valores declara de qual
 * fonte eles saíram — foi a ausência disso que permitiu, antes, duas páginas
 * mostrarem o mesmo exercício com números diferentes.
 */
export function NotaBase({ meta = metaBase }: { meta?: MetaBase }) {
  const t = useT();
  const { formatData } = useFormat();

  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      {t.painel.fonte}:{" "}
      <span className="font-medium">{meta.arquivoFonte}</span> —{" "}
      {origemBase(t.painel)}.{" "}
      {t.painel.notaBaseArquivo(
        formatData(meta.dataArquivo),
        meta.acoes,
        meta.linhasFonte,
      )}{" "}
      {t.common.ponderacao()}
    </p>
  );
}
