import { Suspense } from "react";
import { fetchAiringAnime } from "@/lib/anilist";
import { Dashboard } from "@/components/dashboard";
import Loading from "./loading";

// Statically generate and refresh hourly — airing schedules are stable within
// an hour, and this keeps us well inside AniList's rate limits.
export const revalidate = 3600;

export default async function Home() {
  let anime;
  try {
    anime = await fetchAiringAnime();
  } catch {
    return <LoadError />;
  }
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard anime={anime} />
    </Suspense>
  );
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
