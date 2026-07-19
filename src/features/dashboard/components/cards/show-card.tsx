"use client";

import { animePath } from "@/lib/site";
import { CalendarClock, Play, Tv } from "lucide-react";
import type { AiringAnime } from "@/lib/anilist";
import { cn } from "@/lib/utils";
import {
  AnimeCard,
  AnimeCardBody,
  AnimeCardEpisode,
  AnimeCardList,
  AnimeCardMedia,
  AnimeCardMeta,
  AnimeCardOverlay,
  AnimeCardTitle,
} from "@/components/anime/anime-card";
import { WatchedButton } from "@/components/common/watched-button";
import { useWatchedEpisode } from "@/hooks/use-watched-episodes";

export interface ShowCardData {
  anime: AiringAnime;
  episode: number;
  releaseLabel: string;
  isPast: boolean;
}

export function AnimeShowCard({ entry, className, eager = false }: { entry: ShowCardData; className?: string; eager?: boolean }) {
  const { anime, episode, releaseLabel } = entry;
  const { watched } = useWatchedEpisode(anime.id, episode);
  const needsAttention = entry.isPast && !watched;
  const href = animePath(anime.id, anime.title);

  return (
    <AnimeCard emphasis={needsAttention ? "attention" : "default"} className={className}>
      <AnimeCardMedia
        href={href}
        src={anime.coverImage}
        sizes="(max-width: 640px) 68vw, (max-width: 1100px) 32vw, 250px"
        eager={eager}
        size="feature"
        className="focus-visible:ring-1 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--fr-canvas)]"
      >
        <AnimeCardOverlay className="flex items-end justify-between gap-2 pt-14">
          <div className="flex min-w-0 items-center gap-2">
            <AnimeCardEpisode>
                <Play className="h-3 w-3 fill-current" /> EP {episode}
            </AnimeCardEpisode>
            {anime.totalEpisodes && (
              <AnimeCardEpisode tone="muted">/ {anime.totalEpisodes}</AnimeCardEpisode>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-normal leading-[1.2] text-[var(--fr-ink-muted)]">
            <Tv className="h-3.5 w-3.5" /> TV
          </span>
        </AnimeCardOverlay>
      </AnimeCardMedia>

      <AnimeCardBody>
        <AnimeCardTitle href={href} className="leading-[1.4]">
          {anime.title}
        </AnimeCardTitle>
        <AnimeCardMeta className={cn("mt-2 text-[12px] leading-[1.2] tracking-[-0.12px]", needsAttention && "text-[var(--fr-ink)]")}>
          <CalendarClock className="h-3.5 w-3.5" /> {entry.isPast && !watched ? `Episode ${episode} ready to watch` : releaseLabel}
        </AnimeCardMeta>
      </AnimeCardBody>
      {entry.isPast && <WatchedButton animeId={anime.id} episode={episode} compact className="absolute right-2.5 top-2.5" />}
    </AnimeCard>
  );
}

export function AnimeShowGrid({ shows, className }: { shows: ShowCardData[]; className?: string }) {
  return (
    <AnimeCardList layout="splitGrid" className={className}>
      {shows.map((show) => <AnimeShowCard key={show.anime.id} entry={show} />)}
    </AnimeCardList>
  );
}

export function HorizontalAnimeList({ shows }: { shows: ShowCardData[] }) {
  return (
    <AnimeCardList layout="rail">
      {shows.map((show, index) => (
        <AnimeShowCard
          key={show.anime.id}
          entry={show}
          eager={index < 3}
        />
      ))}
    </AnimeCardList>
  );
}
