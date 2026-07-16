// AniList data source.
//
// AniList exposes a public GraphQL API with no key required for read-only
// queries (https://anilist.co/graphql). We ask for the current season's
// currently-releasing shows and, crucially, each episode's `airingAt` UNIX
// timestamp — that's what lets us place a show on a weekday and measure how
// far into its run it is. All time-of-day interpretation happens on the client
// (see lib/schedule.ts) so the weekday reflects the *viewer's* timezone.

import { cache } from "react";
import { unstable_cache } from "next/cache";

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

export interface AnimeExternalLink {
  id: number;
  url: string;
  site: string;
  siteId: number | null;
  type: string | null;
  language: string | null;
  color: string | null;
  icon: string | null;
  notes: string | null;
  isDisabled: boolean;
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
  /** Official, streaming, and social links supplied by AniList. */
  externalLinks: AnimeExternalLink[];
  /** Next episode yet to air, if any. */
  next: EpisodeAiring | null;
  /** Every episode airing AniList knows about, ascending by episode. */
  schedule: EpisodeAiring[];
}

/** A catalog-wide AniList search result, including enough metadata to rank and
 * render titles that are not part of the current airing schedule. */
export interface AnimeSearchResult extends AiringAnime {
  titleVariants: string[];
  format: string | null;
  status: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number;
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
        externalLinks { id url site siteId type language color icon notes isDisabled }
        description(asHtml: false)
        studios(isMain: true) { nodes { name } }
        nextAiringEpisode { episode airingAt }
        airingSchedule(perPage: 60) { nodes { episode airingAt } }
      }
    }
  }
`;

const SEARCH_QUERY = /* GraphQL */ `
  query SearchAnime($query: String!, $page: Int) {
    Page(page: $page, perPage: 30) {
      pageInfo { hasNextPage }
      media(
        search: $query
        type: ANIME
        isAdult: false
        sort: [SEARCH_MATCH, POPULARITY_DESC]
      ) {
        id
        title { romaji english native userPreferred }
        synonyms
        format
        status
        seasonYear
        averageScore
        popularity
        coverImage { extraLarge large color }
        episodes
        genres
        siteUrl
        externalLinks { id url site siteId type language color icon notes isDisabled }
        description(asHtml: false)
        studios(isMain: true) { nodes { name } }
        nextAiringEpisode { episode airingAt }
        airingSchedule(perPage: 50) { nodes { episode airingAt } }
      }
    }
  }
