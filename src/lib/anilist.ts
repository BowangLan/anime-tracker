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

const DETAIL_QUERY = /* GraphQL */ `
  query AllMediaFields($id: Int!) {
    Media(id: $id, type: ANIME) {
      id idMal title { romaji english native userPreferred } type format status
      description(asHtml: false) startDate { year month day } endDate { year month day }
      season seasonYear seasonInt episodes duration chapters volumes countryOfOrigin
      isLicensed source hashtag trailer { id site thumbnail } updatedAt
      coverImage { extraLarge large medium color } bannerImage genres synonyms averageScore
      meanScore popularity isLocked trending favourites
      tags { id name description category rank isGeneralSpoiler isMediaSpoiler isAdult userId }
      relations { edges { id relationType node { id idMal title { romaji english native userPreferred } type format status siteUrl } } pageInfo { total perPage currentPage lastPage hasNextPage } }
      characters { edges { id role name node { id name { first middle last full native userPreferred } image { large medium } siteUrl } voiceActors { id name { first middle last full native userPreferred } languageV2 image { large medium } siteUrl } } pageInfo { total perPage currentPage lastPage hasNextPage } }
      staff { edges { id role node { id name { first middle last full native userPreferred } languageV2 image { large medium } description(asHtml: false) primaryOccupations gender dateOfBirth { year month day } dateOfDeath { year month day } age yearsActive homeTown bloodType siteUrl } } pageInfo { total perPage currentPage lastPage hasNextPage } }
      studios { edges { isMain node { id name isAnimationStudio siteUrl } } pageInfo { total perPage currentPage lastPage hasNextPage } }
      isFavourite isFavouriteBlocked isAdult nextAiringEpisode { id airingAt timeUntilAiring episode mediaId }
      airingSchedule(perPage: 50) { nodes { id airingAt timeUntilAiring episode mediaId } pageInfo { total perPage currentPage lastPage hasNextPage } }
      trends { nodes { mediaId date trending averageScore popularity inProgress releasing episode } pageInfo { total perPage currentPage lastPage hasNextPage } }
      externalLinks { id url site siteId type language color icon notes isDisabled }
      streamingEpisodes { title thumbnail url site }
      rankings { id rank type format year season allTime context }
      mediaListEntry { id userId mediaId status score progress progressVolumes repeat priority private notes hiddenFromStatusLists customLists advancedScores startedAt { year month day } completedAt { year month day } updatedAt createdAt }
      reviews { nodes { id userId mediaId mediaType summary body rating ratingAmount score private siteUrl createdAt updatedAt user { id name siteUrl } } pageInfo { total perPage currentPage lastPage hasNextPage } }
      recommendations { nodes { id rating userRating mediaRecommendation { id idMal title { romaji english native userPreferred } type format status siteUrl } user { id name siteUrl } } pageInfo { total perPage currentPage lastPage hasNextPage } }
      stats { scoreDistribution { score amount } statusDistribution { status amount } }
      siteUrl autoCreateForumThread isRecommendationBlocked isReviewBlocked modNotes
    }
  }
`;

/** Fetch AniList's complete public media detail payload for one anime. */
export async function fetchAnimeDetail(id: number): Promise<AnimeDetail | null> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: DETAIL_QUERY, variables: { id } }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`AniList request failed: ${res.status} ${res.statusText}`);

  const json = (await res.json()) as {
    data?: { Media: AnimeDetail | null };
    errors?: { message: string }[];
  };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data?.Media ?? null;
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
    externalLinks: m.externalLinks.filter((link) => !link.isDisabled),
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
