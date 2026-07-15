"use client";

import { Search, X } from "lucide-react";
import { cue } from "@/lib/sound";
import { FavoritesSwitch } from "./favorites-switch";

export function Topbar({
  query,
  onQueryChange,
  isSearching,
  onClear,
  onlyFollowing,
  onOnlyFollowingChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  isSearching: boolean;
  onClear: () => void;
  onlyFollowing: boolean;
  onOnlyFollowingChange: (value: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--fr-hairline-soft)] bg-[var(--fr-canvas)]/85 px-5 py-3 backdrop-blur">
      <div>
        <h1 className="text-[18px] font-semibold leading-none" style={{ letterSpacing: "-0.03em" }}>
          Schedule dashboard
        </h1>
        <p className="mt-1 text-[12px] text-[var(--fr-ink-muted)]">
          Currently releasing anime, by update day
        </p>
      </div>
      <div className="relative ml-auto min-w-0 flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fr-ink-muted)]" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search AniList’s full catalog…"
          className="w-full rounded-full border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] py-2 pl-9 pr-9 text-[13px] text-[var(--fr-ink)] outline-none placeholder:text-[var(--fr-ink-muted)] focus:ring-2 focus:ring-[var(--fr-accent-blue)]/40"
        />
        {isSearching && (
          <button
            type="button"
            onClick={() => {
              cue("tick");
              onClear();
            }}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[var(--fr-ink-muted)] transition hover:bg-white/10 hover:text-[var(--fr-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <FavoritesSwitch
        checked={onlyFollowing}
        onCheckedChange={onOnlyFollowingChange}
        compact
        className="lg:hidden"
      />
    </header>
  );
}
