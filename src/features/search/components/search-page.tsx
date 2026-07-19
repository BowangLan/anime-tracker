"use client";

import Link from "next/link";
import { Clock3, Search, X } from "lucide-react";
import { PageHeader } from "@/components/app-shell/page-header";
import { SearchForm } from "./search-form";
import { useSearchHistory } from "@/features/search/hooks/use-search-history";

export function SearchPage() {
  const { history, isReady, removeSearch, clearHistory } = useSearchHistory();

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden">
      <PageHeader title="Search" description="Search the complete AniList catalog" />
      <div className="shrink-0 border-b border-[var(--fr-hairline-soft)] px-4 py-3 sm:px-7">
        <div className="mr-auto w-full max-w-2xl">
          <SearchForm autoFocus />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-5 sm:px-7 sm:py-6">
        <div className="mr-auto w-full max-w-2xl">
          <section aria-labelledby="recent-searches-heading">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[var(--fr-ink-muted)]" aria-hidden="true" />
                <h2 id="recent-searches-heading" className="text-[13px] font-medium text-[var(--fr-ink)]">Recent searches</h2>
              </div>
              {history.length > 0 && (
                <button type="button" onClick={clearHistory} className="text-[11px] text-[var(--fr-ink-muted)] outline-none hover:text-[var(--fr-ink)] focus-visible:underline">
                  Clear all
                </button>
              )}
            </div>

            {!isReady ? (
              <div className="mt-4 h-14 animate-pulse rounded-[12px] bg-[var(--fr-surface-1)]" />
            ) : history.length > 0 ? (
              <ul className="mt-3 divide-y divide-[var(--fr-hairline-soft)] border-y border-[var(--fr-hairline-soft)]">
                {history.map((query) => (
                  <li key={query} className="group flex items-center gap-2">
                    <Link href={`/search/results?q=${encodeURIComponent(query)}`} className="flex min-w-0 flex-1 items-center gap-3 py-3.5 text-[14px] outline-none hover:text-[var(--fr-accent-blue)] focus-visible:text-[var(--fr-accent-blue)]">
                      <Search className="h-3.5 w-3.5 shrink-0 text-[var(--fr-ink-muted)]" aria-hidden="true" />
                      <span className="truncate">{query}</span>
                    </Link>
                    <button type="button" onClick={() => removeSearch(query)} aria-label={`Remove ${query} from recent searches`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--fr-ink-muted)] opacity-70 outline-none transition hover:bg-white/[0.06] hover:text-[var(--fr-ink)] focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]">
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-[14px] border border-dashed border-[var(--fr-hairline)] px-5 py-8 text-center">
                <p className="text-[13px] font-medium text-[var(--fr-ink)]">No recent searches</p>
                <p className="mt-1 text-[12px] text-[var(--fr-ink-muted)]">Searches made on this device will appear here.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
