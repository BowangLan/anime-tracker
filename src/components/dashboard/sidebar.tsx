"use client";

import { Tv } from "lucide-react";
import { cue } from "@/lib/sound";
import type { Weekday } from "@/lib/anilist";
import { dayLabel, type BoardModel } from "./model";
import { FavoritesSwitch } from "./favorites-switch";

export function Sidebar({
  model,
  onlyFollowing,
  onOnlyFollowingChange,
  onNavigate,
}: {
  model: BoardModel | null;
  onlyFollowing: boolean;
  onOnlyFollowingChange: (value: boolean) => void;
  onNavigate: (day: Weekday) => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--fr-hairline-soft)] bg-[var(--fr-surface-1)]/40 p-4 lg:flex">
      <div className="flex items-center gap-2.5 px-1">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--fr-ink)] text-[var(--fr-canvas)]">
          <Tv className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <span className="text-[15px] font-semibold" style={{ letterSpacing: "-0.03em" }}>
          Airing
        </span>
      </div>

      <p className="fr-eyebrow mt-6 px-1">This week</p>
      <nav className="mt-2 flex flex-col gap-0.5">
        {(model?.order ?? []).map((day) => {
          const { name, rel } = dayLabel(day, model!.today);
          const count = model?.byDay.get(day)?.length ?? 0;
          return (
            <button
              key={day}
              onClick={() => {
                cue("tick");
                onNavigate(day);
              }}
              className="flex items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[13px] text-[var(--fr-ink-muted)] transition hover:bg-white/[0.04] hover:text-[var(--fr-ink)]"
            >
              <span className="flex items-center gap-2">
                {rel === "Today" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--fr-accent-blue)]" />
                )}
                {rel ?? name}
              </span>
              <span className="tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </nav>

      <FavoritesSwitch
        checked={onlyFollowing}
        onCheckedChange={onOnlyFollowingChange}
        className="mt-6"
      />

      <p className="mt-auto px-1 pt-6 text-[11px] leading-relaxed text-[var(--fr-ink-muted)]">
        Live schedule via the{" "}
        <a
          href="https://anilist.co"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--fr-accent-blue)] hover:underline"
        >
          AniList
        </a>{" "}
        API. Follows are saved on this device.
      </p>
    </aside>
  );
}
