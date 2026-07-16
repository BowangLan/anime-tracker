import { Play } from "lucide-react";
import type { AnimeDetail } from "@/lib/anilist";
import { SectionHeading } from "./section-heading";

interface EpisodeRow {
  number: number;
  title: string | null;
  url: string | null;
  site: string | null;
  airingAt: number | null;
  isUpcoming: boolean;
}

export function EpisodeGuide({ anime }: { anime: AnimeDetail }) {
  const episodes = buildEpisodeRows(anime);
  if (episodes.length === 0) return null;

  return (
    <section aria-labelledby="episodes-heading">
      <SectionHeading
        id="episodes-heading"
        eyebrow={`${episodes.length}${anime.episodes && episodes.length < anime.episodes ? ` of ${anime.episodes}` : ""} episodes`}
        title="Episode guide"
      />
      <div className="mt-6 overflow-hidden rounded-[14px] border border-white/10">
        {episodes.map((episode) => {
          const future = episode.isUpcoming;
          const content = (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-[11px] font-medium tabular-nums text-white/60">
                {String(episode.number).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-white/85">
                  {episode.title || `Episode ${episode.number}`}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/38">
                  {episode.airingAt && <span>{future ? "Airs" : "Aired"} {episodeDate(episode.airingAt)}</span>}
                  {episode.site && <span>{episode.site}</span>}
                </span>
              </span>
              {episode.url ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5 text-[10px] font-medium text-white/55 transition group-hover:border-white/20 group-hover:text-white">
                  <Play className="h-2.5 w-2.5 fill-current" /> Watch
                </span>
              ) : future ? (
                <span className="shrink-0 text-[10px] font-medium text-[var(--detail-accent)]">Upcoming</span>
              ) : null}
            </>
          );

          const rowClass = "group flex min-h-15 items-center gap-3 border-b border-white/8 px-3.5 py-3 transition last:border-b-0 hover:bg-white/[0.035] sm:px-4";
          return episode.url ? (
            <a key={episode.number} href={episode.url} target="_blank" rel="noreferrer" className={rowClass}>
              {content}
            </a>
          ) : (
            <div key={episode.number} className={rowClass}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}

function buildEpisodeRows(anime: AnimeDetail): EpisodeRow[] {
  const rows = new Map<number, EpisodeRow>();

  for (const stream of anime.streamingEpisodes) {
    const match = stream.title.match(/^Episode\s+(\d+)(?:\s*[-–—:]\s*)?(.*)$/i);
    if (!match) continue;
    const number = Number(match[1]);
    rows.set(number, {
      number,
      title: match[2]?.trim() || null,
      url: stream.url,
      site: stream.site,
      airingAt: null,
      isUpcoming: false,
    });
  }

  for (const scheduled of anime.airingSchedule.nodes) {
    const existing = rows.get(scheduled.episode);
    rows.set(scheduled.episode, {
      number: scheduled.episode,
      title: existing?.title ?? null,
      url: existing?.url ?? null,
      site: existing?.site ?? null,
      airingAt: scheduled.airingAt,
      isUpcoming: scheduled.timeUntilAiring > 0,
    });
  }

  if (anime.episodes && anime.episodes <= 100) {
    for (let number = 1; number <= anime.episodes; number++) {
      if (!rows.has(number)) rows.set(number, { number, title: null, url: null, site: null, airingAt: null, isUpcoming: false });
    }
  }

  return [...rows.values()].sort((a, b) => a.number - b.number);
}

function episodeDate(airingAt: number): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(airingAt * 1000);
}
