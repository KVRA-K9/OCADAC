import { PONDERACAO, dataBase, metaBase } from "@/data/base-ocad";

/**
 * Procedência dos números. Toda página que exibe valores declara de qual
 * planilha eles saíram — foi a ausência disso que permitiu, antes, duas páginas
 * mostrarem o mesmo exercício com números diferentes.
 */
export function NotaBase() {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Fonte: <span className="font-medium">{metaBase.arquivoFonte}</span> —{" "}
      {metaBase.origem}. Arquivo de {dataBase}, com {metaBase.acoes} ações
      consolidadas de {metaBase.linhasFonte} linhas por fonte de recurso.{" "}
      {PONDERACAO.descricao}
    </p>
  );
}
