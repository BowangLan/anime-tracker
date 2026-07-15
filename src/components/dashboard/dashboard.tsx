"use client";

import { useMemo, useRef, useState } from "react";
import type { AiringAnime, Weekday } from "@/lib/anilist";
import { useNow } from "@/lib/use-now";
import { useFollows } from "@/lib/store";
import { buildBoardModel } from "./model";
import { useAnimeSearch } from "./use-anime-search";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Stats } from "./stats";
import { WeekBoard } from "./week-board";
import { BoardSkeleton } from "./board-skeleton";
import { SearchResults } from "./search/search-results";
import { NewReleasesSection } from "./new-releases-section";
import { CurrentlyPopularSection } from "./currently-popular-section";
import { FavoritesSection } from "./favorites-section";

export function Dashboard({ anime }: { anime: AiringAnime[] }) {
  const now = useNow();
  const following = useFollows((s) => s.following);
  const [onlyFollowing, setOnlyFollowing] = useState(true);
  const columnRefs = useRef<Map<Weekday, HTMLElement | null>>(new Map());

  const search = useAnimeSearch();

  // Time-based, so it waits for the client clock (see BoardSkeleton fallback).
  const model = useMemo(
    () => (now == null ? null : buildBoardModel(anime, now, onlyFollowing, following)),
    [anime, now, onlyFollowing, following],
  );

  const scrollToDay = (day: Weekday) =>
    columnRefs.current
      .get(day)
      ?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });

  return (
    <div className="flex min-h-screen bg-[var(--fr-canvas)]">
      <Sidebar
        model={model}
        onlyFollowing={onlyFollowing}
        onOnlyFollowingChange={setOnlyFollowing}
        onNavigate={scrollToDay}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <Topbar
          query={search.query}
          onQueryChange={search.updateQuery}
          isSearching={search.isSearching}
          onClear={search.clearSearch}
          onlyFollowing={onlyFollowing}
          onOnlyFollowingChange={setOnlyFollowing}
        />

        {model == null ? (
          <BoardSkeleton />
        ) : search.isSearching ? (
          <SearchResults
            results={search.results}
            query={search.searchQuery}
            now={now!}
            state={search.state}
            error={search.error}
            onClear={search.clearSearch}
          />
        ) : (
          <div className="flex min-w-0 flex-col gap-6 p-5">
            <Stats model={model} />
            <FavoritesSection anime={anime} following={following} now={now!} />
            <div className="grid min-w-0 gap-[30px] xl:h-[440px] xl:grid-cols-[minmax(0,1fr)_310px]">
              <NewReleasesSection anime={anime} now={now!} />
              <CurrentlyPopularSection anime={anime} now={now!} />
            </div>
            <WeekBoard
              model={model}
              now={now!}
              onlyFollowing={onlyFollowing}
              hasQuery={search.query.trim().length > 0}
              onClear={() => {
                setOnlyFollowing(false);
                search.clearSearch();
              }}
              columnRefs={columnRefs}
            />
          </div>
        )}
      </main>
    </div>
  );
}
