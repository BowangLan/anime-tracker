import Image from "next/image";
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
      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {episodes.map((episode) => {
          const future = episode.isUpcoming;
          const content = (
            <>
              <span className="relative block aspect-video overflow-hidden rounded-[12px] bg-white/[0.04]">
                <Image
                  src={anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large}
                  alt=""
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className={`object-cover transition duration-300 group-hover:scale-[1.025] ${future ? "opacity-45 saturate-50" : "opacity-85"}`}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/10" />
                <span className="absolute bottom-3 left-3 text-[26px] font-semibold leading-none tracking-[-0.06em] text-white tabular-nums">
                  {String(episode.number).padStart(2, "0")}
                </span>
                {episode.url ? (
                  <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white text-black shadow-lg transition group-hover:scale-105">
                    <Play className="ml-0.5 h-3 w-3 fill-current" />
                  </span>
                ) : future ? (
                  <span className="absolute right-2.5 top-2.5 rounded-full border border-white/15 bg-black/55 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/75 backdrop-blur-sm">
                    Upcoming
                  </span>
                ) : null}
              </span>
              <span className="mt-3 block min-w-0 px-0.5">
                <span className="block truncate text-[13px] font-medium text-white/85 transition group-hover:text-white">
                  {episode.title || `Episode ${episode.number}`}
                </span>
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-white/38">
                  {episode.airingAt && <span>{future ? "Airs" : "Aired"} {episodeDate(episode.airingAt)}</span>}
                  {episode.site && <span>{episode.site}</span>}
                </span>
              </span>
            </>
          );

          const cardClass = "group block min-w-0 rounded-[12px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--detail-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-black";
          return episode.url ? (
            <a key={episode.number} href={episode.url} target="_blank" rel="noreferrer" className={cardClass} aria-label={`Watch ${episode.title || `episode ${episode.number}`} on ${episode.site || "streaming site"}`}>
              {content}
            </a>
          ) : (
            <div key={episode.number} className={cardClass}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}

function buildEpisodeRows(anime: AnimeDetail): EpisodeRow[] {
  const rows = new Map<number, EpisodeRow>();

  for (const stream of anime.streamingEpisodes) {
    const parsed = parseStreamingEpisodeTitle(stream.title);
    if (!parsed) continue;
    rows.set(parsed.number, {
      number: parsed.number,
      title: parsed.title,
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

function parseStreamingEpisodeTitle(value: string): { number: number; title: string | null } | null {
  const match = value.trim().match(/^(?:Episode\s*)?(\d+)(?:\s*[-–—:]\s*(.+))?$/i);
  if (!match) return null;

  const number = Number(match[1]);
  const title = match[2]?.trim() || null;
  return { number, title };
}

function episodeDate(airingAt: number): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(airingAt * 1000);
}
