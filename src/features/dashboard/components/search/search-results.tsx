import { AlertCircle, Radio } from "lucide-react";
import type { AnimeSearchResult } from "@/lib/anilist";
import type { SearchState } from "@/features/dashboard/hooks/use-anime-search";
import { EmptyState } from "../empty-state";
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
    <section className="p-5" aria-live="polite" aria-busy={state === "loading"}>
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-[var(--fr-hairline-soft)] pb-4">
        <div className="min-w-0">
          <p className="fr-eyebrow">Search results</p>
          <h2 className="mt-1 truncate text-[22px] font-semibold tracking-[-0.035em] text-[var(--fr-ink)]">
            &ldquo;{query}&rdquo;
          </h2>
        </div>
        <p className="shrink-0 pb-0.5 text-[12px] tabular-nums text-[var(--fr-ink-muted)]">
          {state === "loading"
            ? "Searching AniList…"
            : `${results.length} ${results.length === 1 ? "show" : "shows"}`}
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
        <EmptyState onlyFollowing={false} hasQuery onClear={onClear} />
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
