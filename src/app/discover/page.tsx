import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchDiscoverSections } from "@/lib/anilist";
import { DiscoverPage } from "@/features/discover/components/discover-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Discover Current Anime",
  description:
    "Explore trending, popular, upcoming, and overlooked anime from the current season, or search the complete AniList catalog.",
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
    <Suspense
      fallback={
        <div className="grid min-h-[70vh] place-items-center text-sm text-[var(--fr-ink-muted)]">
          Loading current anime…
        </div>
      }
    >
      <DiscoverData />
    </Suspense>
  );
}

async function DiscoverData() {
  const sections = await fetchDiscoverSections().catch(() => null);
  if (!sections) return <div className="grid min-h-[70vh] place-items-center px-6 text-center"><div><h1 className="text-[22px] font-semibold">Couldn&apos;t load discovery</h1><p className="mt-2 text-[14px] text-[var(--fr-ink-muted)]">AniList didn&apos;t respond. Refresh in a moment.</p></div></div>;
  return <DiscoverPage sections={sections} />;
}
