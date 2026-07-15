import type { AiringAnime, Weekday } from "@/lib/anilist";
import { WEEKDAYS } from "@/lib/anilist";
import { deriveAiring, type Airing } from "@/lib/schedule";

export interface Entry {
  anime: AiringAnime;
  airing: Airing;
}

export interface BoardModel {
  today: Weekday;
  order: Weekday[];
  byDay: Map<Weekday, Entry[]>;
  results: Entry[];
  total: number;
  todayCount: number;
  followingCount: number;
  peakCount: number;
  peakDayName: string;
  soonest: Entry | null;
}

/** Weekday values ordered so "today" comes first (the board reads forward). */
export function weekOrder(today: Weekday): Weekday[] {
  return Array.from({ length: 7 }, (_, i) => ((today + i) % 7) as Weekday);
}

export function dayLabel(
  day: Weekday,
  today: Weekday,
): { name: string; rel?: string } {
  const long = WEEKDAYS.find((w) => w.value === day)!.long;
  if (day === today) return { name: long, rel: "Today" };
  if (day === ((today + 1) % 7)) return { name: long, rel: "Tomorrow" };
  return { name: long };
}

/**
 * Derive airing info, filter to the active view, and group by weekday. All
 * time-based, so callers should only build this once the client clock exists.
 */
export function buildBoardModel(
  anime: AiringAnime[],
  now: number,
  onlyFollowing: boolean,
  following: number[],
): BoardModel {
  const today = new Date(now).getDay() as Weekday;

  const entries: Entry[] = anime
    .map((a) => ({ anime: a, airing: deriveAiring(a, now) }))
    .filter((e) => e.airing.weekday != null)
    .filter((e) => (onlyFollowing ? following.includes(e.anime.id) : true));

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
}
