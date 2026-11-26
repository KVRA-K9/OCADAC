"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Filter, Loader2, RotateCcw } from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { FiltrosOrcamento } from "@/lib/types";
import {
  OPCAO_MES_ATUAL,
  OPCAO_TODOS,
  anoPadrao,
  anosDisponiveis,
  mesesDisponiveis,
  orgaosDisponiveis,
} from "@/data/base-ocad";
import { EIXOS_OCAD, getEixosOcad } from "@/lib/conteudo-ocad";
import { useLocale, useT } from "@/lib/i18n";

const filtrosSchema = z.object({
  ano: z.string(),
  ateMes: z.string(),
  funcao: z.array(z.string()),
  categoriaEconomica: z.string(),
  secretaria: z.array(z.string()),
});

type FiltrosFormValues = z.infer<typeof filtrosSchema>;

const VALORES_PADRAO: FiltrosFormValues = {
  ano: anoPadrao,
  ateMes: OPCAO_MES_ATUAL,
  funcao: [],
  categoriaEconomica: OPCAO_TODOS,
  secretaria: [],
};

interface Opcao {
  value: string;
  label: string;
}

interface CampoSimples {
  type: "single";
  name: "ano" | "ateMes" | "categoriaEconomica";
  label: string;
  opcoes: Opcao[];
}

interface CampoMulti {
  type: "multi";
  name: "funcao" | "secretaria";
  label: string;
  opcoes: Opcao[];
  placeholder: string;
}

type Campo = CampoSimples | CampoMulti;

interface FiltersFormProps {
  onApply: (filtros: FiltrosOrcamento) => void;
  ocultar?: (keyof FiltrosOrcamento)[];
  carregando?: boolean;
  orgaos?: string[];
}

export function FiltersForm({
  onApply,
  ocultar = [],
  carregando = false,
  orgaos = orgaosDisponiveis,
}: FiltersFormProps) {
  const t = useT();
  const { locale } = useLocale();

  const form = useForm<FiltrosFormValues>({
    resolver: zodResolver(filtrosSchema),
    defaultValues: VALORES_PADRAO,
  });

  const anoSelecionado = form.watch("ano");

  React.useEffect(() => {
    const sub = form.watch((values) => {
      onApply(values as FiltrosOrcamento);
    });
    return () => sub.unsubscribe();
  }, [form, onApply]);

  const limpar = () => form.reset(VALORES_PADRAO);

  const eixos = getEixosOcad(locale);
  const formatadorMes = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-US" : "pt-BR", {
        month: "long",
        timeZone: "UTC",
      }),
    [locale],
  );

  const OPCOES_ANO: Opcao[] = anosDisponiveis
    .slice()
    .sort((a, b) => b - a)
    .map((a) => ({ value: String(a), label: String(a) }));

  const OPCOES_MES: Opcao[] = mesesDisponiveis
    .filter((c) => c.ano === Number(anoSelecionado))
    .map((c) => {
      const nomeMesBruto = formatadorMes.format(
        new Date(Date.UTC(c.ano, c.mes - 1, 1)),
      );
      const nomeMes =
        nomeMesBruto.charAt(0).toUpperCase() + nomeMesBruto.slice(1);
      const prefixo = locale === "en" ? "Through" : "Até";
      const sufixoAtual = c.ehAtual ? t.tabela.mesAtualSufixo : "";
      return {
        value: c.chave,
        label: `${prefixo} ${nomeMes}${sufixoAtual}`,
      };
    });

  const OPCOES_FUNCAO: Opcao[] = eixos.map((e, i) => ({
    value: EIXOS_OCAD[i].titulo,
    label: t.common.eixoRotulo(e.titulo),
  }));

  const OPCOES_CATEGORIA: Opcao[] = [
    { value: OPCAO_TODOS, label: t.tabela.todasAsClassificacoes },
    { value: "Exclusivo", label: t.common.categoriaRotulo("Exclusivo") },
    {
      value: "Não Exclusivo",
      label: t.common.categoriaRotulo("Não Exclusivo"),
    },
  ];

  const OPCOES_SECRETARIA: Opcao[] = orgaos.map((s) => ({
    value: s,
    label: s,
  }));

  const aoMudarSelect = (name: CampoSimples["name"], valor: string) => {
    if (name === "ano") {
      const mesMaisRecenteDoAno = mesesDisponiveis.find(
        (c) => c.ano === Number(valor),
      );
      form.reset({
        ...form.getValues(),
        ano: valor,
        ateMes: mesMaisRecenteDoAno?.chave ?? OPCAO_MES_ATUAL,
      });
      return;
    }
    form.setValue(name, valor);
  };

  const TODOS_CAMPOS: Campo[] = [
    { type: "single", name: "ano", label: t.tabela.ano, opcoes: OPCOES_ANO },
    {
      type: "single",
      name: "ateMes",
      label: t.tabela.ateMes,
      opcoes: OPCOES_MES,
    },
    {
      type: "multi",
      name: "funcao",
      label: t.tabela.eixo,
      opcoes: OPCOES_FUNCAO,
      placeholder: t.tabela.todosOsEixos,
    },
    {
      type: "single",
      name: "categoriaEconomica",
      label: t.tabela.classificacao,
      opcoes: OPCOES_CATEGORIA,
    },
    {
      type: "multi",
      name: "secretaria",
      label: t.tabela.secretaria,
      opcoes: OPCOES_SECRETARIA,
      placeholder: t.tabela.todasAsSecretarias,
    },
  ];

  const campos = TODOS_CAMPOS.filter((c) => !ocultar.includes(c.name));

  return (
    <Card className="border-sidebar bg-sidebar font-semibold text-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-foreground">
          <Filter className="size-4" />
          {t.tabela.filtros}
          <Loader2
            aria-hidden={!carregando}
            className={`size-3.5 animate-spin text-muted-foreground transition-opacity duration-200 ${
              carregando ? "opacity-100" : "opacity-0"
            }`}
          />
        </CardTitle>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={limpar}
            className="text-foreground hover:bg-foreground/10 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            {t.tabela.limparFiltros}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {campos.map((campo) => (
            <div key={campo.name} className="flex flex-col gap-1.5">
              <Label htmlFor={`filtro-${campo.name}`} className="text-foreground">{campo.label}</Label>
              {campo.type === "single" ? (
                <Controller
                  control={form.control}
                  name={campo.name}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => aoMudarSelect(campo.name, v)}
                    >
                      <SelectTrigger id={`filtro-${campo.name}`} className="w-full">
                        <SelectValue placeholder={campo.label} />
                      </SelectTrigger>
                      <SelectContent>
                        {campo.opcoes.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              ) : (
                <Controller
                  control={form.control}
                  name={campo.name}
                  render={({ field }) => (
                    <MultiSelect
                      id={`filtro-${campo.name}`}
                      opcoes={campo.opcoes}
                      values={field.value}
                      onChange={field.onChange}
                      placeholder={campo.placeholder}
                    />
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
