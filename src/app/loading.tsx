import { Search, Star, Tv } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[var(--fr-canvas)]" aria-label="Loading airing schedule">
      <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--fr-hairline-soft)] bg-[var(--fr-surface-1)]/40 p-4 lg:flex">
        <div className="flex items-center gap-2.5 px-1">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--fr-ink)] text-[var(--fr-canvas)]">
            <Tv className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.03em]">Airing</span>
        </div>
        <div className="mt-7 space-y-3 px-1">
          <Skeleton className="h-2.5 w-16 rounded-full" />
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-full rounded-[8px]" />
          ))}
        </div>
        <div className="mt-7 flex items-center justify-between px-1 text-[13px] text-[var(--fr-ink-muted)]">
          <span className="flex items-center gap-2"><Star className="h-4 w-4" /> Favorites only</span>
          <Skeleton className="h-5 w-9 rounded-full" />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b border-[var(--fr-hairline-soft)] px-5 py-3">
          <div>
            <Skeleton className="h-[18px] w-40 rounded-full" />
            <Skeleton className="mt-2 h-2.5 w-52 rounded-full" />
          </div>
          <div className="relative ml-auto hidden w-full max-w-xs sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fr-ink-muted)]" />
            <div className="h-9 rounded-full border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)]" />
          </div>
        </header>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[92px] rounded-[14px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] p-4">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="mt-4 h-6 w-10 rounded-full" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-7 h-4 w-40 rounded-full" />
          <div className="mt-4 flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, column) => (
              <div key={column} className="w-[272px] shrink-0 space-y-2.5">
                <Skeleton className="h-11 rounded-[10px]" />
                {Array.from({ length: 3 }).map((_, card) => (
                  <div key={card} className="flex h-[96px] gap-3 rounded-[14px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] p-2.5">
                    <Skeleton className="h-full w-[50px] rounded-[8px]" />
                    <div className="flex-1 space-y-2 pt-1">
                      <Skeleton className="h-3 w-[85%] rounded-full" />
                      <Skeleton className="h-2.5 w-[55%] rounded-full" />
                      <Skeleton className="mt-5 h-2.5 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-white/[0.07] ${className ?? ""}`} />;
}
