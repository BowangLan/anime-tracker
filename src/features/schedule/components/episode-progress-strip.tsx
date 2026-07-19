"use client";

import { useMemo } from "react";
import type { EpisodeAiring } from "@/lib/anilist";
import { useWatchedEpisodes } from "@/hooks/use-watched-episodes";
import { cn } from "@/lib/utils";

const MAX_EPISODES = 60;

export function EpisodeProgressStrip({
  animeId,
  schedule,
  totalEpisodes,
  now,
  activeEpisode,
  compact = false,
  className,
}: {
  animeId: number;
  schedule: EpisodeAiring[];
  totalEpisodes: number | null;
  now: number;
  activeEpisode?: number | null;
  compact?: boolean;
  className?: string;
}) {
  const { isWatched, toggleWatched } = useWatchedEpisodes(animeId);
  const scheduleByEpisode = useMemo(
    () => new Map(schedule.map((episode) => [episode.episode, episode])),
    [schedule],
  );
  const lastKnownEpisode = schedule.at(-1)?.episode ?? 0;
  const episodeCount = Math.min(
    MAX_EPISODES,
    Math.max(totalEpisodes ?? 0, lastKnownEpisode),
  );

  if (episodeCount === 0) return null;

  return (
    <div
      className={cn(
        "no-scrollbar flex max-w-full items-center gap-1 overflow-x-auto py-1",
        className,
      )}
      aria-label="Season episode progress"
    >
      {Array.from({ length: episodeCount }, (_, index) => index + 1).map(
        (episodeNumber) => {
          const airing = scheduleByEpisode.get(episodeNumber);
          const hasAired = airing != null && airing.airingAt * 1000 <= now;
          const watched = isWatched(episodeNumber);
          const active = episodeNumber === activeEpisode;

          return (
            <button
              key={episodeNumber}
              type="button"
              disabled={!hasAired}
              aria-pressed={watched}
              aria-label={`Episode ${episodeNumber}: ${watched ? "watched" : hasAired ? "unwatched" : "upcoming"}`}
              title={`Episode ${episodeNumber} · ${watched ? "Watched" : hasAired ? "Unwatched" : "Upcoming"}`}
              onClick={() => toggleWatched(episodeNumber)}
              className={cn(
                "relative grid shrink-0 place-items-center rounded-full border text-[10px] font-semibold tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]",
                compact ? "h-5 min-w-5 px-1" : "h-7 min-w-7 px-1.5",
                watched
                  ? "border-white bg-white text-black"
                  : hasAired
                    ? "border-white/45 bg-white/[0.04] text-white"
                    : "border-white/10 bg-white/[0.025] text-white/30",
                active &&
                  "border-[var(--fr-accent-blue)] bg-[color-mix(in_oklab,var(--fr-accent-blue)_18%,var(--fr-surface-1))] text-white ring-1 ring-[var(--fr-accent-blue)]/35",
                hasAired && "hover:border-white hover:bg-white hover:text-black",
              )}
            >
              {episodeNumber}
            </button>
          );
        },
      )}
    </div>
  );
}
