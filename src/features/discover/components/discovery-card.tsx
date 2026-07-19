import { animePath } from "@/lib/site";
import type { AiringAnime } from "@/lib/anilist";
import {
  AnimeCard,
  AnimeCardBody,
  AnimeCardDescription,
  AnimeCardMedia,
  AnimeCardOverlay,
  AnimeCardTitle,
} from "@/components/anime/anime-card";
import { FavoriteButton } from "@/features/dashboard/components/cards/favorite-button";

export function DiscoveryCard({
  anime,
  eager = false,
}: {
  anime: AiringAnime;
  eager?: boolean;
}) {
  const href = animePath(anime.id, anime.title);

  return (
    <AnimeCard>
      <FavoriteButton
        animeId={anime.id}
        className="absolute right-2 top-2 z-10 bg-black/65 backdrop-blur"
      />
      <AnimeCardMedia
        href={href}
        src={anime.coverImage}
        sizes="(max-width: 640px) 45vw, (max-width: 1100px) 25vw, 180px"
        eager={eager}
        className="focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--fr-canvas)]"
      >
        <AnimeCardOverlay className="from-black/85 via-transparent pt-10 text-[10px] uppercase tracking-[0.08em] text-white/65">
          {anime.studio}
        </AnimeCardOverlay>
      </AnimeCardMedia>
      <AnimeCardBody>
        <AnimeCardTitle href={href}>{anime.title}</AnimeCardTitle>
        <AnimeCardDescription>
          {anime.genres.slice(0, 2).join(" · ")}
        </AnimeCardDescription>
      </AnimeCardBody>
    </AnimeCard>
  );
}
