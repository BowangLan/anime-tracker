"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "anime-tracker.search-history";
const HISTORY_EVENT = "anime-tracker:search-history";
const MAX_HISTORY_ITEMS = 8;
const REFINEMENT_WINDOW_MS = 2 * 60 * 1000;

export interface SearchHistoryEntry {
  query: string;
  searchedAt: number;
}

function isRefinement(first: string, second: string) {
  const a = first.toLowerCase();
  const b = second.toLowerCase();
  return a.includes(b) || b.includes(a);
}

function moreSpecific(first: SearchHistoryEntry, second: SearchHistoryEntry) {
  const specific = first.query.length >= second.query.length ? first : second;
  return { query: specific.query, searchedAt: Math.max(first.searchedAt, second.searchedAt) };
}

export function normalizeSearchHistory(value: unknown): SearchHistoryEntry[] {
  if (!Array.isArray(value)) return [];

  const entries = value.flatMap((item): SearchHistoryEntry[] => {
    if (typeof item === "string") {
      const query = item.trim().slice(0, 100);
      return query ? [{ query, searchedAt: 0 }] : [];
    }
    if (!item || typeof item !== "object") return [];

    const candidate = item as { query?: unknown; searchedAt?: unknown };
    if (typeof candidate.query !== "string") return [];
    const query = candidate.query.trim().slice(0, 100);
    if (!query) return [];
    return [{
      query,
      searchedAt: typeof candidate.searchedAt === "number" ? candidate.searchedAt : 0,
    }];
  });

  return entries.reduce<SearchHistoryEntry[]>((history, entry) => {
    if (history.some((item) => item.query.toLowerCase() === entry.query.toLowerCase())) {
      return history;
    }

    const previous = history.at(-1);
    if (previous?.searchedAt === 0 && entry.searchedAt === 0 && isRefinement(previous.query, entry.query)) {
      history[history.length - 1] = moreSpecific(previous, entry);
      return history;
    }

    history.push(entry);
    return history;
  }, []).slice(0, MAX_HISTORY_ITEMS);
}

export function addSearchHistoryEntry(
  history: SearchHistoryEntry[],
  query: string,
  searchedAt: number,
) {
  const withoutDuplicate = history.filter(
    (item) => item.query.toLowerCase() !== query.toLowerCase(),
  );
  const latest = withoutDuplicate[0];
  const entry = { query, searchedAt };
  const refinesLatest = latest
    && latest.searchedAt > 0
    && searchedAt - latest.searchedAt <= REFINEMENT_WINDOW_MS
    && isRefinement(query, latest.query);

  return (refinesLatest
    ? [moreSpecific(entry, latest), ...withoutDuplicate.slice(1)]
    : [entry, ...withoutDuplicate]
  ).slice(0, MAX_HISTORY_ITEMS);
}

function readEntries(): SearchHistoryEntry[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return normalizeSearchHistory(stored);
  } catch {
    return [];
  }
}

function writeEntries(history: SearchHistoryEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Search still works when storage is unavailable (for example, in a
    // privacy-restricted browser); only the optional history is skipped.
  }
  window.dispatchEvent(new Event(HISTORY_EVENT));
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncHistory = () => {
      setHistory(readEntries().map((entry) => entry.query));
      setIsReady(true);
    };

    syncHistory();
    window.addEventListener("storage", syncHistory);
    window.addEventListener(HISTORY_EVENT, syncHistory);

    return () => {
      window.removeEventListener("storage", syncHistory);
      window.removeEventListener(HISTORY_EVENT, syncHistory);
    };
  }, []);

  const addSearch = useCallback((value: string) => {
    const query = value.trim().slice(0, 100);
    if (!query) return;

    const searchedAt = Date.now();
    writeEntries(addSearchHistoryEntry(readEntries(), query, searchedAt));
  }, []);

  const removeSearch = useCallback((value: string) => {
    writeEntries(readEntries().filter((item) => item.query !== value));
  }, []);

  const clearHistory = useCallback(() => writeEntries([]), []);

  return { history, isReady, addSearch, removeSearch, clearHistory };
}
