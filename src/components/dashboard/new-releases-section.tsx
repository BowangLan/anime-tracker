import type { AiringAnime } from "@/lib/anilist";
import { HorizontalAnimeList, type ShowCardData } from "./show-card";
import { SectionHeader } from "./section-header";

function sameLocalDay(timestampSeconds: number, now: number) {
  const date = new Date(timestampSeconds * 1000);
  const today = new Date(now);
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function timeLabel(timestampSeconds: number) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" })
    .format(new Date(timestampSeconds * 1000));
}

export function NewReleasesSection({ anime, now }: { anime: AiringAnime[]; now: number }) {
  const releases: ShowCardData[] = anime.flatMap((show) => {
    const episode = show.schedule.findLast((item) => sameLocalDay(item.airingAt, now));
    return episode
      ? [{ anime: show, episode: episode.episode, releaseLabel: `Today · ${timeLabel(episode.airingAt)}` }]
      : [];
  });

  return (
    <section className="min-w-0" aria-labelledby="new-releases-heading">
      <SectionHeader id="new-releases-heading" title="New Releases" description="Episodes airing today" />
      {releases.length > 0 ? (
        <HorizontalAnimeList shows={releases} />
      ) : (
        <div className="py-10 text-center">
          <p className="text-[14px] font-medium leading-[1.4] tracking-[-0.14px]">No episodes scheduled today</p>
          <p className="mt-2 text-[12px] leading-[1.2] tracking-[-0.12px] text-[var(--fr-ink-muted)]">Tomorrow’s lineup will appear after midnight.</p>
        </div>
      )}
    </section>
  );
}
