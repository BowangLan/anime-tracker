"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchedEpisodesState {
  watched: string[];
  toggleWatched: (animeId: number, episode: number) => void;
}

export const episodeKey = (animeId: number, episode: number) => `${animeId}:${episode}`;

export const useWatchedEpisodesStore = create<WatchedEpisodesState>()(
  persist(
    (set) => ({
      watched: [],
      toggleWatched: (animeId, episode) => {
        const key = episodeKey(animeId, episode);
        set((state) => ({
          watched: state.watched.includes(key)
            ? state.watched.filter((item) => item !== key)
            : [...state.watched, key],
        }));
      },
    }),
    {
      name: "anime-watched-episodes-v1",
      version: 1,
      merge: (persisted, current) => {
        const saved = persisted as Partial<WatchedEpisodesState> | undefined;
        const watched = Array.isArray(saved?.watched)
          ? [...new Set(saved.watched.filter((item): item is string =>
              typeof item === "string" && /^\d+:\d+$/.test(item),
            ))]
          : [];
        return { ...current, watched };
      },
    },
  ),
);
