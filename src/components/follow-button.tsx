"use client";

import { Star } from "lucide-react";
import { useFollows } from "@/lib/store";

export function FollowButton({ id }: { id: number }) {
  const following = useFollows((state) => state.following.includes(id));
  const toggleFollow = useFollows((state) => state.toggleFollow);

  return (
    <button
      type="button"
      onClick={() => toggleFollow(id)}
      aria-pressed={following}
      className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-semibold text-black transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--detail-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      <Star className={`h-4 w-4 ${following ? "fill-current" : ""}`} />
      {following ? "Following" : "Follow show"}
    </button>
  );
}
