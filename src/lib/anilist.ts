// AniList data source.
//
// AniList exposes a public GraphQL API with no key required for read-only
// queries (https://anilist.co/graphql). We ask for the current season's
// currently-releasing shows and, crucially, each episode's `airingAt` UNIX
// timestamp — that's what lets us place a show on a weekday and measure how
// far into its run it is. All time-of-day interpretation happens on the client
// (see lib/schedule.ts) so the weekday reflects the *viewer's* timezone.

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday … 6 = Saturday

export const WEEKDAYS: { value: Weekday; short: string; long: string }[] = [
  { value: 1, short: "Mon", long: "Monday" },
  { value: 2, short: "Tue", long: "Tuesday" },
  { value: 3, short: "Wed", long: "Wednesday" },
  { value: 4, short: "Thu", long: "Thursday" },
  { value: 5, short: "Fri", long: "Friday" },
  { value: 6, short: "Sat", long: "Saturday" },
  { value: 0, short: "Sun", long: "Sunday" },
];

/** One episode's scheduled release, in UNIX seconds (UTC). */
export interface EpisodeAiring {
  episode: number;
  airingAt: number;
}

/** A currently-airing show, normalized from AniList for the UI. */
export interface AiringAnime {
  id: number;
  title: string;
  coverImage: string;
  /** AniList's extracted dominant cover color (hex), for accent theming. */
  color: string;
  totalEpisodes: number | null;
  studio: string;
  genres: string[];
  synopsis: string;
  siteUrl: string;
  /** Next episode yet to air, if any. */
  next: EpisodeAiring | null;
  /** Every episode airing AniList knows about, ascending by episode. */
  schedule: EpisodeAiring[];
}

type Season = "WINTER" | "SPRING" | "SUMMER" | "FALL";

/** Current anime season + year, from a given instant (defaults to now). */
export function currentSeason(now = new Date()): { season: Season; year: number } {
  const month = now.getMonth(); // 0-11
  const season: Season =
    month <= 2 ? "WINTER" : month <= 5 ? "SPRING" : month <= 8 ? "SUMMER" : "FALL";
  return { season, year: now.getFullYear() };
}

const QUERY = /* GraphQL */ `
  query ($season: MediaSeason, $year: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo { hasNextPage }
      media(
        season: $season
        seasonYear: $year
        type: ANIME
        status: RELEASING
        sort: POPULARITY_DESC
        isAdult: false
      ) {
        id
        title { romaji english }
        coverImage { extraLarge large color }
        episodes
        genres
        siteUrl
        description(asHtml: false)
        studios(isMain: true) { nodes { name } }
        nextAiringEpisode { episode airingAt }
        airingSchedule(perPage: 60) { nodes { episode airingAt } }
      }
    }
  }
`;

// Shape of the slice of the AniList response we actually read.
interface RawMedia {
  id: number;
  title: { romaji: string | null; english: string | null };
  coverImage: { extraLarge: string | null; large: string | null; color: string | null };
  episodes: number | null;
  genres: string[];
  siteUrl: string;
  description: string | null;
  studios: { nodes: { name: string }[] };
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  airingSchedule: { nodes: { episode: number; airingAt: number }[] };
}

/** Strip AniList's HTML description down to a plain, trimmed sentence or two. */
function plainText(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\(Source:[\s\S]*?\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(m: RawMedia): AiringAnime {
  const schedule = [...m.airingSchedule.nodes].sort((a, b) => a.episode - b.episode);
  return {
    id: m.id,
    title: m.title.english || m.title.romaji || "Untitled",
    coverImage: m.coverImage.extraLarge || m.coverImage.large || "",
    color: m.coverImage.color || "#6a4cf5",
    totalEpisodes: m.episodes,
    studio: m.studios.nodes[0]?.name ?? "Unknown studio",
    genres: m.genres,
    synopsis: plainText(m.description),
    siteUrl: m.siteUrl,
    next: m.nextAiringEpisode,
    schedule,
  };
}

/**
 * Fetch the current season's currently-airing shows. Pages through AniList
 * (popularity-sorted) up to `maxPages`. Only keeps shows we can actually place
 * on a weekday — i.e. those with at least one known airing time.
 */
export async function fetchAiringAnime(maxPages = 3): Promise<AiringAnime[]> {
  const { season, year } = currentSeason();
  const all: AiringAnime[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { season, year, page } }),
      // Regenerate the page hourly; airing schedules don't change minute-to-minute.
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`AniList request failed: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as {
      data?: { Page?: { pageInfo: { hasNextPage: boolean }; media: RawMedia[] } };
      errors?: { message: string }[];
    };
    if (json.errors?.length) throw new Error(json.errors[0].message);

    const pageData = json.data?.Page;
    if (!pageData) break;

    all.push(...pageData.media.map(normalize));
    if (!pageData.pageInfo.hasNextPage) break;
  }

  return all.filter((a) => a.next || a.schedule.length > 0);
}
