/** Shown until the client clock is available (the board is time-based). */
export function BoardSkeleton() {
  return (
    <div className="animate-pulse p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[92px] rounded-[14px] bg-[var(--fr-surface-1)]" />
        ))}
      </div>
      <div className="mt-6 flex gap-5 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-[225px] w-[150px] shrink-0 rounded-[15px] bg-[var(--fr-surface-1)]" />
        ))}
      </div>
      <div className="mt-6 grid gap-[30px] xl:h-[440px] xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="h-[330px] rounded-[15px] bg-[var(--fr-surface-1)]" />
        <div className="h-[440px] bg-[var(--fr-surface-1)]" />
      </div>
      <div className="mt-6 flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[272px] shrink-0 space-y-2.5">
            <div className="h-11 rounded-[10px] bg-[var(--fr-surface-1)]" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-[96px] rounded-[15px] bg-[var(--fr-surface-1)]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
