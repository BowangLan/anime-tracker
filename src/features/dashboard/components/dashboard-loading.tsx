import { Skeleton } from "@/components/common/skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen" aria-label="Loading anime tracker">
        <header className="flex min-h-[82px] items-center border-b border-[var(--fr-hairline-soft)] px-5 sm:px-8 lg:px-7">
          <div><Skeleton className="h-2.5 w-16 rounded-full" /><div className="mt-2 flex items-center gap-3"><Skeleton className="h-5 w-28 rounded-full" /><Skeleton className="h-2.5 w-52 rounded-full" /></div></div>
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
  );
}
