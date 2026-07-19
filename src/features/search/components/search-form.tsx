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
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--fr-ink-muted)]" aria-hidden="true" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value.slice(0, 100))}
        placeholder="Search title, studio, or keyword"
        aria-label="Search anime titles"
        autoFocus={autoFocus}
        className="h-14 w-full rounded-[14px] border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] pl-12 pr-14 text-[15px] outline-none transition placeholder:text-[var(--fr-ink-muted)] hover:border-white/15 focus:border-[var(--fr-accent-blue)]/60 focus:ring-4 focus:ring-[var(--fr-accent-blue)]/10 sm:h-16 sm:pr-36 sm:text-base"
      />
      <button
        type="submit"
        disabled={!query.trim()}
        className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[10px] bg-[var(--fr-ink)] text-[var(--fr-canvas)] outline-none transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)] sm:flex sm:w-auto sm:gap-2 sm:px-4 sm:text-[13px] sm:font-medium"
      >
        <span className="hidden sm:inline">Search</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only sm:hidden">Search</span>
      </button>
    </form>
  );
}
