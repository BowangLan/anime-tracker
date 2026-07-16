import { CalendarClock } from "lucide-react";

export function EmptyState({
  onlyFollowing,
  hasQuery,
  onClear,
}: {
  onlyFollowing: boolean;
  hasQuery: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[16px] border border-dashed border-[var(--fr-hairline)] py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--fr-surface-1)]">
        <CalendarClock className="h-6 w-6 text-[var(--fr-ink-muted)]" />
      </div>
      <div className="max-w-xs">
        <p className="text-[15px] font-medium text-[var(--fr-ink)]">
          {hasQuery
            ? onlyFollowing
              ? "No favorites match your search"
              : "No shows match your search"
            : onlyFollowing
              ? "You don't have any airing favorites yet"
              : "Nothing airing right now"}
        </p>
        <p className="mt-1 text-[13px] text-[var(--fr-ink-muted)]">
          {hasQuery
            ? "Try another title, alternate name, or spelling."
            : onlyFollowing
              ? "Turn off Favorites only to browse and add some."
              : "Check back when the next season begins."}
        </p>
      </div>
      {(onlyFollowing || hasQuery) && (
        <button
          onClick={onClear}
          className="rounded-full bg-[var(--fr-surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--fr-ink)] transition hover:bg-white/10"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
