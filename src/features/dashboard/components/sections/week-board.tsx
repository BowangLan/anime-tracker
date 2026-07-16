"use client";

import type { RefObject } from "react";
import type { Weekday } from "@/lib/anilist";
import { cn } from "@/lib/utils";
import { dayLabel, type BoardModel } from "@/features/dashboard/lib/board-model";
import { AnimeCard } from "../cards/anime-card";
import { EmptyState } from "../empty-state";
import { SectionHeader } from "./section-header";

export function WeekBoard({
  model,
  now,
  onlyFollowing,
  hasQuery,
  onClear,
  columnRefs,
}: {
  model: BoardModel;
  now: number;
  onlyFollowing: boolean;
  hasQuery: boolean;
  onClear: () => void;
  columnRefs: RefObject<Map<Weekday, HTMLElement | null>>;
}) {
  return (
    <section className="min-w-0">
      <SectionHeader title={"This week's schedule"} description="Scroll across the seven days" />

      {model.total === 0 ? (
        <EmptyState onlyFollowing={onlyFollowing} hasQuery={hasQuery} onClear={onClear} />
      ) : (
        <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
          {model.order.map((day) => {
            const entries = model.byDay.get(day) ?? [];
            const { name } = dayLabel(day, model.today);
            const isToday = day === model.today;
            return (
              <section
                key={day}
                ref={(el) => {
                  columnRefs.current.set(day, el);
                }}
                className="flex w-[272px] shrink-0 flex-col"
              >
                <div
                  className={cn(
                    "sticky top-0 flex items-center justify-between rounded-[10px] border px-3 py-2",
                    isToday
                      ? "border-[var(--fr-accent-blue)]/40 bg-[var(--fr-accent-blue)]/10"
                      : "border-[var(--fr-hairline)] bg-[var(--fr-surface-1)]",
                  )}
                >
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--fr-ink)]">{name}</p>
                  </div>
                  <span className="tabular-nums text-[13px] text-[var(--fr-ink-muted)]">
                    {entries.length}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2.5">
                  {entries.length === 0 ? (
                    <p className="rounded-[12px] border border-dashed border-[var(--fr-hairline)] px-3 py-6 text-center text-[12px] text-[var(--fr-ink-muted)]">
                      No updates
                    </p>
                  ) : (
                    entries.map((e) => (
                      <AnimeCard key={e.anime.id} anime={e.anime} airing={e.airing} now={now} />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
