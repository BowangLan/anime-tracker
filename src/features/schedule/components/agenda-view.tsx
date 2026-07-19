"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import type { BoardModel, Entry } from "@/features/dashboard/lib/board-model";
import { dayLabel } from "@/features/dashboard/lib/board-model";
import { episodeOnLocalDate } from "@/lib/schedule";
import { animePath } from "@/lib/site";
import { WatchedButton } from "@/components/common/watched-button";
import { EpisodeProgressStrip } from "./episode-progress-strip";

const dayFormatter = new Intl.DateTimeFormat(undefined, {
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

export function AgendaView({ model, now }: { model: BoardModel; now: number }) {
  return (
    <div className="mx-auto w-full max-w-[1120px] space-y-10 px-5 pb-16 pt-5 sm:px-8">
      {model.order.map((day, offset) => {
        const entries = model.byDay.get(day) ?? [];
        const date = dateForOffset(now, offset);
        const scheduledEntries = entries.filter((entry) =>
          episodeOnLocalDate(entry.anime.schedule, date),
        );
        const isToday = day === model.today;
        return (
          <section key={day} aria-labelledby={`agenda-${day}`}>
            <div className="sticky top-0 z-20 -mx-2 flex items-end justify-between border-b border-[var(--fr-hairline)] bg-[var(--fr-canvas)]/95 px-2 pb-3 pt-2 backdrop-blur-xl">
              <div className="flex items-baseline gap-2.5">
                <h2 id={`agenda-${day}`} className="text-[18px] font-semibold tracking-[-0.035em]">
                  {isToday ? "Today" : dayLabel(day, model.today).name}
                </h2>
                <time className="text-[12px] text-[var(--fr-ink-muted)]">
                  {dayFormatter.format(date)}
                </time>
              </div>
              <span className="text-[11px] tabular-nums text-[var(--fr-ink-muted)]">
                {scheduledEntries.length} {scheduledEntries.length === 1 ? "episode" : "episodes"}
              </span>
            </div>

            {scheduledEntries.length === 0 ? (
              <p className="py-8 text-[13px] text-[var(--fr-ink-muted)]">No episodes scheduled.</p>
            ) : (
              <div className="divide-y divide-[var(--fr-hairline-soft)]">
                {scheduledEntries.map((entry) => (
                  <AgendaRow key={entry.anime.id} entry={entry} date={date} now={now} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function AgendaRow({ entry, date, now }: { entry: Entry; date: Date; now: number }) {
  const { anime } = entry;
  const episode = episodeOnLocalDate(anime.schedule, date);
  if (!episode) return null;
  const hasAired = episode.airingAt * 1000 <= now;

  return (
    <article className="grid grid-cols-[48px_minmax(0,1fr)] gap-x-3 gap-y-3 py-4 sm:grid-cols-[56px_minmax(180px,0.75fr)_minmax(280px,1.25fr)_auto] sm:items-center sm:gap-x-5">
      <Link
        href={animePath(anime.id, anime.title)}
        className="relative row-span-2 aspect-[2/3] overflow-hidden rounded-[8px] bg-[var(--fr-surface-2)] sm:row-span-1"
      >
        <Image src={anime.coverImage} alt="" fill sizes="56px" className="object-cover" />
      </Link>

      <div className="min-w-0 self-center">
        <Link href={animePath(anime.id, anime.title)} className="line-clamp-1 text-[13px] font-semibold hover:text-white/70">
          {anime.title}
        </Link>
        <p className="mt-1 truncate text-[11px] text-[var(--fr-ink-muted)]">{anime.studio}</p>
      </div>

      <div className="col-span-2 min-w-0 sm:col-span-1">
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]">
          <span className="font-semibold tabular-nums">EP {episode.episode}{anime.totalEpisodes ? ` / ${anime.totalEpisodes}` : ""}</span>
          <span className="inline-flex items-center gap-1.5 text-[var(--fr-ink-muted)]">
            <Clock3 className="h-3 w-3" />
            {hasAired ? "Aired" : "Airs"} {timeFormatter.format(episode.airingAt * 1000)}
          </span>
        </div>
        <EpisodeProgressStrip
          animeId={anime.id}
          schedule={anime.schedule}
          totalEpisodes={anime.totalEpisodes}
          now={now}
          activeEpisode={episode.episode}
          compact
        />
      </div>

      <div className="col-start-2 row-start-2 justify-self-start sm:col-start-4 sm:row-start-1 sm:justify-self-end">
        {hasAired ? (
          <WatchedButton animeId={anime.id} episode={episode.episode} compact />
        ) : (
          <span className="inline-flex h-8 items-center rounded-full border border-white/10 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
            Upcoming
          </span>
        )}
      </div>
    </article>
  );
}
