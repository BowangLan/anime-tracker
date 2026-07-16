import Image from "next/image";
import Link from "next/link";
import { CalendarClock, Play, Tv } from "lucide-react";
import type { AiringAnime } from "@/lib/anilist";
import { cn } from "@/lib/utils";

export interface ShowCardData {
  anime: AiringAnime;
  episode: number;
  releaseLabel: string;
}

export function AnimeShowCard({ entry, className, eager = false }: { entry: ShowCardData; className?: string; eager?: boolean }) {
  const { anime, episode, releaseLabel } = entry;

  return (
    <article className={cn("group min-w-0", className)}>
      <Link
        href={`/anime/${anime.id}`}
        className="block rounded-[15px] outline-none focus-visible:ring-1 focus-visible:ring-[var(--fr-accent-blue)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--fr-canvas)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[15px] bg-[var(--fr-surface-1)]">
          {anime.coverImage && (
            <Image
              src={anime.coverImage}
              alt=""
              fill
              loading={eager ? "eager" : "lazy"}
              sizes="(max-width: 640px) 68vw, (max-width: 1100px) 32vw, 250px"
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 pb-3 pt-14">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--fr-surface-2)] px-2 py-1 text-[12px] font-medium leading-[1.2] text-[var(--fr-ink)] backdrop-blur-md">
                <Play className="h-3 w-3 fill-current" /> EP {episode}
              </span>
              {anime.totalEpisodes && (
                <span className="rounded-[6px] bg-[var(--fr-surface-2)] px-2 py-1 text-[12px] font-normal leading-[1.2] text-[var(--fr-ink-muted)] backdrop-blur-md">
                  / {anime.totalEpisodes}
                </span>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-normal leading-[1.2] text-[var(--fr-ink-muted)]">
              <Tv className="h-3.5 w-3.5" /> TV
            </span>
          </div>
        </div>

        <h3 className="mt-3 line-clamp-2 text-[14px] font-medium leading-[1.4] tracking-[-0.14px] text-[var(--fr-ink)] transition-colors group-hover:text-[var(--fr-ink-muted)]">
          {anime.title}
        </h3>
        <p className="mt-2 flex items-center gap-2 text-[12px] leading-[1.2] tracking-[-0.12px] text-[var(--fr-ink-muted)]">
          <CalendarClock className="h-3.5 w-3.5" /> {releaseLabel}
        </p>
      </Link>
    </article>
  );
}

export function AnimeShowGrid({ shows, className }: { shows: ShowCardData[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-5 min-[810px]:grid-cols-2", className)}>
      {shows.map((show) => <AnimeShowCard key={show.anime.id} entry={show} />)}
    </div>
  );
}

export function HorizontalAnimeList({ shows }: { shows: ShowCardData[] }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-3 [scroll-padding-inline:20px]">
      {shows.map((show, index) => (
        <AnimeShowCard
          key={show.anime.id}
          entry={show}
          className="w-[70vw] max-w-[240px] shrink-0 snap-start min-[810px]:w-[220px]"
          eager={index < 3}
        />
      ))}
    </div>
  );
}
