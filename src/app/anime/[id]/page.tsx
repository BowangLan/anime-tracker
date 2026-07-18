import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
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
import { animePath, animeSlug, SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 3600;

// Generate anime detail pages into the Full Route Cache on first visit, then
// refresh them hourly. Returning an empty array is the documented Next.js 16
// pattern for runtime ISR when Cache Components are not enabled.
export function generateStaticParams() {
  return [];
}

type DetailPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const id = parseId((await params).id);
  if (id == null) return { title: "Anime not found", robots: { index: false } };
  const anime = await fetchAnimeDetail(id).catch(() => null);
  if (!anime) return { title: "Anime not found", robots: { index: false } };
  const title = anime.title.english || anime.title.userPreferred;
  const description =
    plainText(anime.description).slice(0, 155) ||
    `View episodes, release information, cast, staff, and related titles for ${title}.`;
  const path = animePath(anime.id, title);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      images: anime.bannerImage
        ? [anime.bannerImage]
        : [anime.coverImage.extraLarge],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [anime.bannerImage ?? anime.coverImage.extraLarge],
    },
  };
}

export default async function AnimeDetailPage({ params }: DetailPageProps) {
  const segment = (await params).id;
  const id = parseId(segment);
  if (id == null) notFound();
  const anime = await fetchAnimeDetail(id).catch(() => null);
  if (!anime) notFound();

  const accent = anime.coverImage.color || "#6a4cf5";
  const title = anime.title.english || anime.title.userPreferred;
  const canonicalSegment = animeSlug(anime.id, title);
  if (segment !== canonicalSegment) permanentRedirect(`/anime/${canonicalSegment}`);

  const subtitle =
    anime.title.romaji !== title ? anime.title.romaji : anime.title.native;
  const mainStudio = anime.studios.edges.find((studio) => studio.isMain)?.node;
  const detailStyle = { "--detail-accent": accent } as CSSProperties;
  const canonicalUrl = new URL(`/anime/${canonicalSegment}`, SITE_URL).href;
  const description = plainText(anime.description);
  const schemaType =
    anime.format === "MOVIE"
      ? "Movie"
      : anime.format === "TV" || anime.format === "TV_SHORT"
        ? "TVSeries"
        : "CreativeWorkSeries";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": schemaType,
        "@id": `${canonicalUrl}#series`,
        url: canonicalUrl,
        name: title,
        alternateName: [anime.title.romaji, anime.title.native].filter(Boolean),
        description,
        image: [anime.coverImage.extraLarge, anime.bannerImage].filter(Boolean),
        genre: anime.genres,
        numberOfEpisodes:
          schemaType === "TVSeries" ? anime.episodes ?? undefined : undefined,
        startDate: formatSchemaDate(anime.startDate),
        endDate: formatSchemaDate(anime.endDate),
        sameAs: anime.siteUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: SITE_URL.href,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <main
      className="min-h-screen bg-[var(--fr-canvas)] flex flex-col max-h-screen"
      style={detailStyle}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
          className="mx-auto grid max-w-[1180px] scroll-mt-24 gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_260px] px-5 sm:px-8 lg:py-10"
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
  const match = /^(\d+)(?:-|$)/.exec(value);
  const id = match ? Number(match[1]) : Number.NaN;
  return Number.isInteger(id) && id > 0 ? id : null;
}

function formatSchemaDate(date: { year: number | null; month: number | null; day: number | null }) {
  if (!date.year) return undefined;
  if (!date.month) return String(date.year);
  const month = String(date.month).padStart(2, "0");
  if (!date.day) return `${date.year}-${month}`;
  return `${date.year}-${month}-${String(date.day).padStart(2, "0")}`;
}
