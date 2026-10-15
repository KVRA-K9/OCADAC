import { cn } from "@/lib/utils";

interface PageHeaderProps {
  titulo: string;
  descricao?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ titulo, descricao, className, children }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-[#ede3b4] p-4 text-accent-foreground ring-1 ring-[#ede3b4]/30",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {titulo}
        </h1>
        {descricao && (
          <p className="text-sm opacity-80">{descricao}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
