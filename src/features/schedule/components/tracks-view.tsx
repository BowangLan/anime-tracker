"use client";

import Image from "next/image";
import Link from "next/link";
import type { AiringAnime, EpisodeAiring } from "@/lib/anilist";
import type { BoardModel } from "@/features/dashboard/lib/board-model";
import { dayLabel } from "@/features/dashboard/lib/board-model";
import { episodeOnLocalDate } from "@/lib/schedule";
import { animePath } from "@/lib/site";
import { useWatchedEpisode } from "@/hooks/use-watched-episodes";
import { cn } from "@/lib/utils";
import { EpisodeProgressStrip } from "./episode-progress-strip";

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function dateForOffset(now: number, offset: number) {
  const date = new Date(now);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

export function TracksView({ model, now }: { model: BoardModel; now: number }) {
  const dates = model.order.map((_, offset) => dateForOffset(now, offset));
  const activeTracks = model.results.filter(({ anime }) =>
    dates.some((date) => episodeOnLocalDate(anime.schedule, date)),
  );

  return (
    <div className="h-full overflow-auto">
      <div className="min-w-[1040px] pb-16">
        <div className="sticky top-0 z-30 grid grid-cols-[280px_repeat(7,minmax(108px,1fr))] border-b border-[var(--fr-hairline)] bg-[var(--fr-canvas)]/95 backdrop-blur-xl">
          <div className="sticky left-0 z-10 flex items-end bg-[var(--fr-canvas)] px-6 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fr-ink-muted)]">Season tracks</p>
              <p className="mt-1 text-[12px] text-white/65">One show, one continuous lane</p>
            </div>
          </div>
          {model.order.map((day, offset) => {
            const isToday = day === model.today;
            return (
              <div key={day} className={cn("border-l border-[var(--fr-hairline-soft)] px-3 py-4", isToday && "bg-[var(--fr-accent-blue)]/[0.07]") }>
                <p className={cn("text-[11px] font-semibold", isToday ? "text-[var(--fr-accent-blue)]" : "text-white/70")}>{isToday ? "Today" : dayLabel(day, model.today).name.slice(0, 3)}</p>
                <p className="mt-1 text-[10px] tabular-nums text-[var(--fr-ink-muted)]">{shortDateFormatter.format(dates[offset])}</p>
              </div>
            );
          })}
        </div>

        <div>
          {activeTracks.map(({ anime }) => (
            <TrackRow key={anime.id} anime={anime} dates={dates} now={now} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackRow({ anime, dates, now }: { anime: AiringAnime; dates: Date[]; now: number }) {
  const weekEpisodes = dates.map((date) => episodeOnLocalDate(anime.schedule, date));
  const activeEpisode = weekEpisodes.find((episode) => episode != null)?.episode ?? anime.next?.episode ?? null;

  return (
    <article className="group grid min-h-[112px] grid-cols-[280px_repeat(7,minmax(108px,1fr))] border-b border-[var(--fr-hairline-soft)] hover:bg-white/[0.018]">
      <div className="sticky left-0 z-20 flex gap-3 bg-[var(--fr-canvas)] px-6 py-4 group-hover:bg-[#0d0d0d]">
        <Link href={animePath(anime.id, anime.title)} className="relative h-[66px] w-[44px] shrink-0 overflow-hidden rounded-[7px] bg-[var(--fr-surface-2)]">
          <Image src={anime.coverImage} alt="" fill sizes="44px" className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={animePath(anime.id, anime.title)} className="line-clamp-2 text-[12px] font-semibold leading-tight hover:text-white/70">
            {anime.title}
          </Link>
          <p className="mt-1 text-[10px] text-[var(--fr-ink-muted)]">{anime.totalEpisodes ? `${anime.totalEpisodes} episode season` : "Episode count open"}</p>
          <EpisodeProgressStrip
            animeId={anime.id}
            schedule={anime.schedule}
            totalEpisodes={anime.totalEpisodes}
            now={now}
            activeEpisode={activeEpisode}
            compact
            className="mt-1 max-w-[180px]"
          />
        </div>
      </div>

      {weekEpisodes.map((episode, index) => (
        <div
          key={dates[index].toISOString()}
          className={cn(
            "flex items-center border-l border-[var(--fr-hairline-soft)] px-3 py-4",
            index === 0 && "bg-[var(--fr-accent-blue)]/[0.045]",
          )}
        >
          {episode ? <TrackEpisode animeId={anime.id} episode={episode} now={now} /> : <span className="mx-auto h-px w-4 bg-white/8" />}
        </div>
      ))}
    </article>
  );
}

function TrackEpisode({ animeId, episode, now }: { animeId: number; episode: EpisodeAiring; now: number }) {
  const { watched, toggleWatched } = useWatchedEpisode(animeId, episode.episode);
  const hasAired = episode.airingAt * 1000 <= now;

  return (
    <button
      type="button"
      disabled={!hasAired}
      aria-pressed={watched}
      onClick={toggleWatched}
      className={cn(
        "w-full rounded-[10px] border px-2 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]",
        watched
          ? "border-white bg-white text-black"
          : hasAired
            ? "border-white/35 bg-white/[0.04] hover:border-white"
            : "border-[var(--fr-accent-blue)]/40 bg-[var(--fr-accent-blue)]/[0.08]",
      )}
    >
      <span className="block text-[11px] font-bold tabular-nums">EP {episode.episode}</span>
      <span className={cn("mt-1 block text-[9px] tabular-nums", watched ? "text-black/55" : "text-white/45")}>{timeFormatter.format(episode.airingAt * 1000)}</span>
      <span className={cn("mt-2 block text-[9px] font-semibold uppercase tracking-[0.08em]", watched ? "text-black/70" : hasAired ? "text-white/65" : "text-[var(--fr-accent-blue)]")}>{watched ? "Watched" : hasAired ? "Mark watched" : "Upcoming"}</span>
    </button>
  );
}
