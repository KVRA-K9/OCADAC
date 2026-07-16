import { Section } from "@/components/landing/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EIXOS_OCAD } from "@/lib/conteudo-ocad";

export function Eixos() {
  return (
    <Section
      id="eixos"
      className="bg-muted/30"
      titulo="Eixos do OCAD"
      subtitulo="O orçamento está organizado em três eixos temáticos que reúnem funções correlatas, conforme a metodologia adotada pela Seplan/AC."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {EIXOS_OCAD.map((eixo) => (
          <Card key={eixo.titulo} className="border border-primary/40 ring-0 relative overflow-hidden">
            <eixo.icone
              className="pointer-events-none absolute -right-4 -bottom-4 size-32 opacity-25"
              style={{ color: eixo.cor }}
            />
            <CardHeader>
              <CardTitle>{eixo.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="relative flex flex-1 flex-col gap-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {eixo.descricao}
              </p>
              <div className="mt-auto flex flex-wrap gap-1.5">
                {eixo.abrange.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
