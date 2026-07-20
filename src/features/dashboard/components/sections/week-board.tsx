"use client";

import { cn } from "@/lib/utils";
import { dayLabel, type BoardModel } from "@/features/dashboard/lib/board-model";
import { AnimeCard } from "../cards/anime-card";
import { EmptyState } from "../empty-state";
import { SectionHeader } from "./section-header";
import { episodeOnLocalDate } from "@/lib/schedule";

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function dateForOffset(now: number, offset: number) {
  const date = new Date(now);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function dateTimeValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function WeekBoard({
  model,
  now,
  onlyFollowing,
  hasQuery,
  onClear,
  showHeader = true,
}: {
  model: BoardModel;
  now: number;
  onlyFollowing: boolean;
  hasQuery: boolean;
  onClear: () => void;
  showHeader?: boolean;
}) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {showHeader && <SectionHeader title={"This week's schedule"} description="Scroll across the seven days" />}

      {model.total === 0 ? (
        <EmptyState onlyFollowing={onlyFollowing} hasQuery={hasQuery} onClear={onClear} />
      ) : (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="absolute inset-0 -mx-5 flex items-stretch gap-4 overflow-x-auto overflow-y-hidden px-5 pb-2">
            {model.order.map((day, dayOffset) => {
              const entries = model.byDay.get(day) ?? [];
              const { name } = dayLabel(day, model.today);
              const isToday = day === model.today;
              const date = dateForOffset(now, dayOffset);
              return (
                <section
                  key={day}
                  className="flex h-full min-h-0 w-[340px] shrink-0 flex-col overflow-hidden"
                >
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-between px-3 py-2",
                      isToday
                        ? ""
                        : "",
                    )}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <time
                        dateTime={dateTimeValue(date)}
                        className="text-[13px] text-[var(--fr-ink-muted)]"
                      >
                        {shortDateFormatter.format(date)}
                      </time>
                    </div>
                    <span className="tabular-nums text-[13px] text-[var(--fr-ink-muted)]">
                      {entries.length}
                    </span>
                  </div>

                  <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain">
                    {entries.length === 0 ? (
                      <p className="rounded-[12px] border border-dashed border-[var(--fr-hairline)] px-3 py-6 text-center text-[12px] text-[var(--fr-ink-muted)]">
                        No updates
                      </p>
                    ) : (
                      entries.map((e) => (
                        <AnimeCard
                          key={e.anime.id}
                          anime={e.anime}
                          airing={e.airing}
                          now={now}
                          episode={episodeOnLocalDate(e.anime.schedule, date)}
                          density="roomy"
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
