"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// The only client-owned, persisted state: which shows the user follows.
// The schedule itself is fetched live from AniList on the server — see
// lib/anilist.ts — so it never needs to live here.

interface FollowState {
  following: number[]; // AniList media ids
  toggleFollow: (id: number) => void;
  isFollowing: (id: number) => boolean;
}

export const useFollows = create<FollowState>()(
  persist(
    (set, get) => ({
      following: [],
      toggleFollow: (id) =>
        set((s) => ({
          following: s.following.includes(id)
            ? s.following.filter((f) => f !== id)
            : [...s.following, id],
        })),
      isFollowing: (id) => get().following.includes(id),
    }),
    { name: "airing-follows-v1", version: 1 },
  ),
);
