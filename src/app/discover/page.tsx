import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAiringAnime } from "@/lib/anilist";
import { DiscoverPage } from "@/features/discover/components/discover-page";
import DashboardLoading from "@/features/dashboard/components/dashboard-loading";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Discover — Anime Tracker", description: "Browse the current anime season or search AniList’s full catalog." };

export default function Page() { return <Suspense fallback={<DashboardLoading />}><DiscoverData /></Suspense>; }

async function DiscoverData() {
  const anime = await fetchAiringAnime().catch(() => null);
  if (!anime) return <div className="grid min-h-[70vh] place-items-center px-6 text-center"><div><h1 className="text-[22px] font-semibold">Couldn&apos;t load discovery</h1><p className="mt-2 text-[14px] text-[var(--fr-ink-muted)]">AniList didn&apos;t respond. Refresh in a moment.</p></div></div>;
  return <DiscoverPage anime={anime} />;
}
