"use client";

import Image from "next/image";
import Link from "next/link";
import { animePath } from "@/lib/site";
import { Clock } from "lucide-react";
import type { AiringAnime, EpisodeAiring } from "@/lib/anilist";
import {
  type Airing,
  untilLabel,
} from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { ExternalLinksMenu } from "./external-links-menu";
import { FavoriteButton } from "./favorite-button";
import { WatchedButton } from "@/components/common/watched-button";
import { useAnimeWatchProgress } from "@/hooks/use-watched-episodes";

/**
 * Compact schedule row for a day column: cover, title, season progress, and the
 * countdown to the next drop. Chrome stays monochrome by design — the cover art
 * is the only color on the board, and the accent blue is reserved for the live
 * "airing now" beacon.
 */
export function AnimeCard({
  anime,
  airing,
  now,
  episode,
}: {
  anime: AiringAnime;
  airing: Airing;
  now: number;
  episode: EpisodeAiring | null;
}) {
  const total = anime.totalEpisodes;
  const countdown =
    airing.nextAiringAt != null ? untilLabel(airing.nextAiringAt, now) : null;
  const airingNow = countdown === "now";
  const { isWatched, unwatchedEpisodes, needsAttention } =
    useAnimeWatchProgress(anime.id, anime.schedule, now);
  const episodeIsPast = episode != null && episode.airingAt * 1000 <= now;
  const episodeWatched = episode != null && isWatched(episode.episode);

  return (
    <article
      className={cn(
        "group relative flex gap-3 rounded-[14px] border bg-[var(--fr-surface-1)] p-2.5 transition-colors hover:bg-[var(--fr-surface-2)]/60",
        needsAttention
          ? "border-foreground/30 hover:border-foreground/60"
          : "border-[var(--fr-hairline)] hover:border-foreground/15",
      )}
    >
      <Link
        href={animePath(anime.id, anime.title)}
        className="relative aspect-[2/3] w-[54px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--fr-surface-2)]"
      >
        {anime.coverImage && (
          <Image
            src={anime.coverImage}
            alt=""
            fill
            sizes="54px"
            className="object-cover"
          />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-1.5">
          <h3
            className={cn(
              "line-clamp-2 flex-1 text-[13px] font-semibold leading-tight text-[var(--fr-ink)]",
              needsAttention && "before:mr-1.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:align-middle",
            )}
            style={{ letterSpacing: "-0.01em" }}
            title={anime.title}
          >
            <Link
              href={animePath(anime.id, anime.title)}
              className="after:absolute after:inset-0 after:z-0 focus-visible:outline-none"
            >
              {anime.title}
            </Link>
          </h3>
          <div className="relative z-10 -mr-0.5 flex shrink-0 items-center">
            <ExternalLinksMenu links={anime.externalLinks} />
            <FavoriteButton
              animeId={anime.id}
              className="h-6 w-6 bg-transparent text-[var(--fr-ink-muted)] hover:bg-transparent hover:text-[var(--fr-ink)]"
            />
          </div>
        </div>

        <p className="truncate text-[11px] text-[var(--fr-ink-muted)]">
          {anime.studio}
        </p>

        {/* Status line + monochrome season progress */}
        <div className="mt-auto space-y-1.5 pt-1.5">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span
              className={cn(
                "tabular-nums",
                episodeIsPast && !episodeWatched
                  ? "font-bold text-[var(--fr-ink)]"
                  : "text-[var(--fr-ink-muted)]",
              )}
            >
              {episode
                ? `EP ${episode.episode}${total ? ` / ${total}` : ""}`
                : `EP ${airing.latestAired || "—"}${total ? ` / ${total}` : ""}`}
              {episode && (
                <span className="ml-1.5">
                  ·{" "}
                  {episodeIsPast
                    ? episodeWatched
                      ? "Watched"
                      : "Unwatched"
                    : "Upcoming"}
                </span>
              )}
            </span>

            {episode && episodeIsPast && (
              <WatchedButton
                animeId={anime.id}
                episode={episode.episode}
                compact
              />
            )}

            {!episodeIsPast && airingNow ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-[var(--fr-accent-blue)]">
                <span className="fr-live-dot h-1.5 w-1.5 rounded-full bg-current" />
                Airing now
              </span>
            ) : !episodeIsPast && countdown ? (
              <span
                className="inline-flex items-center gap-1 tabular-nums font-medium text-[var(--fr-ink)]"
                title={
                  airing.nextEpisode != null
                    ? `EP ${airing.nextEpisode} next`
                    : undefined
                }
              >
                <Clock className="h-3 w-3 text-[var(--fr-ink-muted)]" />
                {countdown}
              </span>
            ) : !episodeIsPast && !episode ? (
              <span className="text-[var(--fr-ink-muted)]">Finale aired</span>
            ) : null}
          </div>

          {needsAttention && (
            <p className="text-[11px] font-bold text-[var(--fr-ink)]">
              {unwatchedEpisodes.length}{" "}
              {unwatchedEpisodes.length === 1 ? "episode" : "episodes"} to catch up
            </p>
          )}

          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500",
                airingNow ? "bg-[var(--fr-accent-blue)]" : "bg-white/80",
              )}
              style={{ width: `${airing.progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
