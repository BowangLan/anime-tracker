"use client";

import { useCallback, useMemo } from "react";
import type { EpisodeAiring } from "@/lib/anilist";
import { unwatchedAiredEpisodes } from "@/lib/schedule";
import { episodeKey, useWatchedEpisodesStore } from "@/stores/watched-episodes-store";

/** Watched state and actions scoped to one anime. */
export function useWatchedEpisodes(animeId: number) {
  const watchedKeys = useWatchedEpisodesStore((state) => state.watched);
  const toggleStoredEpisode = useWatchedEpisodesStore((state) => state.toggleWatched);

  const watchedEpisodes = useMemo(() => {
    const prefix = `${animeId}:`;
    return new Set(
      watchedKeys.flatMap((key) =>
        key.startsWith(prefix) ? [Number(key.slice(prefix.length))] : [],
      ),
    );
  }, [animeId, watchedKeys]);

  const isWatched = useCallback(
    (episode: number) => watchedEpisodes.has(episode),
    [watchedEpisodes],
  );
  const toggleWatched = useCallback(
    (episode: number) => toggleStoredEpisode(animeId, episode),
    [animeId, toggleStoredEpisode],
  );

  return { watchedEpisodes, isWatched, toggleWatched };
}

/** Watched state and toggle action scoped to one episode. */
export function useWatchedEpisode(animeId: number, episode: number) {
  const watched = useWatchedEpisodesStore((state) =>
    state.watched.includes(episodeKey(animeId, episode)),
  );
  const toggleStoredEpisode = useWatchedEpisodesStore((state) => state.toggleWatched);
  const toggleWatched = useCallback(
    () => toggleStoredEpisode(animeId, episode),
    [animeId, episode, toggleStoredEpisode],
  );

  return { watched, toggleWatched };
}

/** Derived catch-up state for all reliably aired episodes of one anime. */
export function useAnimeWatchProgress(
  animeId: number,
  schedule: EpisodeAiring[],
  now: number,
) {
  const { watchedEpisodes, isWatched } = useWatchedEpisodes(animeId);
  const unwatchedEpisodes = useMemo(
    () => unwatchedAiredEpisodes(schedule, watchedEpisodes, now),
    [now, schedule, watchedEpisodes],
  );

  return {
    isWatched,
    unwatchedEpisodes,
    needsAttention: unwatchedEpisodes.length > 0,
  };
}
