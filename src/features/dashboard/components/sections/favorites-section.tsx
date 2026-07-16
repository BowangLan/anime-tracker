import Image from "next/image";
import Link from "next/link";
import type { AiringAnime } from "@/lib/anilist";
import { deriveAiring } from "@/lib/schedule";
import { SectionHeader } from "./section-header";
import { FavoriteButton } from "../cards/favorite-button";

export function FavoritesSection({
  anime,
  following,
  now,
}: {
  anime: AiringAnime[];
  following: number[];
  now: number;
}) {
  const favorites = anime
    .filter((show) => following.includes(show.id))
    .map((show) => ({ anime: show, airing: deriveAiring(show, now) }));

  return (
    <section className="min-w-0 shrink-0" aria-labelledby="favorites-heading">
      <SectionHeader
        id="favorites-heading"
        title="Following this season"
        description={`${favorites.length} followed ${favorites.length === 1 ? "show" : "shows"}`}
      />

      {favorites.length > 0 ? (
        <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 [scroll-padding-inline:20px]">
          {favorites.map(({ anime: show, airing }, index) => (
            <article key={show.id} className="group relative w-[138px] shrink-0 snap-start min-[810px]:w-[150px]">
              <FavoriteButton animeId={show.id} className="absolute right-2 top-2 z-10" />
              <Link
                href={`/anime/${show.id}`}
                className="block rounded-[15px] outline-none focus-visible:ring-1 focus-visible:ring-[var(--fr-accent-blue)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--fr-canvas)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-[15px] bg-[var(--fr-surface-1)]">
                  {show.coverImage && (
                    <Image
                      src={show.coverImage}
                      alt=""
                      fill
                      loading={index < 5 ? "eager" : "lazy"}
                      sizes="150px"
                      className="object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-10">
                    <div className="mb-2 flex items-center justify-between gap-2 text-[12px] leading-[1.2] tracking-[-0.12px]">
                      <span className="font-medium text-[var(--fr-ink)]">EP {airing.latestAired || "—"}</span>
                      {show.totalEpisodes && <span className="text-[var(--fr-ink-muted)]">/ {show.totalEpisodes}</span>}
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-[var(--fr-surface-2)]">
                      <div
                        className="h-full rounded-full bg-[var(--fr-ink)]"
                        style={{ width: `${airing.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 line-clamp-2 text-[13px] font-medium leading-[1.2] tracking-[-0.13px] text-[var(--fr-ink)] transition-colors group-hover:text-[var(--fr-ink-muted)]">
                  {show.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="py-8 text-[14px] font-medium leading-[1.4] tracking-[-0.14px] text-[var(--fr-ink-muted)]">
          Follow a show to keep its season progress here.
        </p>
      )}
    </section>
  );
}
