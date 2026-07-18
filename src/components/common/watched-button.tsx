"use client";

import { CheckCircle2, CircleCheck } from "lucide-react";
import { useWatchedEpisode } from "@/hooks/use-watched-episodes";
import { cn } from "@/lib/utils";

export function WatchedButton({
  animeId,
  episode,
  compact = false,
  disabled = false,
  showEpisode = false,
  className,
}: {
  animeId: number;
  episode: number;
  compact?: boolean;
  disabled?: boolean;
  showEpisode?: boolean;
  className?: string;
}) {
  const { watched, toggleWatched } = useWatchedEpisode(animeId, episode);

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={watched}
      aria-label={`Mark episode ${episode} ${watched ? "unwatched" : "watched"}`}
      title={disabled ? "This episode has not aired yet" : watched ? "Mark as unwatched" : "Mark as watched"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWatched();
      }}
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)] disabled:cursor-not-allowed disabled:opacity-40",
        compact ? "h-10 w-10" : "h-10 px-3 text-[11px]",
        watched
          ? "border-white/15 bg-black/55 text-white/65 backdrop-blur-md hover:text-white"
          : "border-white/80 bg-white text-black hover:bg-white/85",
        className,
      )}
    >
      {watched ? <CircleCheck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
      {!compact && `${showEpisode ? `Ep ${episode} · ` : ""}${watched ? "Watched" : "Mark watched"}`}
    </button>
  );
}
