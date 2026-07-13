"use client";

import Image from "next/image";
import { Star, Clock, ExternalLink } from "lucide-react";
import type { AiringAnime } from "@/lib/anilist";
import { type Airing, untilLabel } from "@/lib/schedule";
import { useFollows } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Compact schedule row for a day column: cover, title, latest episode, season
 * progress, and a countdown to the next drop.
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

  return (
    <article
      className="group relative flex gap-3 rounded-[14px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] p-2.5 transition-colors hover:border-white/15"
      style={{ ["--accent" as string]: anime.color }}
    >
      <a
        href={anime.siteUrl}
        target="_blank"
        rel="noreferrer"
        className="relative aspect-[2/3] w-[52px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--fr-surface-2)]"
      >
        {anime.coverImage && (
          <Image
            src={anime.coverImage}
            alt=""
            fill
            sizes="52px"
            className="object-cover"
          />
        )}
      </a>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
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
              "grid h-6 w-6 shrink-0 place-items-center rounded-full transition",
              following
                ? "text-[var(--accent)]"
                : "text-[var(--fr-ink-muted)] hover:text-[var(--fr-ink)]",
            )}
          >
            <Star className={cn("h-3.5 w-3.5", following && "fill-current")} />
          </button>
        </div>

        <p className="truncate text-[11px] text-[var(--fr-ink-muted)]">
          {anime.studio}
        </p>

        {/* Season progress */}
        <div className="mt-auto flex items-center gap-2">
          <span className="rounded-full bg-[var(--fr-surface-2)] px-2 py-0.5 text-[10px] font-medium tabular-nums text-[var(--fr-ink)]">
            EP {airing.latestAired || "—"}
            {total ? ` / ${total}` : ""}
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--fr-surface-2)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${airing.progressPct}%`,
                background: "var(--accent)",
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[var(--fr-ink-muted)]">
          {countdown ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {countdown === "now" ? (
                <span className="font-medium text-[var(--accent)]">
                  Airing now
                </span>
              ) : (
                <>
                  EP {airing.nextEpisode} · {countdown}
                </>
              )}
            </span>
          ) : (
            <span>Finale aired</span>
          )}
          <a
            href={anime.siteUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open on AniList"
            className="opacity-0 transition group-hover:opacity-100 hover:text-[var(--fr-ink)]"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