`;

const FAVORITES_QUERY = /* GraphQL */ `
  query FavoriteAnime($ids: [Int]) {
    Page(page: 1, perPage: 50) {
      media(id_in: $ids, type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
        id
        title { romaji english }
        coverImage { extraLarge large color }
        episodes
        genres
        siteUrl
        externalLinks { id url site siteId type language color icon notes isDisabled }
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
  externalLinks: AnimeExternalLink[];
  description: string | null;
  studios: { nodes: { name: string }[] };
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  airingSchedule: { nodes: { episode: number; airingAt: number }[] };
}

interface RawSearchMedia extends RawMedia {
  title: RawMedia["title"] & { native: string | null; userPreferred: string };
  synonyms: string[];
  format: string | null;
  status: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number;
}

/** Strip AniList's HTML description down to readable plain text. */
export function plainText(html: string | null): string {
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

export interface AniDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

interface PageInfo {
  total: number | null;
  perPage: number | null;
  currentPage: number | null;
  lastPage: number | null;
  hasNextPage: boolean;
}

interface PersonName {
  first: string | null;
  middle: string | null;
  last: string | null;
  full: string;
  native: string | null;
  userPreferred: string;
}

interface PersonImage {
  large: string;
  medium: string;
}

export interface AnimeDetail {
  id: number;
  idMal: number | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
    userPreferred: string;
  };
  type: string;
  format: string | null;
  status: string | null;
  description: string | null;
  startDate: AniDate;
  endDate: AniDate;
  season: string | null;
  seasonYear: number | null;
  seasonInt: number | null;
  episodes: number | null;
  duration: number | null;
  chapters: number | null;
  volumes: number | null;
  countryOfOrigin: string | null;
  isLicensed: boolean;
  source: string | null;
  hashtag: string | null;
  trailer: { id: string; site: string; thumbnail: string | null } | null;
  updatedAt: number;
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string | null;
  };
  bannerImage: string | null;
  genres: string[];
  synonyms: string[];
  averageScore: number | null;
  meanScore: number | null;
  popularity: number;
  isLocked: boolean;
  trending: number;
  favourites: number;
  tags: {
    id: number;
    name: string;
    description: string;
    category: string;
    rank: number;
    isGeneralSpoiler: boolean;
    isMediaSpoiler: boolean;
    isAdult: boolean;
    userId: number | null;
  }[];
  relations: {
    edges: {
      id: number;
      relationType: string;
      node: {
        id: number;
        idMal: number | null;
        title: AnimeDetail["title"];
        type: string;
        format: string | null;
        status: string | null;
        siteUrl: string;
      };
    }[];
    pageInfo: PageInfo;
  };
  characters: {
    edges: {
      id: number;
      role: string;
      name: string | null;
      node: { id: number; name: PersonName; image: PersonImage; siteUrl: string };
      voiceActors: {
        id: number;
        name: PersonName;
        languageV2: string | null;
        image: PersonImage;
        siteUrl: string;
      }[];
    }[];
    pageInfo: PageInfo;
  };
  staff: {
    edges: {
      id: number;
      role: string;
      node: {
        id: number;
        name: PersonName;
        languageV2: string | null;
        image: PersonImage;
        description: string | null;
        primaryOccupations: string[];
        gender: string | null;
        dateOfBirth: AniDate;
        dateOfDeath: AniDate;
        age: number | null;
        yearsActive: number[];
        homeTown: string | null;
        bloodType: string | null;
        siteUrl: string;
      };
    }[];
    pageInfo: PageInfo;
  };
  studios: {
    edges: {
      isMain: boolean;
      node: { id: number; name: string; isAnimationStudio: boolean; siteUrl: string };
    }[];
    pageInfo: PageInfo;
  };
  isFavourite: boolean;
  isFavouriteBlocked: boolean;
  isAdult: boolean;
  nextAiringEpisode: {
    id: number;
    airingAt: number;
    timeUntilAiring: number;
    episode: number;
    mediaId: number;
  } | null;
  airingSchedule: {
    nodes: { id: number; airingAt: number; timeUntilAiring: number; episode: number; mediaId: number }[];
    pageInfo: PageInfo;
  };
  trends: {
    nodes: {
      mediaId: number;
      date: number;
      trending: number;
      averageScore: number | null;
      popularity: number;
      inProgress: number;
      releasing: boolean;
      episode: number | null;
    }[];
    pageInfo: PageInfo;
  };
  externalLinks: AnimeExternalLink[];
  streamingEpisodes: { title: string; thumbnail: string | null; url: string; site: string }[];
  rankings: {
    id: number;
    rank: number;
    type: string;
    format: string;
    year: number | null;
    season: string | null;
    allTime: boolean;
    context: string;
  }[];
  mediaListEntry: {
    id: number;
    userId: number;
    mediaId: number;
    status: string;
    score: number;
    progress: number;
    progressVolumes: number | null;
    repeat: number;
    priority: number;
    private: boolean;
    notes: string | null;
    hiddenFromStatusLists: boolean;
    customLists: Record<string, boolean> | null;
    advancedScores: Record<string, number> | null;
    startedAt: AniDate;
    completedAt: AniDate;
    updatedAt: number;
    createdAt: number;
  } | null;
  reviews: {
    nodes: {
      id: number;
      userId: number;
      mediaId: number;
      mediaType: string;
      summary: string;
      body: string;
      rating: number;
      ratingAmount: number;
      score: number;
      private: boolean;
      siteUrl: string;
      createdAt: number;
      updatedAt: number;
      user: { id: number; name: string; siteUrl: string };
    }[];
    pageInfo: PageInfo;
  };
  recommendations: {
    nodes: {
      id: number;
      rating: number;
      userRating: string;
      mediaRecommendation: {
        id: number;
        idMal: number | null;
        title: AnimeDetail["title"];
        type: string;
        format: string | null;
        status: string | null;
        siteUrl: string;
      } | null;
      user: { id: number; name: string; siteUrl: string };
    }[];
    pageInfo: PageInfo;
  };
  stats: {
    scoreDistribution: { score: number; amount: number }[];
    statusDistribution: { status: string; amount: number }[];
  } | null;
  siteUrl: string;
  autoCreateForumThread: boolean;
  isRecommendationBlocked: boolean;
  isReviewBlocked: boolean;
  modNotes: string | null;
}

// Only the fields the detail page actually renders. AniList's connections
// (characters, staff, reviews, recommendations) default to a large page size,
// so each is capped with `perPage` to match the slice the UI shows — this alone
// cuts the response ~70% versus requesting the full payload. Fields the type
// declares but the page never reads (staff bios, review bodies, mediaListEntry,
// full pageInfo, name variants) are omitted; they arrive as `undefined` and
// nothing touches them.
const DETAIL_QUERY = /* GraphQL */ `
  query AllMediaFields($id: Int!) {
    Media(id: $id, type: ANIME) {
      id idMal title { romaji english native userPreferred } type format status
      description(asHtml: false) startDate { year month day } endDate { year month day }
      season seasonYear seasonInt episodes duration chapters volumes countryOfOrigin
      isLicensed source hashtag trailer { id site thumbnail } updatedAt
      coverImage { extraLarge large medium color } bannerImage genres synonyms averageScore
      meanScore popularity isLocked trending favourites
      tags { id name category rank isMediaSpoiler }
      relations { edges { id relationType node { id title { userPreferred } type format status siteUrl } } pageInfo { total } }
      characters(perPage: 18) { edges { id role name node { id name { userPreferred } image { large } siteUrl } voiceActors { id name { userPreferred } languageV2 image { large } siteUrl } } pageInfo { total } }
      staff(perPage: 20) { edges { id role node { id name { userPreferred } image { large } siteUrl } } pageInfo { total } }
      studios { edges { isMain node { id name isAnimationStudio siteUrl } } }
      isFavourite isAdult nextAiringEpisode { id airingAt timeUntilAiring episode mediaId }
      airingSchedule(perPage: 50) { nodes { id airingAt timeUntilAiring episode mediaId } pageInfo { total } }
      trends(perPage: 1) { nodes { date } }
      externalLinks { id url site siteId type language color icon notes isDisabled }
      streamingEpisodes { title url site }
      rankings { id rank context }
      reviews(perPage: 4) { nodes { id summary rating ratingAmount siteUrl user { name } } pageInfo { total } }
      recommendations(perPage: 16) { nodes { id rating mediaRecommendation { id title { userPreferred } type format siteUrl } } pageInfo { total } }
      stats { scoreDistribution { score amount } statusDistribution { status amount } }
      siteUrl
    }
  }
`;

/**
 * Fetch AniList's public media detail payload for one anime.
 *
 * Wrapped in React's `cache()` so the detail route's two callers within a single
 * request — `generateMetadata` and the page component — share one round trip.
 * Next.js only memoizes GET fetches, and this is a POST, so without this the
 * (large) query would run twice per request.
 */
const fetchCachedAnimeDetail = unstable_cache(
  async (id: number): Promise<AnimeDetail | null> => {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query: DETAIL_QUERY, variables: { id } }),
    });

    if (!res.ok) throw new Error(`AniList request failed: ${res.status} ${res.statusText}`);

    const json = (await res.json()) as {
      data?: { Media: AnimeDetail | null };
      errors?: { message: string }[];
    };
    if (json.errors?.length) throw new Error(json.errors[0].message);
    return json.data?.Media ?? null;
  },
  ["anime-detail"],
  { revalidate: 3600, tags: ["anime-detail"] },
);

