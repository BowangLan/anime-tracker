"use client";

import { useMemo, useRef, useState } from "react";
import {
  Search,
  Star,
  Tv,
  CalendarClock,
  Clapperboard,
  Timer,
  Layers,
  X,
} from "lucide-react";
import Image from "next/image";
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

const DAY_MS = 86_400_000;

/** Weekday values ordered so "today" comes first (the board reads forward). */
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
  const [onlyFollowing, setOnlyFollowing] = useState(true);
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

    const byNext = (a: Entry, b: Entry) =>
      (a.airing.nextAiringAt ?? Infinity) - (b.airing.nextAiringAt ?? Infinity);
    const byFavoriteThenNext = (a: Entry, b: Entry) =>
      Number(following.includes(b.anime.id)) - Number(following.includes(a.anime.id)) ||
      byNext(a, b);

    const order = weekOrder(today);
    const byDay = new Map<Weekday, Entry[]>();
    for (const d of order) byDay.set(d, []);
    for (const e of entries) byDay.get(e.airing.weekday!)!.push(e);
    for (const list of byDay.values()) list.sort(byFavoriteThenNext);

    const soonest = [...entries]
      .filter((e) => e.airing.nextAiringAt != null)
      .sort(byNext)[0];

    const peak = [...byDay.entries()].sort((a, b) => b[1].length - a[1].length)[0];

    return {
      today,
      order,
      byDay,
      results: [...entries].sort(byFavoriteThenNext),
      total: entries.length,
      todayCount: byDay.get(today)?.length ?? 0,
      followingCount: entries.filter((e) => following.includes(e.anime.id)).length,
      peakCount: peak?.[1].length ?? 0,
      peakDayName:
        peak && peak[1].length > 0
          ? WEEKDAYS.find((w) => w.value === peak[0])!.long
          : "—",
      soonest: soonest ?? null,
    };
  }, [anime, now, query, onlyFollowing, following]);

  const searchQuery = query.trim();
  const isSearching = searchQuery.length > 0;

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

        <FavoritesSwitch
          checked={onlyFollowing}
          onCheckedChange={setOnlyFollowing}
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

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--fr-hairline-soft)] bg-[var(--fr-canvas)]/85 px-5 py-3 backdrop-blur">
          <div>
            <h1 className="text-[18px] font-semibold leading-none" style={{ letterSpacing: "-0.03em" }}>
              Schedule dashboard
            </h1>
            <p className="mt-1 text-[12px] text-[var(--fr-ink-muted)]">
              Currently releasing anime, by update day
            </p>
          </div>
          <div className="relative ml-auto min-w-0 flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fr-ink-muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, studios, genres…"
              className="w-full rounded-full border border-[var(--fr-hairline)] bg-[var(--fr-surface-1)] py-2 pl-9 pr-9 text-[13px] text-[var(--fr-ink)] outline-none placeholder:text-[var(--fr-ink-muted)] focus:ring-2 focus:ring-[var(--fr-accent-blue)]/40"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-[var(--fr-ink-muted)] transition hover:bg-white/10 hover:text-[var(--fr-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fr-accent-blue)]/60"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <FavoritesSwitch
            checked={onlyFollowing}
            onCheckedChange={setOnlyFollowing}
            compact
            className="lg:hidden"
          />
        </header>

        {model == null ? (
          <BoardSkeleton />
        ) : isSearching ? (
          <SearchResults
            entries={model.results}
            query={searchQuery}
            now={now!}
            onlyFollowing={onlyFollowing}
            onClear={() => {
              setQuery("");
              setOnlyFollowing(false);
            }}
          />
        ) : (
          <div className="flex min-w-0 flex-col gap-6 p-5">
            {/* KPI widgets */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
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
                label="Favorites"
                value={model.followingCount}
              />
            </div>

            {/* The week board */}
            <section className="min-w-0">
              <div className="flex items-baseline gap-3 pb-1">
                <h2
                  className="text-[16px] font-semibold text-[var(--fr-ink)]"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  This week&apos;s schedule
                </h2>
                <span className="text-[12px] text-[var(--fr-ink-muted)]">
                  Scroll across the seven days
                </span>
              </div>

              {model.total === 0 ? (
                <EmptyState
                  onlyFollowing={onlyFollowing}
                  hasQuery={query.trim().length > 0}
                  onClear={() => {
                    setOnlyFollowing(false);
                    setQuery("");
                  }}
                />
              ) : (
                <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2 pt-3">
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
                            <p className="text-[13px] font-semibold text-[var(--fr-ink)]">
                              {name}
                            </p>
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
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function FavoritesSwitch({
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
      aria-label={compact ? "Show favorites only" : undefined}
      onClick={() => onCheckedChange(!checked)}
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
          Favorites only
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

function SearchResults({
  entries,
  query,
  now,
  onlyFollowing,
  onClear,
}: {
  entries: Entry[];
  query: string;
  now: number;
  onlyFollowing: boolean;
  onClear: () => void;
}) {
  return (
    <section className="p-5">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-[var(--fr-hairline-soft)] pb-4">
        <div className="min-w-0">
          <p className="fr-eyebrow">Search results</p>
          <h2
            className="mt-1 truncate text-[22px] font-semibold text-[var(--fr-ink)]"
            style={{ letterSpacing: "-0.035em" }}
          >
            &ldquo;{query}&rdquo;
          </h2>
        </div>
        <p className="shrink-0 pb-0.5 text-[12px] tabular-nums text-[var(--fr-ink-muted)]">
          {entries.length} {entries.length === 1 ? "show" : "shows"}
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState onlyFollowing={onlyFollowing} hasQuery onClear={onClear} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {entries.map((entry) => (
            <AnimeCard
              key={entry.anime.id}
              anime={entry.anime}
              airing={entry.airing}
              now={now}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** KPI widget. */
function Stat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-[14px] border p-4",
        accent
          ? "border-[var(--fr-accent-blue)]/30 bg-[var(--fr-accent-blue)]/[0.07]"
          : "border-[var(--fr-hairline)] bg-[var(--fr-surface-1)]",
      )}
    >
      <div className="flex items-center gap-2 text-[var(--fr-ink-muted)]">
        {icon}
        <span className="text-[12px]">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p
          className="text-[28px] font-semibold leading-none tabular-nums text-[var(--fr-ink)]"
          style={{ letterSpacing: "-0.02em" }}
        >
          {value}
        </p>
        {sub && <span className="text-[12px] text-[var(--fr-ink-muted)]">{sub}</span>}
      </div>
    </div>
  );
}

function EmptyState({
  onlyFollowing,
  hasQuery,
  onClear,
}: {
  onlyFollowing: boolean;
  hasQuery: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[16px] border border-dashed border-[var(--fr-hairline)] py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--fr-surface-1)]">
        <CalendarClock className="h-6 w-6 text-[var(--fr-ink-muted)]" />
      </div>
      <div className="max-w-xs">
        <p className="text-[15px] font-medium text-[var(--fr-ink)]">
          {hasQuery
            ? onlyFollowing
              ? "No favorites match your search"
              : "No shows match your search"
            : onlyFollowing
              ? "You don't have any airing favorites yet"
              : "Nothing airing right now"}
        </p>
        <p className="mt-1 text-[13px] text-[var(--fr-ink-muted)]">
          {hasQuery
            ? "Try a different title, studio, or genre."
            : onlyFollowing
              ? "Turn off Favorites only to browse and add some."
              : "Try a different title, studio, or genre."}
        </p>
      </div>
      {(onlyFollowing || hasQuery) && (
        <button
          onClick={onClear}
          className="rounded-full bg-[var(--fr-surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--fr-ink)] transition hover:bg-white/10"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/** Shown until the client clock is available (see the gating note above). */
function BoardSkeleton() {
  return (
    <div className="animate-pulse p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[92px] rounded-[14px] bg-[var(--fr-surface-1)]" />
        ))}
      </div>
      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <div className="h-[168px] rounded-[18px] bg-[var(--fr-surface-1)] lg:col-span-2" />
        <div className="h-[168px] rounded-[18px] bg-[var(--fr-surface-1)]" />
      </div>
      <div className="mt-6 flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-[272px] shrink-0 space-y-2.5">
            <div className="h-11 rounded-[10px] bg-[var(--fr-surface-1)]" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-[96px] rounded-[14px] bg-[var(--fr-surface-1)]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
