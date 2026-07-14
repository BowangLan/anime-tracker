import { Suspense } from "react";
import { fetchAiringAnime } from "@/lib/anilist";
import { Dashboard } from "@/components/dashboard";
import DashboardLoading from "@/components/dashboard-loading";

// Statically generate and refresh hourly — airing schedules are stable within
// an hour, and this keeps us well inside AniList's rate limits.
export const revalidate = 3600;

export default function Home() {
  // The fetch lives inside the suspended child (not here) so the static shell
  // and the loading fallback stream immediately; the board swaps in when the
  // AniList data resolves, instead of the whole document blocking on it.
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Board />
    </Suspense>
  );
}

async function Board() {
  let anime;
  try {
    anime = await fetchAiringAnime();
  } catch {
    return <LoadError />;
  }
  return <Dashboard anime={anime} />;
}

function LoadError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--fr-canvas)] px-6 text-center">
      <h1
        className="text-[22px] font-semibold text-[var(--fr-ink)]"
        style={{ letterSpacing: "-0.03em" }}
      >
        Couldn&apos;t reach the schedule
      </h1>
      <p className="max-w-sm text-[14px] text-[var(--fr-ink-muted)]">
        The AniList API didn&apos;t respond. Refresh in a moment — the schedule
        is fetched live each hour.
      </p>
    </div>
  );
}
