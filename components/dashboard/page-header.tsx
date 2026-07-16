import { cn } from "@/lib/utils";

interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  className?: string;
}

export function PageHeader({ titulo, descricao, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl bg-[#ede3b4] p-4 text-accent-foreground ring-1 ring-[#ede3b4]/30",
        className,
      )}
    >
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        {titulo}
      </h1>
      {descricao && (
        <p className="text-sm opacity-80">{descricao}</p>
      )}
    </div>
  );
}
