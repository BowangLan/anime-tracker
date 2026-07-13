"use client";

import Image from "next/image";
import { Star, Clock } from "lucide-react";
import type { AiringAnime } from "@/lib/anilist";
import { type Airing, untilLabel } from "@/lib/schedule";
import { useFollows } from "@/lib/store";
import { cn } from "@/lib/utils";

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
}: {
  anime: AiringAnime;
  airing: Airing;
  now: number;
}) {
  const following = useFollows((s) => s.following.includes(anime.id));
  const toggleFollow = useFollows((s) => s.toggleFollow);

  const total = anime.totalEpisodes;
  const countdown =
    airing.nextAiringAt != null ? untilLabel(airing.nextAiringAt, now) : null;
  const airingNow = countdown === "now";

  return (
    <article
      className="group relative flex gap-3 rounded-[14px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] p-2.5 transition-colors hover:border-white/15 hover:bg-[var(--fr-surface-2)]/60"
    >
      <a
        href={anime.siteUrl}
        target="_blank"
        rel="noreferrer"
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
      </a>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-1.5">
          <h3
            className="line-clamp-2 flex-1 text-[13px] font-semibold leading-tight text-[var(--fr-ink)]"
            style={{ letterSpacing: "-0.01em" }}
            title={anime.title}
          >
            {anime.title}
          </h3>
          <button
            aria-label={following ? "Unfollow" : "Follow"}
            onClick={() => toggleFollow(anime.id)}
            className={cn(
              "-mr-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full transition",
              following
                ? "text-[var(--fr-ink)]"
                : "text-[var(--fr-ink-muted)] opacity-70 hover:text-[var(--fr-ink)] hover:opacity-100",
            )}
          >
            <Star className={cn("h-3.5 w-3.5", following && "fill-current")} />
          </button>
        </div>

        <p className="truncate text-[11px] text-[var(--fr-ink-muted)]">
          {anime.studio}
        </p>

        {/* Status line + monochrome season progress */}
        <div className="mt-auto space-y-1.5 pt-1.5">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="tabular-nums text-[var(--fr-ink-muted)]">
              EP{" "}
              <span className="font-medium text-[var(--fr-ink)]">
                {airing.latestAired || "—"}
              </span>
              {total ? ` / ${total}` : ""}
            </span>

            {airingNow ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-[var(--fr-accent-blue)]">
                <span className="fr-live-dot h-1.5 w-1.5 rounded-full bg-current" />
                Airing now
              </span>
            ) : countdown ? (
              <span
                className="inline-flex items-center gap-1 tabular-nums font-medium text-[var(--fr-ink)]"
                title={
                  airing.nextEpisode != null ? `EP ${airing.nextEpisode} next` : undefined
                }
              >
                <Clock className="h-3 w-3 text-[var(--fr-ink-muted)]" />
                {countdown}
              </span>
            ) : (
              <span className="text-[var(--fr-ink-muted)]">Finale aired</span>
            )}
          </div>

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
