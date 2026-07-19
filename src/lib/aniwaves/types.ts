export interface AniwavesAnime {
  sourceId: number;
  slug: string;
  url: string;
  title: string;
  titleJapanese: string | null;
  alternateTitles: string[];
  synopsis: string | null;
  type: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  year: number | null;
  episodeCount: number | null;
  subbedEpisodes: number | null;
  dubbedEpisodes: number | null;
  durationMinutes: number | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  contentRating: string | null;
  score: number | null;
  scoreCount: number | null;
  genres: string[];
  tags: string[];
  studios: string[];
  producers: string[];
  licensors: string[];
  sourceUpdatedAt: string | null;
  scrapedAt: string;
}

export interface SitemapEntry {
  url: string;
  lastModified: string | null;
}

export interface ScrapeOptions {
  baseUrl: string;
  databasePath: string;
  concurrency: number;
  delayMs: number;
  limit?: number;
  force: boolean;
  userAgent: string;
}

export interface ScrapeSummary {
  runId: number;
  discovered: number;
  queued: number;
  succeeded: number;
  failed: number;
  skipped: number;
}
