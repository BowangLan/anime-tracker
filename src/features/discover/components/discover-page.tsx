"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { AiringAnime, DiscoverSections } from "@/lib/anilist";
import { animePath } from "@/lib/site";
import { useNow } from "@/hooks/use-now";
import { FavoriteButton } from "@/features/dashboard/components/cards/favorite-button";
import { PageHeader } from "@/components/app-shell/page-header";
import { cn } from "@/lib/utils";

const featuredGenres = [
  "All",
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Romance",
  "Sci-Fi",
];

const railClass =
  "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scroll-padding-inline:16px] sm:-mx-8 sm:px-8 sm:[scroll-padding-inline:32px] lg:-mx-7 lg:px-7 lg:[scroll-padding-inline:28px]";

function SectionTitle({ children, detail, id }: { children: string; detail?: string; id: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 id={id} className="flex items-center text-[19px] font-semibold tracking-[-0.025em] text-[var(--fr-ink)] sm:text-[22px]">
        {children}
        <ChevronRight className="ml-0.5 h-5 w-5 text-[var(--fr-ink-muted)]" aria-hidden="true" />
      </h2>
      {detail && (
        <span className="pb-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--fr-ink-muted)]">
          {detail}
        </span>
      )}
    </div>
  );
}

function FeatureRail({ anime }: { anime: AiringAnime[] }) {
  return (
    <section aria-labelledby="spotlight-heading">
      <SectionTitle id="spotlight-heading" detail="Moving fastest">Trending now</SectionTitle>
      <div className={cn(railClass, "gap-3 sm:gap-4")}>
        {anime.slice(0, 6).map((show, index) => (
          <article
            key={show.id}
            className="w-[86vw] max-w-[510px] shrink-0 snap-start sm:w-[55vw] lg:w-[42vw] xl:w-[36vw]"
          >
            <Link
              href={animePath(show.id, show.title)}
              className="group grid grid-cols-[42%_minmax(0,1fr)] overflow-hidden rounded-[14px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/70"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-[var(--fr-surface-2)]">
                {show.coverImage && (
                  <Image
                    src={show.coverImage}
                    alt=""
                    fill
                    preload={index === 0}
                    sizes="(max-width: 640px) 36vw, (max-width: 1200px) 23vw, 215px"
                    className="object-cover transition duration-500 group-hover:scale-[1.035]"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-col justify-between p-4 sm:p-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--fr-ink-muted)]">
                    #{index + 1} trending
                  </p>
                  <h3 className="mt-2 line-clamp-3 text-[18px] font-semibold leading-tight tracking-[-0.025em] sm:text-[21px]">
                    {show.title}
                  </h3>
                  <p className="mt-2 text-[11px] text-[var(--fr-ink-muted)]">{show.studio}</p>
                </div>
                <p className="line-clamp-3 text-[11px] leading-relaxed text-[var(--fr-ink-muted)] sm:text-[12px]">
                  {show.synopsis || `${show.studio} presents one of this season's most-watched series.`}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function PosterRail({ anime }: { anime: AiringAnime[] }) {
  return (
    <section aria-labelledby="popular-heading">
      <SectionTitle id="popular-heading" detail="Most watched">Season favorites</SectionTitle>
      <div className={railClass}>
        {anime.slice(0, 16).map((show, index) => (
          <article key={show.id} className="group w-[38vw] max-w-[190px] shrink-0 snap-start sm:w-[22vw] lg:w-[16vw] xl:w-[14vw]">
            <div className="relative">
              <FavoriteButton animeId={show.id} className="absolute right-2 top-2 z-10 bg-black/65 backdrop-blur" />
              <Link
                href={animePath(show.id, show.title)}
                className="relative block aspect-[2/3] overflow-hidden rounded-[11px] bg-[var(--fr-surface-1)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/70"
              >
                {show.coverImage && (
                  <Image
                    src={show.coverImage}
                    alt=""
                    fill
                    loading={index < 5 ? "eager" : "lazy"}
                    sizes="(max-width: 640px) 38vw, (max-width: 1024px) 22vw, 190px"
                    className="object-cover transition duration-500 group-hover:scale-[1.035]"
                  />
                )}
              </Link>
            </div>
            <Link href={animePath(show.id, show.title)} className="outline-none focus-visible:underline">
              <h3 className="mt-2.5 truncate text-[13px] font-medium text-[var(--fr-ink)] sm:text-sm">{show.title}</h3>
              <p className="mt-0.5 truncate text-[11px] text-[var(--fr-ink-muted)]">
                {show.popularity ? `${show.popularity.toLocaleString()} members` : show.studio}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function EpisodeRail({ anime, now }: { anime: AiringAnime[]; now: number | null }) {
  const columns = Array.from({ length: Math.ceil(Math.min(anime.length, 24) / 4) }, (_, i) => anime.slice(i * 4, i * 4 + 4));
  return (
    <section aria-labelledby="episodes-heading">
      <SectionTitle id="episodes-heading" detail="Next 48 hours">Airing soon</SectionTitle>
      <div className={cn(railClass, "gap-7")}>
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="w-[84vw] max-w-[430px] shrink-0 snap-start divide-y divide-[var(--fr-hairline)] sm:w-[48vw] lg:w-[34vw]">
            {column.map((show) => (
              <Link
                key={show.id}
                href={animePath(show.id, show.title)}
                className="group grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--fr-accent-blue)]/70"
              >
                <div className="relative aspect-[2/3] w-[42px] overflow-hidden rounded-[6px] bg-[var(--fr-surface-1)]">
                  {show.coverImage && <Image src={show.coverImage} alt="" fill sizes="42px" className="object-cover" />}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[13px] font-medium group-hover:underline">{show.title}</h3>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--fr-ink-muted)]">
                    Episode {show.next?.episode ?? "—"} · {formatAiringTime(show.next?.airingAt, now)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--fr-ink-muted)]" aria-hidden="true" />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function StoryRail({ anime }: { anime: AiringAnime[] }) {
  return (
    <section aria-labelledby="stories-heading">
      <SectionTitle id="stories-heading" detail="Highly rated · Underseen">Hidden gems</SectionTitle>
      <div className={railClass}>
        {anime.slice(0, 12).map((show) => (
          <article key={show.id} className="w-[82vw] max-w-[390px] shrink-0 snap-start sm:w-[43vw] lg:w-[31vw]">
            <Link href={animePath(show.id, show.title)} className="group flex overflow-hidden rounded-[11px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/70">
              <div className="relative aspect-[2/3] w-[118px] shrink-0 overflow-hidden bg-[var(--fr-surface-2)] sm:w-[132px]">
                {show.coverImage && (
                  <Image
                    src={show.coverImage}
                    alt=""
                    fill
                    sizes="132px"
                    className="object-cover transition duration-500 group-hover:scale-[1.035]"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--fr-ink-muted)]">
                  {show.averageScore ? `${show.averageScore}% average` : "Underseen pick"}
                </p>
                <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-tight">{show.title}</h3>
                <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-[var(--fr-ink-muted)]">{show.synopsis}</p>
                <p className="mt-auto flex items-center gap-1.5 pt-3 text-[10px] text-[var(--fr-ink-muted)]">
                  <Clock3 className="h-3 w-3" aria-hidden="true" />
                  {show.totalEpisodes ? `${show.totalEpisodes} episodes` : "Ongoing"}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatAiringTime(airingAt: number | undefined, now: number | null) {
  if (!airingAt || now == null) return "Soon";
  const minutes = Math.max(0, Math.round((airingAt - now / 1000) / 60));
  if (minutes < 60) return `in ${minutes}m`;
  if (minutes < 24 * 60) return `in ${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(airingAt * 1000);
}

export function DiscoverPage({ sections }: { sections: DiscoverSections }) {
  const now = useNow();
  const searchParams = useSearchParams();
  const selectedGenre = searchParams.get("genre") ?? "All";
  const setGenre = (genre: string) => {
    const params = new URLSearchParams(window.location.search);
    if (genre === "All") params.delete("genre");
    else params.set("genre", genre);
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
  };
  const filterByGenre = (anime: AiringAnime[]) =>
    selectedGenre === "All"
      ? anime
      : anime.filter((show) => show.genres.includes(selectedGenre));
  const filtered = {
    trending: filterByGenre(sections.trending),
    popular: filterByGenre(sections.popular),
    upcoming: filterByGenre(sections.upcoming),
    hiddenGems: filterByGenre(sections.hiddenGems),
  };
  const visibleCount = new Set(Object.values(filtered).flat().map((show) => show.id)).size;

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader
        eyebrow="Catalog"
        title="Discover current anime"
        description="Browse curated picks from the current airing season"
      />
      <header className="z-30 shrink-0 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-8 lg:px-7">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--fr-ink-muted)] sm:text-[11px]">Filter by genre</span>
          <span className="shrink-0 text-xs tabular-nums text-[var(--fr-ink-muted)] sm:text-[11px]">{visibleCount} curated picks</span>
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5 sm:-mx-8 sm:px-8 lg:-mx-7 lg:px-7">{featuredGenres.map((genre) => <button key={genre} type="button" onClick={() => setGenre(genre)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[11px] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60", genre === selectedGenre ? "border-white bg-white font-medium text-black" : "border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] text-[var(--fr-ink-muted)] hover:text-white")}>{genre}</button>)}</div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="space-y-10 px-4 py-6 sm:space-y-12 sm:px-8 sm:py-8 lg:px-7">
          {visibleCount ? <>{filtered.trending.length > 0 && <FeatureRail anime={filtered.trending} />}{filtered.popular.length > 0 && <PosterRail anime={filtered.popular} />}{filtered.upcoming.length > 0 && <EpisodeRail anime={filtered.upcoming} now={now} />}{filtered.hiddenGems.length > 0 && <StoryRail anime={filtered.hiddenGems} />}</> : <div className="grid min-h-64 place-items-center text-center"><div><p className="text-lg font-medium">No curated picks in {selectedGenre}</p><button type="button" onClick={() => setGenre("All")} className="mt-2 text-sm text-[var(--fr-accent-blue)] hover:underline">Browse every genre</button></div></div>}
        </div>
      </div>
    </main>
  );
}
