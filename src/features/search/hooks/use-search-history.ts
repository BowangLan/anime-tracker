"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "anime-tracker.search-history";
const HISTORY_EVENT = "anime-tracker:search-history";
const MAX_HISTORY_ITEMS = 8;

function readHistory(): string[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored)
      ? stored.filter((item): item is string => typeof item === "string").slice(0, MAX_HISTORY_ITEMS)
      : [];
  } catch {
    return [];
  }
}

function writeHistory(history: string[]) {
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
      setHistory(readHistory());
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

    const nextHistory = [
      query,
      ...readHistory().filter((item) => item.toLowerCase() !== query.toLowerCase()),
    ].slice(0, MAX_HISTORY_ITEMS);
    writeHistory(nextHistory);
  }, []);

  const removeSearch = useCallback((value: string) => {
    writeHistory(readHistory().filter((item) => item !== value));
  }, []);

  const clearHistory = useCallback(() => writeHistory([]), []);

  return { history, isReady, addSearch, removeSearch, clearHistory };
}
