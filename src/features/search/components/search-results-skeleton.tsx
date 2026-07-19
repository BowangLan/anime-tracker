import { Skeleton } from "@/components/common/skeleton";

export function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="flex min-h-[128px] gap-3 rounded-[14px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] p-2.5">
          <Skeleton className="aspect-[2/3] w-[70px] shrink-0 rounded-[8px]" />
          <div className="flex flex-1 flex-col py-1">
            <Skeleton className="h-2.5 w-20 rounded-full" />
            <Skeleton className="mt-3 h-3.5 w-[88%] rounded-full" />
            <Skeleton className="mt-1.5 h-3.5 w-[62%] rounded-full" />
            <Skeleton className="mt-2 h-2.5 w-24 rounded-full" />
            <div className="mt-auto flex gap-2">
              <Skeleton className="h-2.5 w-9 rounded-full" />
              <Skeleton className="h-2.5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
