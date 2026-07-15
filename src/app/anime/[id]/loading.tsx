import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/common/skeleton";

export default function AnimeDetailLoading() {
  return (
    <main
      className="min-h-screen overflow-hidden bg-[var(--fr-canvas)]"
      aria-label="Loading anime details"
    >
      <section className="relative min-h-[590px] border-b border-white/10 lg:min-h-[640px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,.07),transparent_42%)]" />

        <header className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-[1320px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-[12px] text-white/50">
            <ArrowLeft className="h-3.5 w-3.5" /> Weekly board
          </span>
          <Skeleton className="h-3 w-24 rounded-full" />
        </header>

        <div className="relative z-[1] mx-auto flex min-h-[590px] max-w-[1320px] items-end px-5 pb-9 pt-24 sm:px-8 lg:min-h-[640px] lg:px-10 lg:pb-11">
          <div className="grid w-full items-end gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-9">
            <Skeleton className="mx-auto aspect-[2/3] w-[155px] rounded-[16px] sm:w-[180px] lg:mx-0 lg:w-[200px]" />
            <div className="max-w-4xl">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="mt-5 h-14 w-[85%] max-w-2xl rounded-[12px] sm:h-20" />
              <Skeleton className="mt-3 h-3.5 w-52 rounded-full" />
              <div className="mt-6 flex gap-3">
                <Skeleton className="h-10 w-28 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
              <div className="mt-7 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-white/10 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[74px] bg-white/[0.025] p-4">
                    <Skeleton className="h-4 w-12 rounded-full" />
                    <Skeleton className="mt-2 h-2.5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10">
        <div>
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="mt-3 h-8 w-36 rounded-full" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-[94%] rounded-full" />
            <Skeleton className="h-4 w-[72%] rounded-full" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-[12px]" />
          ))}
        </div>
      </div>
    </main>
  );
}
