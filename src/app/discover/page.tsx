import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAiringAnime } from "@/lib/anilist";
import { DiscoverPage } from "@/features/discover/components/discover-page";
import { PageHeader } from "@/components/app-shell/page-header";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Discover Current Anime",
  description:
    "Browse currently airing anime by genre, popularity, title, or next release, and search the complete AniList anime catalog.",
  alternates: { canonical: "/discover" },
  openGraph: {
    title: "Discover Current Anime",
    description:
      "Browse this season's currently airing anime and search the complete AniList catalog.",
    url: "/discover",
  },
};

export default function Page() {
  return (
    <main className="min-h-full">
      <PageHeader
        eyebrow="Catalog"
        title="Discover current anime"
        description="Search the full AniList catalog or filter the current airing season"
      />
      <Suspense
        fallback={
          <div className="grid min-h-[70vh] place-items-center text-sm text-[var(--fr-ink-muted)]">
            Loading current anime…
          </div>
        }
      >
        <DiscoverData />
      </Suspense>
    </main>
  );
}

async function DiscoverData() {
  const anime = await fetchAiringAnime().catch(() => null);
  if (!anime) return <div className="grid min-h-[70vh] place-items-center px-6 text-center"><div><h1 className="text-[22px] font-semibold">Couldn&apos;t load discovery</h1><p className="mt-2 text-[14px] text-[var(--fr-ink-muted)]">AniList didn&apos;t respond. Refresh in a moment.</p></div></div>;
  return <DiscoverPage anime={anime} />;
}
