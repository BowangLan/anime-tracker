"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Compass, Radio, Search, Star } from "lucide-react";
import type { AiringAnime } from "@/lib/anilist";
import { useFollows } from "@/stores/follows-store";
import { PageHeader } from "@/components/app-shell/page-header";
import { FavoriteButton } from "@/features/dashboard/components/cards/favorite-button";
import { Skeleton } from "@/components/common/skeleton";
import { animePath } from "@/lib/site";

export function FavoritesPage() {
  const following = useFollows((state) => state.following);
  const idsKey = following.join(",");
  const [result, setResult] = useState<{
    key: string;
    anime: AiringAnime[];
    error: boolean;
  }>({ key: "", anime: [], error: false });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("saved");

  useEffect(() => {
    if (following.length === 0) return;
    const controller = new AbortController();
    fetch(`/api/anime/favorites?ids=${idsKey}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as {
          anime?: AiringAnime[];
          error?: string;
        };
        if (!response.ok)
          throw new Error(payload.error ?? "Favorites request failed");
        setResult({ key: idsKey, anime: payload.anime ?? [], error: false });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setResult({ key: idsKey, anime: [], error: true });
      });
    return () => controller.abort();
  }, [following.length, idsKey]);

  const state =
    following.length === 0
      ? "ready"
      : result.key === idsKey
        ? result.error
          ? "error"
          : "ready"
        : "loading";
  const anime = result.key === idsKey ? result.anime : [];
  const filteredAnime = anime
    .filter((show) =>
      `${show.title} ${show.studio} ${show.genres.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "studio"
          ? a.studio.localeCompare(b.studio)
          : 0,
    );
  const currentlyAiring = filteredAnime.filter((show) => show.next != null);
  const allOthers = filteredAnime.filter((show) => show.next == null);

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader
        eyebrow="Library"
        title="Favorites"
        description="Shows saved on this device"
        action={
          following.length > 0 ? (
            <span className="inline-flex items-center gap-2 text-[12px] text-[var(--fr-ink-muted)]">
              <Star className="h-3.5 w-3.5 fill-current text-[var(--fr-ink)]" />
              {following.length} {following.length === 1 ? "title" : "titles"}
            </span>
          ) : undefined
        }
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {following.length > 0 && (
          <div className="flex flex-col gap-3 border-b border-[var(--fr-hairline-soft)] bg-[var(--fr-surface-1)]/30 px-5 py-3 sm:flex-row sm:items-center sm:px-8 lg:px-7">
            <label className="relative min-w-0 flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--fr-ink-muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter your favorites"
                className="h-9 w-full rounded-[8px] border border-[var(--fr-hairline)] bg-[var(--fr-canvas)] pl-9 pr-3 text-[12px] outline-none placeholder:text-[var(--fr-ink-muted)] focus:ring-2 focus:ring-[var(--fr-accent-blue)]/40"
              />
            </label>
            <label className="flex items-center gap-2 text-[11px] text-[var(--fr-ink-muted)]">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-9 rounded-[8px] border border-[var(--fr-hairline)] bg-[var(--fr-canvas)] px-3 text-[12px] text-[var(--fr-ink)] outline-none focus:ring-2 focus:ring-[var(--fr-accent-blue)]/40"
              >
                <option value="saved">Recently saved</option>
                <option value="title">Title</option>
                <option value="studio">Studio</option>
              </select>
            </label>
            <span className="text-[11px] tabular-nums text-[var(--fr-ink-muted)]">
              {filteredAnime.length} shown
            </span>
          </div>
        )}
        <div className="px-5 py-5 sm:px-8 lg:px-7">
          {state === "loading" ? (
            <FavoritesSkeleton />
          ) : state === "error" ? (
            <div className="rounded-[16px] border border-dashed border-[var(--fr-hairline)] px-6 py-20 text-center">
              <p className="text-[14px] font-medium">
                Couldn&apos;t load your shelf
              </p>
              <p className="mt-2 text-[12px] text-[var(--fr-ink-muted)]">
                AniList is unavailable right now. Try refreshing in a moment.
              </p>
            </div>
          ) : anime.length === 0 ? (
            <EmptyFavorites />
          ) : filteredAnime.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[var(--fr-hairline)] py-14 text-center">
              <p className="text-[13px] font-medium">
                No favorites match “{query}”
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-2 text-[12px] text-[var(--fr-accent-blue)] hover:underline"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="space-y-9">
              {currentlyAiring.length > 0 && (
                <FavoriteSection
                  title="Currently airing"
                  count={currentlyAiring.length}
                  highlighted
                >
                  {currentlyAiring.map((show) => (
                    <FavoriteCard key={show.id} anime={show} airing />
                  ))}
                </FavoriteSection>
              )}
              {allOthers.length > 0 && (
                <FavoriteSection title="All others" count={allOthers.length}>
                  {allOthers.map((show) => (
                    <FavoriteCard key={show.id} anime={show} />
                  ))}
                </FavoriteSection>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function FavoriteSection({
  title,
  count,
  highlighted = false,
  children,
}: {
  title: string;
  count: number;
  highlighted?: boolean;
  children: React.ReactNode;
}) {
  const id = `favorites-${highlighted ? "airing" : "others"}`;

  return (
    <section aria-labelledby={id}>
      <div className="mb-3 flex items-center gap-2.5">
        {highlighted && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[color-mix(in_srgb,var(--fr-accent-blue)_16%,transparent)] text-[var(--fr-accent-blue)]">
            <Radio className="h-3.5 w-3.5" />
          </span>
        )}
        <h2 id={id} className="text-[14px] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        <span className="text-[11px] tabular-nums text-[var(--fr-ink-muted)]">
          {count}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function FavoriteCard({
  anime,
  airing = false,
}: {
  anime: AiringAnime;
  airing?: boolean;
}) {
  return (
    <article className="group relative flex h-[152px] min-w-0 gap-3 overflow-hidden rounded-[13px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] p-2.5 transition-colors hover:border-white/20">
      <Link
        href={animePath(anime.id, anime.title)}
        className="relative aspect-[2/3] h-full shrink-0 overflow-hidden rounded-[8px] bg-[var(--fr-surface-2)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60"
      >
        {anime.coverImage && (
          <Image
            src={anime.coverImage}
            alt=""
            fill
            sizes="88px"
            className="object-cover transition duration-300 group-hover:scale-[1.025]"
          />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={
              airing
                ? "inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--fr-accent-blue)]"
                : "text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--fr-ink-muted)]"
            }
          >
            {airing && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {airing ? "Airing" : "Saved"}
          </span>
          <FavoriteButton animeId={anime.id} className="-mr-1 -mt-1 shrink-0" />
        </div>
        <h3 className="mt-1 min-w-0 text-[14px] font-semibold leading-[1.25] tracking-[-0.02em]">
          <Link
            href={animePath(anime.id, anime.title)}
            className="line-clamp-2 overflow-hidden break-words outline-none focus-visible:underline"
          >
            {anime.title}
          </Link>
        </h3>
        <p className="mt-2 truncate text-[11px] text-[var(--fr-ink-muted)]">
          {anime.next
            ? `Episode ${anime.next.episode} next`
            : anime.totalEpisodes
              ? `${anime.totalEpisodes} episodes`
              : "Release information unavailable"}
        </p>
        <div className="mt-auto flex min-w-0 gap-1.5 overflow-hidden pt-2">
          {anime.genres.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="min-w-0 truncate rounded-full bg-white/[0.05] px-2 py-1 text-[9px] text-[var(--fr-ink-muted)]"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function EmptyFavorites() {
  return (
    <div className="flex min-h-[440px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[var(--fr-hairline)] px-6 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--fr-surface-1)]">
        <Star className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-[20px] font-semibold tracking-[-0.035em]">
        Your shelf is ready
      </h2>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--fr-ink-muted)]">
        Follow shows from discovery or any anime detail page. They’ll stay saved
        on this device.
      </p>
      <Link
        href="/discover"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-black outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]"
      >
        <Compass className="h-4 w-4" />
        Explore anime
      </Link>
    </div>
  );
}

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex h-[190px] gap-4 rounded-[16px] border border-[var(--fr-hairline)] p-3"
        >
          <Skeleton className="aspect-[2/3] w-[108px] rounded-[10px]" />
          <div className="flex-1 pt-2">
            <Skeleton className="h-2.5 w-24 rounded-full" />
            <Skeleton className="mt-4 h-4 w-[85%] rounded-full" />
            <Skeleton className="mt-2 h-4 w-[60%] rounded-full" />
            <Skeleton className="mt-5 h-2.5 w-full rounded-full" />
            <Skeleton className="mt-2 h-2.5 w-[75%] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
