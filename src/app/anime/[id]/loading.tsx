import { PageHeader } from "@/components/app-shell/page-header";
import { Skeleton } from "@/components/common/skeleton";

export default function AnimeDetailLoading() {
  return (
    <main
      className="flex max-h-screen min-h-screen flex-col bg-[var(--fr-canvas)]"
      aria-label="Loading anime details"
      aria-busy="true"
    >
      <PageHeader
        showBackButton
        title="Loading anime…"
        description=""
        action={<Skeleton className="h-8 w-24 rounded-[8px]" />}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <section className="relative flex-none overflow-hidden border-b border-white/10 bg-[var(--fr-surface-1)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,.06),transparent_44%)]" />
          <div className="relative mx-auto grid max-w-[1180px] gap-5 px-5 py-6 sm:grid-cols-[128px_minmax(0,1fr)] sm:px-8 lg:grid-cols-[144px_minmax(0,1fr)_auto] lg:items-end lg:px-8 lg:py-8">
            <Skeleton className="mx-auto aspect-[2/3] w-28 rounded-[12px] sm:mx-0 sm:w-32 lg:w-36" />

            <div className="flex h-full min-w-0 flex-col gap-2.5">
              <Skeleton className="h-8 w-72 max-w-full rounded-[7px]" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-12 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48 rounded-full" />
              <div className="flex-1" />
              <div className="mt-5 flex gap-2.5">
                <Skeleton className="h-10 w-28 rounded-full" />
                <Skeleton className="h-10 w-20 rounded-[10px]" />
                <Skeleton className="h-10 w-16 rounded-[8px]" />
              </div>
            </div>

            <div className="col-span-full grid grid-cols-2 divide-x divide-y divide-white/8 overflow-hidden rounded-[12px] border border-white/8 bg-black/15 sm:col-start-2 sm:grid-cols-4 lg:col-span-1 lg:col-start-auto lg:w-[292px] lg:divide-y-0">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="px-3 py-3">
                  <Skeleton className="h-2 w-10 rounded-full" />
                  <Skeleton className="mt-2 h-4 w-14 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <nav aria-label="Loading page sections" className="sticky top-0 z-20 flex-none border-b border-white/8 bg-[var(--fr-canvas)]/92 backdrop-blur-xl">
          <div className="mx-auto flex h-[42px] max-w-[1180px] items-center gap-5 overflow-hidden px-5 sm:px-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-2.5 w-14 shrink-0 rounded-full" />
            ))}
          </div>
        </nav>

        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:px-8 lg:py-10">
          <div className="min-w-0 space-y-10">
            <section>
              <LoadingSectionHeading titleWidth="w-20" metaWidth="w-16" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-[94%] rounded-full" />
                <Skeleton className="h-3 w-[72%] rounded-full" />
              </div>
              <div className="mt-4 flex gap-1.5">
                <Skeleton className="h-6 w-16 rounded-[7px]" />
                <Skeleton className="h-6 w-20 rounded-[7px]" />
                <Skeleton className="h-6 w-14 rounded-[7px]" />
              </div>
            </section>

            <Skeleton className="h-[72px] w-full rounded-[12px]" />

            <section>
              <LoadingSectionHeading titleWidth="w-28" metaWidth="w-20" />
              <div className="mt-4 overflow-hidden rounded-[14px] border border-white/10">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex min-h-15 items-center gap-3 border-b border-white/8 px-4 py-3 last:border-0">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-3 w-44 max-w-[65%] rounded-full" />
                      <Skeleton className="mt-2 h-2 w-28 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-16 lg:self-start">
            <div className="rounded-[16px] border border-white/10 bg-white/[0.025] p-5">
              <Skeleton className="h-3 w-24 rounded-full" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex justify-between border-b border-white/8 pb-3">
                    <Skeleton className="h-2.5 w-14 rounded-full" />
                    <Skeleton className="h-2.5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function LoadingSectionHeading({ titleWidth, metaWidth }: { titleWidth: string; metaWidth: string }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-white/8 pb-3">
      <Skeleton className={`h-5 ${titleWidth} rounded-[5px]`} />
      <Skeleton className={`h-2.5 ${metaWidth} rounded-full`} />
    </div>
  );
}
