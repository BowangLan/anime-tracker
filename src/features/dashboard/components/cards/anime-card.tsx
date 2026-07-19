"use client";

import { animePath } from "@/lib/site";
import { Clock } from "lucide-react";
import type { AiringAnime, EpisodeAiring } from "@/lib/anilist";
import {
  type Airing,
  untilLabel,
} from "@/lib/schedule";
import { cn } from "@/lib/utils";
import {
  AnimeCard as AnimeCardRoot,
  AnimeCardActions,
  AnimeCardBody,
  AnimeCardDescription,
  AnimeCardHeader,
  AnimeCardMedia,
  AnimeCardMeta,
  AnimeCardTitle,
} from "@/components/anime/anime-card";
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
  const href = animePath(anime.id, anime.title);

  return (
    <AnimeCardRoot
      layout="compact"
      surface="outlined"
      emphasis={needsAttention ? "attention" : "default"}
    >
      <AnimeCardMedia href={href} src={anime.coverImage} sizes="54px" size="mini" />

      <AnimeCardBody layout="compact" className="gap-1">
        <AnimeCardHeader className="gap-1.5">
          <AnimeCardTitle
            href={href}
            size="sm"
            stretched
            className={cn(
              "flex-1",
              needsAttention && "before:mr-1.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:align-middle",
            )}
            title={anime.title}
          >
            {anime.title}
          </AnimeCardTitle>
          <AnimeCardActions className="-mr-0.5">
            <ExternalLinksMenu links={anime.externalLinks} />
            <FavoriteButton
              animeId={anime.id}
              className="h-6 w-6 bg-transparent text-[var(--fr-ink-muted)] hover:bg-transparent hover:text-[var(--fr-ink)]"
            />
          </AnimeCardActions>
        </AnimeCardHeader>

        <AnimeCardDescription className="mt-0">{anime.studio}</AnimeCardDescription>

        {/* Status line + monochrome season progress */}
        <div className="mt-auto space-y-1.5 pt-1.5">
          <AnimeCardMeta className="justify-between">
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
          </AnimeCardMeta>

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
      </AnimeCardBody>
    </AnimeCardRoot>
  );
}
