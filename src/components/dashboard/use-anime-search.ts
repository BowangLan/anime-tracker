"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { AnimeSearchResult } from "@/lib/anilist";
import { cue } from "@/lib/sound";

export type SearchState = "idle" | "loading" | "success" | "error";

interface SearchResponse {
  query: string;
  results: AnimeSearchResult[];
  error: string;
}

/**
 * Owns the search box: reflects `?q=` in the URL, debounces requests to the
 * search API, and exposes a derived state machine for the results view.
 */
export function useAnimeSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [response, setResponse] = useState<SearchResponse>({
    query: "",
    results: [],
    error: "",
  });

  useEffect(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(cleanQuery)}`, {
          signal: controller.signal,
        });
        const payload = (await res.json()) as {
          results?: AnimeSearchResult[];
          error?: string;
        };
        if (!res.ok) throw new Error(payload.error || "Search failed.");
        const results = payload.results ?? [];
        setResponse({ query: cleanQuery, results, error: "" });
        // A soft "results landed" cue — one droplet per completed query.
        cue(results.length > 0 ? "droplet" : "whisper");
      } catch (error) {
        if (controller.signal.aborted) return;
        setResponse({
          query: cleanQuery,
          results: [],
          error: error instanceof Error ? error.message : "Search failed.",
        });
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const updateQuery = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextQuery = value.slice(0, 100);
    if (nextQuery.trim()) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }
    const queryString = params.toString();
    const hash = window.location.hash;
    window.history.replaceState(
      null,
      "",
      `${queryString ? `${pathname}?${queryString}` : pathname}${hash}`,
    );
  };

  const clearSearch = () => updateQuery("");

  const searchQuery = query.trim();
  const isSearching = searchQuery.length > 0;

  const state: SearchState = !isSearching
    ? "idle"
    : response.query !== searchQuery
      ? "loading"
      : response.error
        ? "error"
        : "success";
  const results = response.query === searchQuery ? response.results : [];
  const error = response.query === searchQuery ? response.error : "";

  return {
    query,
    searchQuery,
    isSearching,
    updateQuery,
    clearSearch,
    state,
    results,
    error,
  };
}
