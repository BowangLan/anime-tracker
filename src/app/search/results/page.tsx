import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SearchResultsPage } from "@/features/search/components/search-results-page";

export const metadata: Metadata = {
  title: "Anime Search Results",
  description: "Browse matching anime from the AniList catalog.",
  robots: { index: false, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const query = (await searchParams).q;
  if (typeof query !== "string" || !query.trim()) redirect("/search");

  return (
    <Suspense fallback={<SearchResultsFallback />}>
      <SearchResultsPage />
    </Suspense>
  );
}

function SearchResultsFallback() {
  return (
    <div className="grid h-full min-h-[70vh] place-items-center text-sm text-[var(--fr-ink-muted)]">
      Loading search…
    </div>
  );
}
