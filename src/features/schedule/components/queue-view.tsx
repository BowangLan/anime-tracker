"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { AiringAnime, EpisodeAiring } from "@/lib/anilist";
import type { BoardModel } from "@/features/dashboard/lib/board-model";
import { useWatchedEpisodesStore } from "@/stores/watched-episodes-store";
import { animePath } from "@/lib/site";
import { untilLabel } from "@/lib/schedule";
import { WatchedButton } from "@/components/common/watched-button";
import { EpisodeProgressStrip } from "./episode-progress-strip";

interface QueueItem {
  anime: AiringAnime;
  episode: EpisodeAiring;
  state: "overdue" | "today" | "upcoming";
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function QueueView({ model, now }: { model: BoardModel; now: number }) {
  const watched = useWatchedEpisodesStore((state) => state.watched);
  const watchedSet = new Set(watched);
  const items: QueueItem[] = [];

  for (const { anime } of model.results) {
    const unwatchedPast = anime.schedule.filter(
      (episode) => episode.airingAt * 1000 <= now && !watchedSet.has(`${anime.id}:${episode.episode}`),
    );
    const episode = unwatchedPast[0] ?? anime.schedule.find((item) => item.airingAt * 1000 > now);
    if (!episode) continue;
    const delta = episode.airingAt * 1000 - now;
    const airingDate = new Date(episode.airingAt * 1000);
    const today = new Date(now);
    const airsToday = airingDate.getFullYear() === today.getFullYear()
      && airingDate.getMonth() === today.getMonth()
      && airingDate.getDate() === today.getDate();
    items.push({
      anime,
      episode,
      state: delta <= 0 ? (airsToday ? "today" : "overdue") : "upcoming",
    });
  }

  items.sort((a, b) => {
    const stateOrder = { overdue: 0, today: 1, upcoming: 2 };
    return stateOrder[a.state] - stateOrder[b.state] || a.episode.airingAt - b.episode.airingAt;
  });

  const catchUpCount = items.filter((item) => item.state !== "upcoming").length;

  return (
    <div className="mx-auto w-full max-w-[940px] px-5 pb-20 pt-6 sm:px-8">
      <div className="mb-8 flex items-end justify-between border-b border-[var(--fr-hairline)] pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fr-ink-muted)]">Your next episode</p>
          <p className="mt-2 max-w-xl text-[20px] font-semibold tracking-[-0.04em] sm:text-[26px]">
            {catchUpCount > 0 ? `${catchUpCount} ${catchUpCount === 1 ? "show is" : "shows are"} waiting for you.` : "You’re caught up."}
          </p>
        </div>
        <span className="hidden text-[11px] text-[var(--fr-ink-muted)] sm:block">Mark one watched and the next episode takes its place.</span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-[var(--fr-hairline)] px-6 py-16 text-center">
          <p className="text-[14px] font-medium">Nothing in the queue</p>
          <p className="mt-2 text-[12px] text-[var(--fr-ink-muted)]">Follow a currently airing show to keep its next episode here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => <QueueCard key={item.anime.id} item={item} now={now} />)}
        </div>
      )}
    </div>
  );
}

function QueueCard({ item, now }: { item: QueueItem; now: number }) {
  const { anime, episode, state } = item;
  const hasAired = episode.airingAt * 1000 <= now;
  const stream = anime.externalLinks.find((link) => link.type === "STREAMING" && !link.isDisabled);

  return (
    <article className="group relative overflow-hidden rounded-[16px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] p-3 transition hover:border-white/20 sm:p-4">
      <div className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-5">
        <Link href={animePath(anime.id, anime.title)} className="relative aspect-[2/3] overflow-hidden rounded-[9px] bg-[var(--fr-surface-2)]">
          <Image src={anime.coverImage} alt="" fill sizes="72px" className="object-cover" />
        </Link>

        <div className="min-w-0 py-0.5">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.09em]">
            <span className={state === "today" ? "text-[var(--fr-accent-blue)]" : state === "overdue" ? "text-white" : "text-[var(--fr-ink-muted)]"}>
              {state === "today" ? "Ready today" : state === "overdue" ? "Ready to watch" : `In ${untilLabel(episode.airingAt * 1000, now)}`}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-[var(--fr-ink-muted)]">EP {episode.episode}{anime.totalEpisodes ? ` / ${anime.totalEpisodes}` : ""}</span>
          </div>
          <Link href={animePath(anime.id, anime.title)} className="mt-2 line-clamp-1 text-[15px] font-semibold tracking-[-0.025em] hover:text-white/70 sm:text-[17px]">
            {anime.title}
          </Link>
          <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[var(--fr-ink-muted)]">
            <Clock3 className="h-3 w-3" /> {dateFormatter.format(episode.airingAt * 1000)}
          </p>
          <EpisodeProgressStrip animeId={anime.id} schedule={anime.schedule} totalEpisodes={anime.totalEpisodes} now={now} activeEpisode={episode.episode} compact className="mt-3" />
        </div>

        <div className="col-span-2 flex items-center gap-2 pl-[70px] sm:col-span-1 sm:pl-0 sm:self-center">
          {hasAired && <WatchedButton animeId={anime.id} episode={episode.episode} showEpisode />}
          {stream && (
            <a href={stream.url} target="_blank" rel="noreferrer" className="relative z-10 inline-flex h-10 items-center gap-1.5 rounded-full border border-white/15 px-3 text-[11px] font-medium text-white/70 transition hover:border-white/30 hover:text-white">
              Watch <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
