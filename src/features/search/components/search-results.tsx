import { AlertCircle, Radio, SearchX } from "lucide-react";
import type { AnimeSearchResult } from "@/lib/anilist";
import type { SearchState } from "@/features/search/hooks/use-anime-search";
import { SearchResultCard } from "./search-result-card";
import { SearchResultsSkeleton } from "./search-results-skeleton";
import { AnimeCardList } from "@/components/anime/anime-card";

export function SearchResults({
  results,
  query,
  now,
  state,
  error,
  onClear,
}: {
  results: AnimeSearchResult[];
  query: string;
  now: number;
  state: SearchState;
  error: string;
  onClear: () => void;
}) {
  const releasingCount = results.filter((anime) => anime.status === "RELEASING").length;

  return (
    <section aria-live="polite" aria-busy={state === "loading"}>
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-[var(--fr-hairline-soft)] pb-4">
        <div className="min-w-0">
          <p className="fr-eyebrow">Query</p>
          <h2 className="mt-1 truncate text-[22px] font-semibold tracking-[-0.035em] text-[var(--fr-ink)]">
            &ldquo;{query}&rdquo;
          </h2>
        </div>
        <p className="shrink-0 pb-0.5 text-[12px] tabular-nums text-[var(--fr-ink-muted)]">
          {state === "loading" ? "Searching AniList…" : `${results.length} ${results.length === 1 ? "show" : "shows"}`}
        </p>
      </div>

      {state === "loading" ? (
        <SearchResultsSkeleton />
      ) : state === "error" ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed border-[var(--fr-hairline)] py-20 text-center">
          <AlertCircle className="h-6 w-6 text-[var(--fr-gradient-coral)]" />
          <p className="text-[14px] font-medium text-[var(--fr-ink)]">Couldn&apos;t search AniList</p>
          <p className="max-w-sm text-[13px] text-[var(--fr-ink-muted)]">{error}</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[16px] border border-dashed border-[var(--fr-hairline)] py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--fr-surface-1)]">
            <SearchX className="h-6 w-6 text-[var(--fr-ink-muted)]" aria-hidden="true" />
          </div>
          <div className="max-w-xs">
            <p className="text-[15px] font-medium text-[var(--fr-ink)]">No anime found</p>
            <p className="mt-1 text-[13px] text-[var(--fr-ink-muted)]">
              Try a different title, alternate spelling, or fewer keywords.
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full bg-[var(--fr-surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--fr-ink)] outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {releasingCount > 0 && (
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium text-[var(--fr-accent-blue)]">
              <Radio className="h-3.5 w-3.5" />
              Airing titles are ranked first
            </div>
          )}
          <AnimeCardList layout="compactGrid">
            {results.map((anime) => (
              <SearchResultCard key={anime.id} anime={anime} now={now} />
            ))}
          </AnimeCardList>
        </>
      )}
    </section>
  );
}