export const fetchAnimeDetail = cache(fetchCachedAnimeDetail);

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
    externalLinks: m.externalLinks.filter((link) => !link.isDisabled),
    next: m.nextAiringEpisode,
    schedule,
  };
}

function normalizeSearchResult(m: RawSearchMedia): AnimeSearchResult {
  return {
    ...normalize(m),
    titleVariants: [
      m.title.english,
      m.title.romaji,
      m.title.native,
      m.title.userPreferred,
      ...m.synonyms,
    ].filter((title): title is string => Boolean(title)),
    format: m.format,
    status: m.status,
    seasonYear: m.seasonYear,
    averageScore: m.averageScore,
    popularity: m.popularity,
  };
}

/** Search AniList's complete non-adult anime catalog. AniList supplies fuzzy
 * search relevance; we apply the product rule that currently airing titles
 * always precede other matches while retaining AniList's order inside each
 * status group. */
export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
  const cleanQuery = query.trim().slice(0, 100);
  if (!cleanQuery) return [];

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: SEARCH_QUERY, variables: { query: cleanQuery, page: 1 } }),
    // Cache identical searches briefly. The catalog is stable minute-to-minute,
    // so this collapses repeat queries (debounced typing, back-navigation) onto
    // one AniList round trip without making results feel stale.
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`AniList search failed: ${res.status} ${res.statusText}`);

  const json = (await res.json()) as {
    data?: { Page?: { media: RawSearchMedia[] } };
    errors?: { message: string }[];
  };
  if (json.errors?.length) throw new Error(json.errors[0].message);

  return (json.data?.Page?.media ?? [])
    .map(normalizeSearchResult)
    .map((anime, index) => ({ anime, index }))
    .sort(
      (a, b) =>
        Number(b.anime.status === "RELEASING") - Number(a.anime.status === "RELEASING") ||
        a.index - b.index,
    )
    .map(({ anime }) => anime);
}

