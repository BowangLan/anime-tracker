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
import {
  RelatedTitles,
  Recommendations,
} from "@/features/anime-detail/components/media-links";
import { Reviews } from "@/features/anime-detail/components/reviews";
import { DetailAside } from "@/features/anime-detail/components/detail-aside";
import { PageHeader } from "@/components/app-shell/page-header";
import { label } from "@/features/anime-detail/lib/format";

export const revalidate = 3600;

type DetailPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const id = parseId((await params).id);
  if (id == null) return { title: "Anime not found — Anime Tracker" };
  const anime = await fetchAnimeDetail(id).catch(() => null);
  if (!anime) return { title: "Anime not found — Anime Tracker" };
  const title = anime.title.english || anime.title.userPreferred;
  return {
    title: `${title} — Anime Tracker`,
    description: plainText(anime.description).slice(0, 155),
    openGraph: {
      title,
      description: plainText(anime.description).slice(0, 155),
      images: anime.bannerImage
        ? [anime.bannerImage]
        : [anime.coverImage.extraLarge],
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
  const subtitle =
    anime.title.romaji !== title ? anime.title.romaji : anime.title.native;
  const mainStudio = anime.studios.edges.find((studio) => studio.isMain)?.node;
  const detailStyle = { "--detail-accent": accent } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-[var(--fr-canvas)] flex flex-col max-h-screen"
      style={detailStyle}
    >
      <PageHeader
        showBackButton
        title={title}
        description={[
          subtitle,
          label(anime.format),
          anime.seasonYear
            ? `${label(anime.season)} ${anime.seasonYear}`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      />

      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
        <DetailHero anime={anime} title={title} subtitle={subtitle} />

        <nav
          aria-label="On this page"
          className="sticky top-14 z-20 border-b border-white/8 bg-[var(--fr-canvas)]/92 backdrop-blur-xl lg:top-0"
        >
          <div className="no-scrollbar mx-auto flex max-w-[1180px] gap-5 overflow-x-auto px-5 sm:px-8 lg:px-8">
            {[
              ["overview", "Overview"],
              ["episodes-heading", "Episodes"],
              ["cast-heading", "Cast"],
              ["staff-heading", "Staff"],
              ["community-heading", "Community"],
              ["related-titles", "Related"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={`#${href}`}
                className="shrink-0 border-b-2 border-transparent py-3 text-[12px] font-medium text-white/48 transition hover:border-[var(--detail-accent)] hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div
          id="overview"
          className="mx-auto grid max-w-[1180px] scroll-mt-24 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:px-8 lg:py-10"
        >
          <div className="min-w-0 space-y-10">
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
      </div>
    </main>
  );
}

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
