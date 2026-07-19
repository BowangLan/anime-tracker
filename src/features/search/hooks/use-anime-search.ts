"use client";

import { useEffect, useState } from "react";
import type { AnimeSearchResult } from "@/lib/anilist";
import { cue } from "@/lib/sound";

export type SearchState = "idle" | "loading" | "success" | "error";

interface SearchResponse {
  query: string;
  results: AnimeSearchResult[];
  error: string;
}

export function useAnimeSearch(query: string) {
  const searchQuery = query.trim();
  const [response, setResponse] = useState<SearchResponse>({
    query: "",
    results: [],
    error: "",
  });

  useEffect(() => {
    if (!searchQuery) return;

    const controller = new AbortController();

    const search = async () => {
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
        });
        const payload = (await res.json()) as {
          results?: AnimeSearchResult[];
          error?: string;
        };
        if (!res.ok) throw new Error(payload.error || "Search failed.");
        const results = payload.results ?? [];
        setResponse({ query: searchQuery, results, error: "" });
        cue(results.length > 0 ? "droplet" : "whisper");
      } catch (error) {
        if (controller.signal.aborted) return;
        setResponse({
          query: searchQuery,
          results: [],
          error: error instanceof Error ? error.message : "Search failed.",
        });
      }
    };

    void search();
    return () => controller.abort();
  }, [searchQuery]);

  const state: SearchState = !searchQuery
    ? "idle"
    : response.query !== searchQuery
      ? "loading"
      : response.error
        ? "error"
        : "success";

  return {
    searchQuery,
    state,
    results: response.query === searchQuery ? response.results : [],
    error: response.query === searchQuery ? response.error : "",
  };
}