/** Resolve the user's device-local favorite ids into renderable anime data. */
export async function fetchFavoriteAnime(ids: number[]): Promise<AiringAnime[]> {
  const cleanIds = [...new Set(ids)].filter((id) => Number.isInteger(id) && id > 0).slice(0, 50);
  if (cleanIds.length === 0) return [];

  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: FAVORITES_QUERY, variables: { ids: cleanIds } }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`AniList favorites request failed: ${res.status} ${res.statusText}`);

  const json = (await res.json()) as {
    data?: { Page?: { media: RawMedia[] } };
    errors?: { message: string }[];
  };
  if (json.errors?.length) throw new Error(json.errors[0].message);

  const byId = new Map((json.data?.Page?.media ?? []).map((media) => [media.id, normalize(media)]));
  return cleanIds.flatMap((id) => {
    const anime = byId.get(id);
    return anime ? [anime] : [];
  });
}

/** Fetch a single popularity-sorted page of the current season's airing shows. */
async function fetchAiringPage(
  season: Season,
  year: number,
  page: number,
): Promise<RawMedia[]> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { season, year, page } }),
    // Regenerate hourly; airing schedules don't change minute-to-minute.
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

  return json.data?.Page?.media ?? [];
}

/**
 * Fetch the current season's currently-airing shows. Requests all `maxPages`
 * popularity-sorted pages concurrently rather than serially — turning what was
 * an N-round-trip waterfall into a single round trip — then keeps only shows we
 * can place on a weekday (those with at least one known airing time). Pages past
 * the end simply come back empty, so over-requesting a page is harmless.
 */
export async function fetchAiringAnime(maxPages = 3): Promise<AiringAnime[]> {
  const { season, year } = currentSeason();

  const pages = await Promise.all(
    Array.from({ length: maxPages }, (_, i) => fetchAiringPage(season, year, i + 1)),
  );

  return pages
    .flat()
    .map(normalize)
    .filter((a) => a.next || a.schedule.length > 0);
}
