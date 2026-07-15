"use client";

import { Star } from "lucide-react";
import { cue } from "@/lib/sound";
import { useFollows } from "@/lib/store";
import { cn } from "@/lib/utils";

export function FavoriteButton({ animeId, className }: { animeId: number; className?: string }) {
  const following = useFollows((state) => state.following.includes(animeId));
  const toggleFollow = useFollows((state) => state.toggleFollow);

  return (
    <button
      type="button"
      aria-label={following ? "Unfollow" : "Follow"}
      aria-pressed={following}
      onClick={() => {
        cue(following ? "tick" : "success");
        toggleFollow(animeId);
      }}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full bg-[var(--fr-surface-1)] text-[var(--fr-ink)] transition hover:bg-[var(--fr-surface-2)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--fr-accent-blue)]",
        className,
      )}
    >
      <Star className={cn("h-3.5 w-3.5", following && "fill-current")} />
    </button>
  );
}
