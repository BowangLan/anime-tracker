/** Shown until the client clock is available (the board is time-based). */
export function BoardSkeleton() {
  return (
    <div className="animate-pulse p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[92px] rounded-[14px] bg-[var(--fr-surface-1)]" />
        ))}
      </div>
      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <div className="h-[168px] rounded-[18px] bg-[var(--fr-surface-1)] lg:col-span-2" />
        <div className="h-[168px] rounded-[18px] bg-[var(--fr-surface-1)]" />
      </div>
      <div className="mt-6 flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[272px] shrink-0 space-y-2.5">
            <div className="h-11 rounded-[10px] bg-[var(--fr-surface-1)]" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-[96px] rounded-[14px] bg-[var(--fr-surface-1)]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
