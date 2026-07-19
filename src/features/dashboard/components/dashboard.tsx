"use client";

import { useMemo } from "react";
import type { AiringAnime } from "@/lib/anilist";
import { useNow } from "@/hooks/use-now";
import { useFollows } from "@/stores/follows-store";
import { buildBoardModel } from "@/features/dashboard/lib/board-model";
import { Stats } from "./layout/stats";
import { BoardSkeleton } from "./board-skeleton";
import { CurrentlyPopularSection } from "./sections/currently-popular-section";
import { FavoritesSection } from "./sections/favorites-section";
import { PageHeader } from "@/components/app-shell/page-header";
import { AnimeCard } from "./cards/anime-card";
import { SectionHeader } from "./sections/section-header";
import { episodeOnLocalDate } from "@/lib/schedule";

export function Dashboard({ anime }: { anime: AiringAnime[] }) {
  const now = useNow();
  const following = useFollows((s) => s.following);

  // Time-based, so it waits for the client clock (see BoardSkeleton fallback).
  const model = useMemo(
    () => (now == null ? null : buildBoardModel(anime, now, false, following)),
    [anime, now, following],
  );

  return (
    <main className="min-h-screen max-h-screen overflow-y-auto flex flex-col">
      <PageHeader
        eyebrow="Dashboard"
        title="Current anime release schedule"
        description="Your currently airing season and followed shows"
      />
      {model == null ? (
        <BoardSkeleton />
      ) : (
        <div className="flex min-w-0 flex-col gap-7 px-5 py-5 sm:px-8 lg:px-7 flex-1 min-h-0 overflow-y-auto">
          <Stats model={model} />
          <FavoritesSection anime={anime} following={following} now={now!} />
          <div className="grid min-w-0 shrink-0 gap-7 xl:h-[520px] xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0 pr-1">
              <SectionHeader
                title="Today"
                description={`${model.todayCount} scheduled ${model.todayCount === 1 ? "release" : "releases"}`}
              />
              {model.todayCount > 0 ? (
                <div className="grid grid-flow-col grid-rows-3 snap-x snap-mandatory auto-cols-[minmax(340px,calc((100%-0.75rem)/2))] gap-3 overflow-x-auto overscroll-x-contain pb-2 [&>*]:snap-start">
                  {(model.byDay.get(model.today) ?? []).map((entry) => (
                    <AnimeCard
                      key={entry.anime.id}
                      anime={entry.anime}
                      airing={entry.airing}
                      now={now!}
                      episode={episodeOnLocalDate(entry.anime.schedule, new Date(now!))}
                      density="roomy"
                    />
                  ))}
                </div>
              ) : (
                <p className="py-12 text-center text-[12px] text-[var(--fr-ink-muted)]">
                  No releases scheduled today.
                </p>
              )}
            </section>
            <CurrentlyPopularSection anime={anime} now={now!} />
          </div>
        </div>
      )}
    </main>
  );
}
