import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchAiringAnime } from "@/lib/anilist";
import { SchedulePage } from "@/features/schedule/components/schedule-page";
import DashboardLoading from "@/features/dashboard/components/dashboard-loading";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Schedule — Anime Tracker", description: "A timezone-aware weekly schedule for currently airing anime." };

export default function Page() {
  return <Suspense fallback={<DashboardLoading />}><ScheduleData /></Suspense>;
}

async function ScheduleData() {
  const anime = await fetchAiringAnime().catch(() => null);
  if (!anime) return <DataError />;
  return <SchedulePage anime={anime} />;
}

function DataError() {
  return <div className="grid min-h-[70vh] place-items-center px-6 text-center"><div><h1 className="text-[22px] font-semibold tracking-[-0.03em]">Couldn&apos;t reach the schedule</h1><p className="mt-2 text-[14px] text-[var(--fr-ink-muted)]">AniList didn&apos;t respond. Refresh in a moment.</p></div></div>;
}
