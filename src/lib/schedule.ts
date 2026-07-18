import type { AiringAnime, EpisodeAiring, Weekday } from "./anilist";

// All schedule math runs on the client against a `now` in milliseconds, so
// weekdays and countdowns reflect the viewer's own timezone.

export interface Airing {
  /** Weekday the show updates on, derived from its most recent past episode. */
  weekday: Weekday | null;
  /** Number of the latest episode that has already aired. */
  latestAired: number;
  /** Episodes aired so far (for season progress). */
  airedCount: number;
  /** UNIX ms of the next episode, or null if none is scheduled. */
  nextAiringAt: number | null;
  nextEpisode: number | null;
  /** Season progress 0–100 (null total ⇒ measured against aired count). */
  progressPct: number;
}

/**
 * Derive a show's weekday and progress from its airing timestamps.
 *
 * Per the brief, the update weekday comes from a *past* episode's airing day
 * (the steady weekly cadence), falling back to the next episode only when
 * nothing has aired yet.
 */
export function deriveAiring(a: AiringAnime, nowMs: number): Airing {
  const nowSec = nowMs / 1000;

  const aired = a.schedule.filter((e) => e.airingAt <= nowSec);
  const latest = aired.reduce<EpisodeAiring | null>(
    (best, e) => (best == null || e.episode > best.episode ? e : best),
    null,
  );

  const refTs = latest?.airingAt ?? a.next?.airingAt ?? null;
  const weekday =
    refTs == null ? null : (new Date(refTs * 1000).getDay() as Weekday);

  const latestAired = latest?.episode ?? (a.next ? a.next.episode - 1 : 0);
  const airedCount = Math.max(0, latestAired);

  const denom = a.totalEpisodes ?? Math.max(airedCount, a.next?.episode ?? 1);
  const progressPct = denom > 0 ? Math.min(100, Math.round((airedCount / denom) * 100)) : 0;

  return {
    weekday,
    latestAired,
    airedCount,
    nextAiringAt: a.next ? a.next.airingAt * 1000 : null,
    nextEpisode: a.next?.episode ?? null,
    progressPct,
  };
}

/** The single scheduled episode occurrence on a viewer-local calendar date. */
export function episodeOnLocalDate(
  schedule: EpisodeAiring[],
  date: Date,
): EpisodeAiring | null {
  return schedule.find((episode) => {
    const airingDate = new Date(episode.airingAt * 1000);
    return airingDate.getFullYear() === date.getFullYear()
      && airingDate.getMonth() === date.getMonth()
      && airingDate.getDate() === date.getDate();
  }) ?? null;
}

/** Every reliably scheduled episode that has aired and is not marked watched. */
export function unwatchedAiredEpisodes(
  schedule: EpisodeAiring[],
  watched: ReadonlySet<number>,
  nowMs: number,
): EpisodeAiring[] {
  return schedule.filter(
    (episode) => episode.airingAt * 1000 <= nowMs
      && !watched.has(episode.episode),
  );
}

/** "3d 4h", "6h 12m", "12m", or "now". */
export function untilLabel(targetMs: number, nowMs: number): string {
  let s = Math.floor((targetMs - nowMs) / 1000);
  if (s <= 0) return "now";
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
