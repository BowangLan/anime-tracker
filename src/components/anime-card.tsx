"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "@base-ui/react/menu";
import { Star, Clock, ExternalLink as ExternalLinkIcon } from "lucide-react";
import type { AiringAnime, AnimeExternalLink } from "@/lib/anilist";
import { type Airing, untilLabel } from "@/lib/schedule";
import { useFollows } from "@/lib/store";
import { cue } from "@/lib/sound";
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
      <Link
        href={`/anime/${anime.id}`}
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
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-1.5">
          <h3 className="line-clamp-2 flex-1 text-[13px] font-semibold leading-tight text-[var(--fr-ink)]" style={{ letterSpacing: "-0.01em" }} title={anime.title}>
            <Link href={`/anime/${anime.id}`} className="after:absolute after:inset-0 after:z-0 focus-visible:outline-none">{anime.title}</Link>
          </h3>
          <div className="relative z-10 -mr-0.5 flex shrink-0 items-center">
            <ExternalLinksMenu links={anime.externalLinks} />
            <button
              aria-label={following ? "Unfollow" : "Follow"}
              onClick={() => {
                cue(following ? "tick" : "success");
                toggleFollow(anime.id);
              }}
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full transition",
                following
                  ? "text-[var(--fr-ink)]"
                  : "text-[var(--fr-ink-muted)] opacity-70 hover:text-[var(--fr-ink)] hover:opacity-100",
              )}
            >
              <Star className={cn("h-3.5 w-3.5", following && "fill-current")} />
            </button>
          </div>
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

function ExternalLinksMenu({ links }: { links: AnimeExternalLink[] }) {
  if (links.length === 0) return null;

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="External links"
        title="External links"
        data-cuelume-press
        className="grid h-6 w-6 place-items-center rounded-full text-[var(--fr-ink-muted)] opacity-70 transition hover:bg-white/[0.06] hover:text-[var(--fr-ink)] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60 data-popup-open:bg-white/[0.08] data-popup-open:text-[var(--fr-ink)] data-popup-open:opacity-100"
      >
        <ExternalLinkIcon className="h-3.5 w-3.5" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50 outline-none">
          <Menu.Popup className="w-64 origin-[var(--transform-origin)] rounded-[12px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-2)] p-1.5 text-[var(--fr-ink)] shadow-2xl shadow-black/50 outline-none transition-[transform,opacity] duration-100 data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0">
            <Menu.Group>
              <Menu.GroupLabel className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--fr-ink-muted)]">
                Available links
              </Menu.GroupLabel>
              {links.map((link) => (
                <Menu.LinkItem
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  label={link.site}
                  closeOnClick
                  className="flex min-w-0 items-center gap-2.5 rounded-[8px] px-2 py-2 outline-none transition-colors data-highlighted:bg-white/[0.07]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-[7px] border border-[var(--fr-hairline)] bg-black/20">
                    {link.icon ? (
                      <Image src={link.icon} alt="" width={18} height={18} className="object-contain" />
                    ) : (
                      <ExternalLinkIcon className="h-3.5 w-3.5 text-[var(--fr-ink-muted)]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium">{link.site}</span>
                    <span className="flex items-center gap-1.5 text-[10px] text-[var(--fr-ink-muted)]">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: link.color ?? "var(--fr-ink-muted)" }}
                      />
                      <span className="truncate">
                        {[formatLinkType(link.type), link.language, link.notes]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                  </span>
                  <ExternalLinkIcon className="h-3 w-3 shrink-0 text-[var(--fr-ink-muted)]" />
                </Menu.LinkItem>
              ))}
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function formatLinkType(type: string | null): string {
  if (!type) return "External";
  return type.charAt(0) + type.slice(1).toLowerCase();
}
