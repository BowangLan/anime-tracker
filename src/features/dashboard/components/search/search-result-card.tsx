import Image from "next/image";
import Link from "next/link";
import type { AnimeSearchResult } from "@/lib/anilist";
import { deriveAiring, untilLabel } from "@/lib/schedule";
import { StarRating } from "@/components/common/star-rating";

export function SearchResultCard({
  anime,
  now,
}: {
  anime: AnimeSearchResult;
  now: number;
}) {
  const airing = deriveAiring(anime, now);
  const isReleasing = anime.status === "RELEASING";
  const countdown = airing.nextAiringAt ? untilLabel(airing.nextAiringAt, now) : null;

  return (
    <article className="group relative flex min-h-[128px] gap-3 rounded-[14px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] p-2.5 transition hover:border-white/15 hover:bg-[var(--fr-surface-2)]/60">
      <Link href={`/anime/${anime.id}`} className="relative aspect-[2/3] w-[70px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--fr-surface-2)]">
        {anime.coverImage && <Image src={anime.coverImage} alt="" fill sizes="70px" className="object-cover transition duration-300 group-hover:scale-[1.03]" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.07em]">
          {isReleasing && <span className="fr-live-dot h-1.5 w-1.5 rounded-full bg-[var(--fr-accent-blue)]" />}
          <span className={isReleasing ? "text-[var(--fr-accent-blue)]" : "text-[var(--fr-ink-muted)]"}>
            {isReleasing ? "Airing now" : searchLabel(anime.status)}
          </span>
          {anime.format && <><span className="text-white/20">/</span><span className="text-[var(--fr-ink-muted)]">{searchLabel(anime.format)}</span></>}
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-[14px] font-semibold leading-tight tracking-[-0.015em] text-[var(--fr-ink)]">
          <Link href={`/anime/${anime.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">{anime.title}</Link>
        </h3>
        <p className="mt-1 truncate text-[11px] text-[var(--fr-ink-muted)]">{anime.studio}</p>
        <div className="mt-auto flex items-center gap-2 pt-2 text-[11px] text-[var(--fr-ink-muted)]">
          {anime.seasonYear && <span>{anime.seasonYear}</span>}
          {anime.averageScore != null && <StarRating value={anime.averageScore} />}
          {countdown && <span className="ml-auto tabular-nums text-[var(--fr-ink)]">EP {airing.nextEpisode} in {countdown}</span>}
        </div>
      </div>
    </article>
  );
}

function searchLabel(value: string | null): string {
  if (!value) return "Announced";
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
