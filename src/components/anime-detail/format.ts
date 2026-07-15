import type { AniDate, AnimeDetail } from "@/lib/anilist";

/** Humanize an UPPER_SNAKE enum ("TV_SHORT" → "Tv Short"). */
export function label(value: string | null | undefined): string {
  return value
    ? value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "—";
}

export function compact(value: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function trailerUrl(trailer: NonNullable<AnimeDetail["trailer"]>): string {
  return trailer.site.toLowerCase() === "youtube"
    ? `https://www.youtube.com/watch?v=${trailer.id}`
    : `https://${trailer.site}.com/${trailer.id}`;
}

export function formatDate(date: AniDate): string | null {
  if (!date.year) return null;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: date.month ? "short" : undefined,
    day: date.day ? "numeric" : undefined,
    timeZone: "UTC",
  }).format(new Date(Date.UTC(date.year, (date.month ?? 1) - 1, date.day ?? 1)));
}

export function dateRange(start: AniDate, end: AniDate): string | null {
  const from = formatDate(start);
  const to = formatDate(end);
  return from ? `${from}${to ? ` — ${to}` : ""}` : null;
}

export function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
