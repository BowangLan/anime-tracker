"use client";

import { Star } from "lucide-react";
import { cue } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function FavoritesSwitch({
  checked,
  onCheckedChange,
  compact = false,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={compact ? "Show only my shows" : undefined}
      onClick={() => {
        cue("toggle");
        onCheckedChange(!checked);
      }}
      className={cn(
        "flex shrink-0 items-center rounded-[8px] text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60",
        compact
          ? "px-0.5 py-2"
          : "w-full justify-between px-2.5 py-2 text-[var(--fr-ink)] hover:bg-white/[0.04]",
        className,
      )}
    >
      {!compact && (
        <span className="inline-flex items-center gap-2">
          <Star className={cn("h-4 w-4", checked && "fill-current")} />
          Only my shows
        </span>
      )}
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-block h-5 w-9 rounded-full border transition-colors",
          checked
            ? "border-[var(--fr-accent-blue)] bg-[var(--fr-accent-blue)]"
            : "border-[var(--fr-hairline)] bg-[var(--fr-surface-2)]",
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[17px]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
