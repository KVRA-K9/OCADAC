import { useT } from "@/lib/i18n";
import { dataBase, metaBase } from "@/data/base-ocad";

/**
 * Procedência dos números. Toda página que exibe valores declara de qual
 * planilha eles saíram — foi a ausência disso que permitiu, antes, duas páginas
 * mostrarem o mesmo exercício com números diferentes.
 */
export function NotaBase() {
  const t = useT();

  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      {t.painel.fonte}:{" "}
      <span className="font-medium">{metaBase.arquivoFonte}</span> —{" "}
      {metaBase.origem}.{" "}
      {t.painel.notaBaseArquivo(
        dataBase,
        metaBase.acoes,
        metaBase.linhasFonte,
      )}{" "}
      {t.common.ponderacao()}
    </p>
  );
}
