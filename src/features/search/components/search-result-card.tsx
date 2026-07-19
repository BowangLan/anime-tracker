import { animePath } from "@/lib/site";
import type { AnimeSearchResult } from "@/lib/anilist";
import { deriveAiring, untilLabel } from "@/lib/schedule";
import {
  AnimeCard,
  AnimeCardBody,
  AnimeCardDescription,
  AnimeCardMedia,
  AnimeCardMeta,
  AnimeCardStatus,
  AnimeCardTitle,
} from "@/components/anime/anime-card";
import { StarRating } from "@/components/common/star-rating";

export function SearchResultCard({ anime, now }: { anime: AnimeSearchResult; now: number }) {
  const airing = deriveAiring(anime, now);
  const isReleasing = anime.status === "RELEASING";
  const countdown = airing.nextAiringAt ? untilLabel(airing.nextAiringAt, now) : null;
  const href = animePath(anime.id, anime.title);

  return (
    <AnimeCard layout="compact" surface="outlined">
      <AnimeCardMedia href={href} src={anime.coverImage} sizes="70px" size="compact" />
      <AnimeCardBody layout="compact">
        <div className="flex items-center gap-1.5">
          <AnimeCardStatus tone={isReleasing ? "live" : "muted"} dot={isReleasing}>
            {isReleasing ? "Airing now" : searchLabel(anime.status)}
          </AnimeCardStatus>
          {anime.format && <><span className="text-white/20">/</span><span className="text-[var(--fr-ink-muted)]">{searchLabel(anime.format)}</span></>}
        </div>
        <AnimeCardTitle href={href} className="mt-1.5" size="default">
          {anime.title}
        </AnimeCardTitle>
        <AnimeCardDescription>{anime.studio}</AnimeCardDescription>
        <AnimeCardMeta className="mt-auto pt-2">
          {anime.seasonYear && <span>{anime.seasonYear}</span>}
          {anime.averageScore != null && <StarRating value={anime.averageScore} />}
          {countdown && <span className="ml-auto tabular-nums text-[var(--fr-ink)]">EP {airing.nextEpisode} in {countdown}</span>}
        </AnimeCardMeta>
      </AnimeCardBody>
    </AnimeCard>
  );
}

function searchLabel(value: string | null): string {
  if (!value) return "Announced";
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
