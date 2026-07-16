"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AiringAnime } from "@/lib/anilist";
import { useNow } from "@/hooks/use-now";
import { useAnimeSearch } from "@/features/dashboard/hooks/use-anime-search";
import { SearchResults } from "@/features/dashboard/components/search/search-results";
import { PageHeader } from "@/components/app-shell/page-header";
import { DiscoveryCard } from "./discovery-card";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const featuredGenres = [
  "All",
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Romance",
  "Sci-Fi",
];

export function DiscoverPage({ anime }: { anime: AiringAnime[] }) {
  const now = useNow();
  const search = useAnimeSearch();
  const [sort, setSort] = useState("popular");
  const searchParams = useSearchParams();
  const selectedGenre = searchParams.get("genre") ?? "All";
  const setGenre = (genre: string) => {
    const params = new URLSearchParams(window.location.search);
    if (genre === "All") params.delete("genre");
    else params.set("genre", genre);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params.size ? `?${params}` : ""}`,
    );
  };
  const filtered = (
    selectedGenre === "All"
      ? [...anime]
      : anime.filter((show) => show.genres.includes(selectedGenre))
  ).sort((a, b) =>
    sort === "title"
      ? a.title.localeCompare(b.title)
      : sort === "next"
        ? (a.next?.airingAt ?? Infinity) - (b.next?.airingAt ?? Infinity)
        : 0,
  );

  return (
    <main className="min-h-full">
      <PageHeader
        eyebrow="Catalog"
        title="Discover anime"
        description="Search the full AniList catalog or filter the current airing season"
      />

      <div>
        <div className="sticky top-14 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-8 lg:top-0 lg:px-7">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fr-ink-muted)]" />
              <input
                value={search.query}
                onChange={(event) => search.updateQuery(event.target.value)}
                placeholder="Search title, studio, or keyword"
                aria-label="Search anime titles"
                className="h-11 w-full rounded-[10px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] pl-10 pr-10 text-sm outline-none placeholder:text-[var(--fr-ink-muted)] focus:ring-2 focus:ring-[var(--fr-accent-blue)]/40 sm:h-9 sm:rounded-[8px] sm:pl-9 sm:pr-9 sm:text-[12px]"
              />
              {search.isSearching && (
                <button
                  type="button"
                  onClick={search.clearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[var(--fr-ink-muted)] hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {!search.isSearching && (
              <div className="flex items-center justify-between gap-3 sm:justify-start">
                <label className="flex min-w-0 items-center gap-2 text-xs text-[var(--fr-ink-muted)] sm:text-[11px]">
                  Sort{" "}
                  <Select value={sort} onValueChange={(value) => setSort(value ?? "popular")}>
                    <SelectTrigger className="h-9 min-w-32 sm:h-8">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Popularity</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="next">Next release</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <span className="shrink-0 text-xs tabular-nums text-[var(--fr-ink-muted)] sm:text-[11px]">
                  {filtered.length} results
                </span>
              </div>
            )}
          </div>
          {!search.isSearching && (
            <div className="no-scrollbar -mx-4 mt-3 flex snap-x gap-2 overflow-x-auto px-4 pb-0.5 sm:-mx-8 sm:gap-1.5 sm:px-8 lg:-mx-7 lg:px-7">
              {featuredGenres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setGenre(genre)}
                  className={cn(
                    "shrink-0 snap-start rounded-[7px] border px-3 py-2 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60 sm:rounded-[6px] sm:px-2.5 sm:py-1.5 sm:text-[11px]",
                    genre === selectedGenre
                      ? "border-white/20 bg-white text-black"
                      : "border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] text-[var(--fr-ink-muted)] hover:text-white",
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          )}
        </div>

        {search.isSearching ? (
          <SearchResults
            results={search.results}
            query={search.searchQuery}
            now={now ?? 0}
            state={search.state}
            error={search.error}
            onClear={search.clearSearch}
          />
        ) : (
          <div className="px-4 py-5 sm:px-8 lg:px-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold">Currently airing</h2>
              <span className="text-[10px] uppercase tracking-[0.08em] text-[var(--fr-ink-muted)]">
                Current season
              </span>
            </div>
            <div className="grid grid-cols-2 items-start gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filtered.slice(0, 30).map((show, index) => (
                <DiscoveryCard key={show.id} anime={show} eager={index < 8} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
