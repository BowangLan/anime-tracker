"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app-shell/page-header";
import { useNow } from "@/hooks/use-now";
import { useAnimeSearch } from "@/features/search/hooks/use-anime-search";
import { SearchForm } from "./search-form";
import { SearchResults } from "./search-results";

export function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const search = useAnimeSearch(query);
  const now = useNow();

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader title="Search results" description={`Results for ${query}`} showBackButton />
      <div className="shrink-0 border-b border-[var(--fr-hairline-soft)] px-4 py-3 sm:px-7">
        <div className="mr-auto w-full max-w-2xl">
          <SearchForm key={query} initialQuery={query} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 sm:px-7 sm:py-6">
        <SearchResults
          results={search.results}
          query={search.searchQuery}
          now={now ?? 0}
          state={search.state}
          error={search.error}
          onClear={() => router.push("/search")}
        />
      </div>
    </main>
  );
}
