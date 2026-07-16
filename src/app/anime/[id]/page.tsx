import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAnimeDetail, plainText } from "@/lib/anilist";
import { DetailHero } from "@/features/anime-detail/components/detail-hero";
import { Synopsis } from "@/features/anime-detail/components/synopsis";
import { NextEpisode } from "@/features/anime-detail/components/next-episode";
import { EpisodeGuide } from "@/features/anime-detail/components/episode-guide";
import { Characters } from "@/features/anime-detail/components/characters";
import { Staff } from "@/features/anime-detail/components/staff";
import { Themes } from "@/features/anime-detail/components/themes";
import { Community } from "@/features/anime-detail/components/community";
import { RelatedTitles, Recommendations } from "@/features/anime-detail/components/media-links";
import { Reviews } from "@/features/anime-detail/components/reviews";
import { DetailAside } from "@/features/anime-detail/components/detail-aside";

export const revalidate = 3600;

type DetailPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const id = parseId((await params).id);
  if (id == null) return { title: "Anime not found — Airing" };
  const anime = await fetchAnimeDetail(id).catch(() => null);
  if (!anime) return { title: "Anime not found — Airing" };
  const title = anime.title.english || anime.title.userPreferred;
  return {
    title: `${title} — Airing`,
    description: plainText(anime.description).slice(0, 155),
    openGraph: {
      title,
      description: plainText(anime.description).slice(0, 155),
      images: anime.bannerImage ? [anime.bannerImage] : [anime.coverImage.extraLarge],
    },
  };
}

export default async function AnimeDetailPage({ params }: DetailPageProps) {
  const id = parseId((await params).id);
  if (id == null) notFound();
  const anime = await fetchAnimeDetail(id).catch(() => null);
  if (!anime) notFound();

  const accent = anime.coverImage.color || "#6a4cf5";
  const title = anime.title.english || anime.title.userPreferred;
  const subtitle = anime.title.romaji !== title ? anime.title.romaji : anime.title.native;
  const mainStudio = anime.studios.edges.find((studio) => studio.isMain)?.node;
  const detailStyle = { "--detail-accent": accent } as CSSProperties;

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--fr-canvas)]" style={detailStyle}>
      <DetailHero anime={anime} accent={accent} title={title} subtitle={subtitle} />

      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:py-18">
        <div className="min-w-0 space-y-14">
          <Synopsis anime={anime} />
          {anime.nextAiringEpisode && (
            <NextEpisode
              episode={anime.nextAiringEpisode.episode}
              airingAt={anime.nextAiringEpisode.airingAt}
            />
          )}
          <EpisodeGuide anime={anime} />
          <Characters anime={anime} />
          <Staff anime={anime} />
          <Themes anime={anime} />
          <Community anime={anime} />
          <RelatedTitles anime={anime} />
          <Recommendations anime={anime} />
          <Reviews anime={anime} />
        </div>

        <DetailAside anime={anime} mainStudio={mainStudio?.name} />
      </div>
    </main>
  );
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
