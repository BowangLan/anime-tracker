import Image from "next/image";
import Link from "next/link";
import { animePath } from "@/lib/site";
import type { AiringAnime } from "@/lib/anilist";
import { FavoriteButton } from "@/features/dashboard/components/cards/favorite-button";

export function DiscoveryCard({
  anime,
  eager = false,
}: {
  anime: AiringAnime;
  eager?: boolean;
}) {
  return (
    <article className="group relative min-w-0">
      <FavoriteButton
        animeId={anime.id}
        className="absolute right-2 top-2 z-10 bg-black/65 backdrop-blur"
      />
      <Link
        href={animePath(anime.id, anime.title)}
        className="block rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--fr-canvas)]"
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-[14px] bg-[var(--fr-surface-1)]">
          {anime.coverImage && (
            <Image
              src={anime.coverImage}
              alt=""
              fill
              loading={eager ? "eager" : "lazy"}
              sizes="(max-width: 640px) 45vw, (max-width: 1100px) 25vw, 180px"
              className="object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-3 pt-10 text-[10px] uppercase tracking-[0.08em] text-white/65">
            {anime.studio}
          </div>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-medium leading-tight text-[var(--fr-ink)]">
          {anime.title}
        </h3>
        <p className="mt-1 truncate text-[11px] text-[var(--fr-ink-muted)]">
          {anime.genres.slice(0, 2).join(" · ")}
        </p>
      </Link>
    </article>
  );
}
