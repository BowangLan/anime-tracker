"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { useSearchHistory } from "@/features/search/hooks/use-search-history";

export function SearchForm({ initialQuery = "", autoFocus = false }: { initialQuery?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const { addSearch } = useSearchHistory();
  const [query, setQuery] = useState(initialQuery);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    addSearch(cleanQuery);
    router.push(`/search/results?q=${encodeURIComponent(cleanQuery)}`);
  };

  return (
    <form onSubmit={submitSearch} role="search" className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fr-ink-muted)]" aria-hidden="true" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value.slice(0, 100))}
        placeholder="Search title, studio, or keyword"
        aria-label="Search anime titles"
        autoFocus={autoFocus}
        className="h-11 w-full rounded-[11px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] pl-10 pr-12 text-[13px] outline-none transition placeholder:text-[var(--fr-ink-muted)] hover:border-white/15 focus:border-[var(--fr-accent-blue)]/60 focus:ring-4 focus:ring-[var(--fr-accent-blue)]/10 sm:h-12 sm:pr-32 sm:text-[14px]"
      />
      <button
        type="submit"
        disabled={!query.trim()}
        className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[8px] bg-[var(--fr-ink)] text-[var(--fr-canvas)] outline-none transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)] sm:flex sm:w-auto sm:gap-2 sm:px-3 sm:text-[12px] sm:font-medium"
      >
        <span className="hidden sm:inline">Search</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only sm:hidden">Search</span>
      </button>
    </form>
  );
}
