"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Filter, RotateCcw } from "lucide-react";

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
  OPCAO_TODOS,
  anosDisponiveis,
  orgaosDisponiveis,
} from "@/data/base-ocad";
import { EIXOS_OCAD, getEixosOcad } from "@/lib/conteudo-ocad";
import { useLocale, useT } from "@/lib/i18n";

const filtrosSchema = z.object({
  ano: z.string(),
  funcao: z.array(z.string()),
  categoriaEconomica: z.string(),
  secretaria: z.array(z.string()),
});

type FiltrosFormValues = z.infer<typeof filtrosSchema>;

const VALORES_PADRAO: FiltrosFormValues = {
  ano: OPCAO_TODOS,
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
  name: "ano" | "categoriaEconomica";
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
}

export function FiltersForm({ onApply, ocultar = [] }: FiltersFormProps) {
  const t = useT();
  const { locale } = useLocale();

  const form = useForm<FiltrosFormValues>({
    resolver: zodResolver(filtrosSchema),
    defaultValues: VALORES_PADRAO,
  });

  React.useEffect(() => {
    const sub = form.watch((values) => {
      onApply(values as FiltrosOrcamento);
    });
    return () => sub.unsubscribe();
  }, [form, onApply]);

  const limpar = () => form.reset(VALORES_PADRAO);

  const eixos = getEixosOcad(locale);

  const OPCOES_ANO: Opcao[] = [
    { value: OPCAO_TODOS, label: t.tabela.todosOsAnos },
    ...anosDisponiveis
      .slice()
      .sort((a, b) => b - a)
      .map((a) => ({ value: String(a), label: String(a) })),
  ];

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

  const OPCOES_SECRETARIA: Opcao[] = orgaosDisponiveis.map((s) => ({
    value: s,
    label: s,
  }));

  const TODOS_CAMPOS: Campo[] = [
    { type: "single", name: "ano", label: t.tabela.ano, opcoes: OPCOES_ANO },
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {campos.map((campo) => (
            <div key={campo.name} className="flex flex-col gap-1.5">
              <Label htmlFor={`filtro-${campo.name}`} className="text-foreground">{campo.label}</Label>
              {campo.type === "single" ? (
                <Controller
                  control={form.control}
                  name={campo.name}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
