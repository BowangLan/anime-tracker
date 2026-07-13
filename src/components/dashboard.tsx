"use client";

import { useMemo, useRef, useState } from "react";
import { Search, Star, Tv, CalendarClock, Clapperboard, Timer } from "lucide-react";
import type { AiringAnime, Weekday } from "@/lib/anilist";
import { WEEKDAYS } from "@/lib/anilist";
import { deriveAiring, untilLabel, type Airing } from "@/lib/schedule";
import { useNow } from "@/lib/use-now";
import { useFollows } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AnimeCard } from "@/components/anime-card";

interface Entry {
  anime: AiringAnime;
  airing: Airing;
}

/** Weekday values ordered so "today" comes first (dashboard reads forward). */
function weekOrder(today: Weekday): Weekday[] {
  return Array.from({ length: 7 }, (_, i) => ((today + i) % 7) as Weekday);
}

function dayLabel(day: Weekday, today: Weekday): { name: string; rel?: string } {
  const long = WEEKDAYS.find((w) => w.value === day)!.long;
  if (day === today) return { name: long, rel: "Today" };
  if (day === ((today + 1) % 7)) return { name: long, rel: "Tomorrow" };
  return { name: long };
}

export function Dashboard({ anime }: { anime: AiringAnime[] }) {
  const now = useNow();
  const following = useFollows((s) => s.following);

  const [query, setQuery] = useState("");
  const [onlyFollowing, setOnlyFollowing] = useState(false);
  const columnRefs = useRef<Map<Weekday, HTMLElement | null>>(new Map());

  // Derive airing info + group by weekday. All time-based, so it waits for the
  // client clock (see BoardSkeleton fallback below).
  const model = useMemo(() => {
    if (now == null) return null;
    const today = new Date(now).getDay() as Weekday;
    const q = query.trim().toLowerCase();

    const entries: Entry[] = anime
      .map((a) => ({ anime: a, airing: deriveAiring(a, now) }))
      .filter((e) => e.airing.weekday != null)
      .filter((e) => (onlyFollowing ? following.includes(e.anime.id) : true))
      .filter(
        (e) =>
          !q ||
          e.anime.title.toLowerCase().includes(q) ||
          e.anime.studio.toLowerCase().includes(q) ||
          e.anime.genres.some((g) => g.toLowerCase().includes(q)),
      );

    const byDay = new Map<Weekday, Entry[]>();
    for (const d of weekOrder(today)) byDay.set(d, []);
    for (const e of entries) byDay.get(e.airing.weekday!)!.push(e);
    for (const list of byDay.values())
      list.sort(
        (a, b) => (a.airing.nextAiringAt ?? Infinity) - (b.airing.nextAiringAt ?? Infinity),
      );

    const soonest = entries
      .map((e) => e.airing.nextAiringAt)
      .filter((t): t is number => t != null)
      .sort((a, b) => a - b)[0];

    return {
      today,
      order: weekOrder(today),
      byDay,
      total: entries.length,
      todayCount: byDay.get(today)?.length ?? 0,
      followingCount: entries.filter((e) => following.includes(e.anime.id)).length,
      soonest: soonest ?? null,
    };
  }, [anime, now, query, onlyFollowing, following]);

  const scrollToDay = (day: Weekday) =>
    columnRefs.current
      .get(day)
      ?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });

  return (
    <div className="flex min-h-screen bg-[var(--fr-canvas)]">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--fr-hairline-soft)] bg-[var(--fr-surface-1)]/40 p-4 lg:flex">
        <div className="flex items-center gap-2.5 px-1">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--fr-ink)] text-[var(--fr-canvas)]">
            <Tv className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span
            className="text-[15px] font-semibold"
            style={{ letterSpacing: "-0.03em" }}
          >
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
                onClick={() => scrollToDay(day)}
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

        <button
          onClick={() => setOnlyFollowing((v) => !v)}
          className={cn(
            "mt-6 inline-flex items-center gap-2 rounded-[8px] px-2.5 py-2 text-[13px] font-medium transition",
            onlyFollowing
              ? "bg-[var(--fr-surface-2)] text-[var(--fr-ink)]"
              : "text-[var(--fr-ink-muted)] hover:text-[var(--fr-ink)]",
          )}
        >
          <Star className={cn("h-4 w-4", onlyFollowing && "fill-current")} />
          Following only
        </button>

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

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--fr-hairline-soft)] bg-[var(--fr-canvas)]/85 px-5 py-3 backdrop-blur">
          <div>
            <h1
              className="text-[18px] font-semibold leading-none"
              style={{ letterSpacing: "-0.03em" }}
            >
              Airing schedule
            </h1>
            <p className="mt-1 text-[12px] text-[var(--fr-ink-muted)]">
              Currently releasing anime, by update day
            </p>
          </div>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fr-ink-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, studios, genres…"
              className="w-full rounded-full border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] py-2 pl-9 pr-4 text-[13px] text-[var(--fr-ink)] outline-none placeholder:text-[var(--fr-ink-muted)] focus:ring-2 focus:ring-[var(--fr-accent-blue)]/40"
            />
          </div>
          <button
            onClick={() => setOnlyFollowing((v) => !v)}
            aria-label="Toggle following filter"
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full transition lg:hidden",
              onlyFollowing
                ? "bg-[var(--fr-surface-2)] text-[var(--fr-ink)]"
                : "bg-[var(--fr-surface-1)] text-[var(--fr-ink-muted)]",
            )}
          >
            <Star className={cn("h-4 w-4", onlyFollowing && "fill-current")} />
          </button>
        </header>

        {model == null ? (
          <BoardSkeleton />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 px-5 pt-5 md:grid-cols-4">
              <Stat
                icon={<Clapperboard className="h-4 w-4" />}
                label="Airing this season"
                value={model.total}
              />
              <Stat
                icon={<CalendarClock className="h-4 w-4" />}
                label="Updating today"
                value={model.todayCount}
                accent
              />
              <Stat
                icon={<Star className="h-4 w-4" />}
                label="Following"
                value={model.followingCount}
              />
              <Stat
                icon={<Timer className="h-4 w-4" />}
                label="Next episode"
                value={
                  model.soonest != null ? untilLabel(model.soonest, now!) : "—"
                }
              />
            </div>

            {/* Week board */}
            {model.total === 0 ? (
              <EmptyState
                onlyFollowing={onlyFollowing}
                onClear={() => {
                  setOnlyFollowing(false);
                  setQuery("");
                }}
              />
            ) : (
              <div className="flex flex-1 gap-4 overflow-x-auto p-5">
                {model.order.map((day) => {
                  const entries = model.byDay.get(day) ?? [];
                  const { name, rel } = dayLabel(day, model.today);
                  const isToday = day === model.today;
                  return (
                    <section
                      key={day}
                      ref={(el) => {
                        columnRefs.current.set(day, el);
                      }}
                      className="flex w-[280px] shrink-0 flex-col"
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
                          <p className="text-[13px] font-semibold text-[var(--fr-ink)]">
                            {rel ?? name}
                          </p>
                          {rel && (
                            <p className="text-[11px] text-[var(--fr-ink-muted)]">
                              {name}
                            </p>
                          )}
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
                            <AnimeCard
                              key={e.anime.id}
                              anime={e.anime}
                              airing={e.airing}
                              now={now!}
                            />
                          ))
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[14px] border p-4",
        accent
          ? "border-[var(--fr-accent-blue)]/30 bg-[var(--fr-accent-blue)]/[0.07]"
          : "border-[var(--fr-hairline)] bg-[var(--fr-surface-1)]",
      )}
    >
      <div className="flex items-center gap-2 text-[var(--fr-ink-muted)]">
        {icon}
        <span className="text-[12px]">{label}</span>
      </div>
      <p
        className="mt-2 text-[26px] font-semibold tabular-nums text-[var(--fr-ink)]"
        style={{ letterSpacing: "-0.02em" }}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  onlyFollowing,
  onClear,
}: {
  onlyFollowing: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--fr-surface-1)]">
        <CalendarClock className="h-6 w-6 text-[var(--fr-ink-muted)]" />
      </div>
      <p className="text-[15px] text-[var(--fr-ink-muted)]">
        {onlyFollowing
          ? "You're not following any airing shows yet."
          : "Nothing matches your search."}
      </p>
      <button
        onClick={onClear}
        className="rounded-full bg-[var(--fr-surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--fr-ink)] transition hover:bg-white/10"
      >
        Clear filters
      </button>
    </div>
  );
}

/** Shown until the client clock is available (see the gating note above). */
function BoardSkeleton() {
  return (
    <div className="animate-pulse p-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-[14px] bg-[var(--fr-surface-1)]" />
        ))}
      </div>
      <div className="mt-5 flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[280px] shrink-0 space-y-2.5">
            <div className="h-11 rounded-[10px] bg-[var(--fr-surface-1)]" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                className="h-[92px] rounded-[14px] bg-[var(--fr-surface-1)]"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
