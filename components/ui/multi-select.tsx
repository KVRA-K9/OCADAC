"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Opcao {
  value: string;
  label: string;
}

interface MultiSelectProps {
  opcoes: Opcao[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  id?: string;
  className?: string;
}

export function MultiSelect({
  opcoes,
  values,
  onChange,
  placeholder,
  id,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const selecionados = opcoes.filter((o) => values.includes(o.value));
  const label =
    selecionados.length === 0
      ? placeholder
      : selecionados.length === 1
        ? selecionados[0].label
        : `${selecionados.length} selecionados`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-content`}
className={cn(
            "group flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className,
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] max-w-[90vw] p-1" align="start">
        <div className="max-h-[280px] overflow-y-auto">
          <label
            htmlFor={`${id}-todos`}
            className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-muted"
          >
            <Checkbox
              id={`${id}-todos`}
              checked={values.length === 0}
              onCheckedChange={() => onChange([])}
              className="mt-0.5 shrink-0"
            />
            <span className="leading-snug">{placeholder}</span>
          </label>
          {opcoes.map((o) => (
            <label
              key={o.value}
              htmlFor={`${id}-${o.value}`}
              className="flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-muted"
            >
              <Checkbox
                id={`${id}-${o.value}`}
                checked={values.includes(o.value)}
                onCheckedChange={() => toggle(o.value)}
                className="mt-0.5 shrink-0"
              />
              <span className="leading-snug">{o.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
