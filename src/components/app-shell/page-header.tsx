import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, description, action, className }: { eyebrow: string; title: string; description: string; action?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("flex min-h-[82px] flex-col gap-3 border-b border-[var(--fr-hairline-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 flex-none lg:px-7", className)}>
      <div className="min-w-0 max-w-3xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--fr-ink-muted)]">{eyebrow}</p>
        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <h1 className="shrink-0 text-[21px] font-semibold leading-tight tracking-[-0.035em] text-[var(--fr-ink)]">{title}</h1>
          <p className="truncate text-[12px] text-[var(--fr-ink-muted)]">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
