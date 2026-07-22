import { mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import Database from "better-sqlite3";
import { normalizeTitle, uniqueTitles } from "./normalize";
import type { AniwavesAnime, SitemapEntry } from "./types";

const DEFAULT_DATABASE_PATH = "data/aniwaves.sqlite";

interface AnimeRow {
  source_id: number;
  slug: string;
  url: string;
  title: string;
  title_japanese: string | null;
  alternate_titles_json: string;
  synopsis: string | null;
  type: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  year: number | null;
  episode_count: number | null;
  subbed_episodes: number | null;
  dubbed_episodes: number | null;
  duration_minutes: number | null;
  image_url: string | null;
  thumbnail_url: string | null;
  content_rating: string | null;
  score: number | null;
  score_count: number | null;
  genres_json: string;
  tags_json: string;
  studios_json: string;
  producers_json: string;
  licensors_json: string;
  source_updated_at: string | null;
  scraped_at: string;
}

export function databasePath(): string {
  const configuredPath = process.env.ANIWAVES_DB_PATH;
  return configuredPath
    ? resolve(/* turbopackIgnore: true */ configuredPath)
    : join(process.cwd(), DEFAULT_DATABASE_PATH);
}

export function openWritableDatabase(path = databasePath()): Database.Database {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  migrate(db);
  return db;
}

export function openReadableDatabase(path = databasePath()): Database.Database | null {
  if (!existsSync(path)) return null;
  const db = new Database(path, { readonly: true, fileMustExist: true });
  db.pragma("query_only = ON");
  db.pragma("busy_timeout = 5000");
  return db;
}

export function beginScrapeRun(db: Database.Database): number {
  const result = db.prepare("INSERT INTO scrape_runs (status) VALUES ('running')").run();
  return Number(result.lastInsertRowid);
}

export function finishScrapeRun(
  db: Database.Database,
  runId: number,
  values: { status: "completed" | "partial" | "failed"; discovered: number; queued: number; succeeded: number; failed: number; error?: string },
): void {
  db.prepare(`
    UPDATE scrape_runs
    SET completed_at = CURRENT_TIMESTAMP, status = @status, discovered_count = @discovered,
        queued_count = @queued, succeeded_count = @succeeded, failed_count = @failed, error = @error
    WHERE id = @runId
  `).run({ ...values, runId, error: values.error ?? null });
}

export function recordFailure(db: Database.Database, runId: number, url: string, error: unknown): void {
  db.prepare("INSERT INTO scrape_failures (run_id, url, error) VALUES (?, ?, ?)").run(
    runId,
    url,
    error instanceof Error ? error.message.slice(0, 2_000) : String(error).slice(0, 2_000),
  );
}

export function entriesNeedingRefresh(
  db: Database.Database,
  entries: SitemapEntry[],
  force: boolean,
): SitemapEntry[] {
  if (force) return entries;
  const lookup = db.prepare("SELECT source_updated_at FROM anime WHERE url = ?");
  return entries.filter((entry) => {
    const row = lookup.get(entry.url) as { source_updated_at: string | null } | undefined;
    if (!row) return true;
    if (!entry.lastModified) return false;
    if (!row.source_updated_at) return true;
    return new Date(entry.lastModified).valueOf() > new Date(row.source_updated_at).valueOf();
  });
}

export function reconcileDiscoveredEntries(
  db: Database.Database,
  entries: SitemapEntry[],
  runId: number,
): void {
  const reconcile = db.transaction(() => {
    db.exec("CREATE TEMP TABLE IF NOT EXISTS discovered_urls (url TEXT PRIMARY KEY); DELETE FROM discovered_urls;");
    const insert = db.prepare("INSERT OR IGNORE INTO discovered_urls (url) VALUES (?)");
    for (const entry of entries) insert.run(entry.url);
    db.prepare("UPDATE anime SET is_active = 0 WHERE url NOT IN (SELECT url FROM discovered_urls)").run();
    db.prepare("UPDATE anime SET is_active = 1, last_seen_run_id = ? WHERE url IN (SELECT url FROM discovered_urls)").run(runId);
  });
  reconcile();
}

export function upsertAnime(db: Database.Database, anime: AniwavesAnime, runId: number | null = null): void {
  const upsert = db.prepare(`
    INSERT INTO anime (
      source_id, slug, url, title, title_japanese, alternate_titles_json, synopsis, type, status,
      start_date, end_date, year, episode_count, subbed_episodes, dubbed_episodes, duration_minutes,
      image_url, thumbnail_url, content_rating, score, score_count, genres_json, tags_json, studios_json,
      producers_json, licensors_json, source_updated_at, scraped_at, is_active, last_seen_run_id
    ) VALUES (
      @sourceId, @slug, @url, @title, @titleJapanese, @alternateTitles, @synopsis, @type, @status,
      @startDate, @endDate, @year, @episodeCount, @subbedEpisodes, @dubbedEpisodes, @durationMinutes,
      @imageUrl, @thumbnailUrl, @contentRating, @score, @scoreCount, @genres, @tags, @studios,
      @producers, @licensors, @sourceUpdatedAt, @scrapedAt, 1, @runId
    )
    ON CONFLICT(source_id) DO UPDATE SET
      slug = excluded.slug, url = excluded.url, title = excluded.title, title_japanese = excluded.title_japanese,
      alternate_titles_json = excluded.alternate_titles_json, synopsis = excluded.synopsis, type = excluded.type,
      status = excluded.status, start_date = excluded.start_date, end_date = excluded.end_date, year = excluded.year,
      episode_count = excluded.episode_count, subbed_episodes = excluded.subbed_episodes,
      dubbed_episodes = excluded.dubbed_episodes, duration_minutes = excluded.duration_minutes,
      image_url = excluded.image_url, thumbnail_url = excluded.thumbnail_url, content_rating = excluded.content_rating,
      score = excluded.score, score_count = excluded.score_count, genres_json = excluded.genres_json,
      tags_json = excluded.tags_json, studios_json = excluded.studios_json, producers_json = excluded.producers_json,
      licensors_json = excluded.licensors_json, source_updated_at = excluded.source_updated_at,
      scraped_at = excluded.scraped_at, is_active = 1, last_seen_run_id = excluded.last_seen_run_id
  `);
  const replaceAliases = db.transaction(() => {
    upsert.run({
      ...anime,
      alternateTitles: JSON.stringify(anime.alternateTitles),
      genres: JSON.stringify(anime.genres),
      tags: JSON.stringify(anime.tags),
      studios: JSON.stringify(anime.studios),
      producers: JSON.stringify(anime.producers),
      licensors: JSON.stringify(anime.licensors),
      runId,
    });
    db.prepare("DELETE FROM anime_aliases WHERE anime_id = ?").run(anime.sourceId);
    const insertAlias = db.prepare(
      "INSERT OR IGNORE INTO anime_aliases (anime_id, alias, normalized_alias) VALUES (?, ?, ?)",
    );
    for (const alias of uniqueTitles([anime.title, anime.titleJapanese, ...anime.alternateTitles])) {
      insertAlias.run(anime.sourceId, alias, normalizeTitle(alias));
    }
  });
  replaceAliases();
}

export function findAnimeByTitles(
  titles: Array<string | null | undefined>,
  year?: number | null,
  path = databasePath(),
): AniwavesAnime | null {
  const normalized = uniqueTitles(titles).map(normalizeTitle).filter(Boolean);
  if (normalized.length === 0) return null;
  const db = openReadableDatabase(path);
  if (!db) return null;
  try {
    const placeholders = normalized.map(() => "?").join(", ");
    const row = db.prepare(`
      SELECT DISTINCT a.*
      FROM anime a
      JOIN anime_aliases aa ON aa.anime_id = a.source_id
      WHERE a.is_active = 1 AND aa.normalized_alias IN (${placeholders})
      ORDER BY CASE WHEN a.year = ? THEN 0 WHEN a.year IS NULL OR ? IS NULL THEN 1 ELSE 2 END,
               a.score_count DESC NULLS LAST
      LIMIT 1
    `).get(...normalized, year ?? null, year ?? null) as AnimeRow | undefined;
    return row ? rowToAnime(row) : null;
  } finally {
    db.close();
  }
}

export function searchAnime(
  query: string,
  options: { year?: number | null; limit?: number; path?: string } = {},
): AniwavesAnime[] {
  const normalized = normalizeTitle(query);
  if (!normalized) return [];
  const db = openReadableDatabase(options.path);
  if (!db) return [];
  try {
    const rows = db.prepare(`
      SELECT DISTINCT a.*
      FROM anime a
      JOIN anime_aliases aa ON aa.anime_id = a.source_id
      WHERE a.is_active = 1 AND aa.normalized_alias LIKE ? ESCAPE '\\'
      ORDER BY CASE WHEN a.year = ? THEN 0 WHEN a.year IS NULL OR ? IS NULL THEN 1 ELSE 2 END,
               length(aa.normalized_alias), a.score_count DESC NULLS LAST
      LIMIT ?
    `).all(`${escapeLike(normalized)}%`, options.year ?? null, options.year ?? null, Math.min(options.limit ?? 20, 50)) as AnimeRow[];
    return rows.map(rowToAnime);
  } finally {
    db.close();
  }
}

export function getAnimeBySourceId(sourceId: number, path = databasePath()): AniwavesAnime | null {
  const db = openReadableDatabase(path);
  if (!db) return null;
  try {
    const row = db.prepare("SELECT * FROM anime WHERE source_id = ? AND is_active = 1").get(sourceId) as AnimeRow | undefined;
    return row ? rowToAnime(row) : null;
  } finally {
    db.close();
  }
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS anime (
      source_id INTEGER PRIMARY KEY,
      slug TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      title_japanese TEXT,
      alternate_titles_json TEXT NOT NULL DEFAULT '[]',
      synopsis TEXT,
      type TEXT,
      status TEXT,
      start_date TEXT,
      end_date TEXT,
      year INTEGER,
      episode_count INTEGER,
      subbed_episodes INTEGER,
      dubbed_episodes INTEGER,
      duration_minutes INTEGER,
      image_url TEXT,
      thumbnail_url TEXT,
      content_rating TEXT,
      score REAL,
      score_count INTEGER,
      genres_json TEXT NOT NULL DEFAULT '[]',
      tags_json TEXT NOT NULL DEFAULT '[]',
      studios_json TEXT NOT NULL DEFAULT '[]',
      producers_json TEXT NOT NULL DEFAULT '[]',
      licensors_json TEXT NOT NULL DEFAULT '[]',
      source_updated_at TEXT,
      scraped_at TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
      last_seen_run_id INTEGER
    );
    CREATE INDEX IF NOT EXISTS anime_year_idx ON anime(year);
    CREATE INDEX IF NOT EXISTS anime_source_updated_idx ON anime(source_updated_at);
    CREATE TABLE IF NOT EXISTS anime_aliases (
      anime_id INTEGER NOT NULL REFERENCES anime(source_id) ON DELETE CASCADE,
      alias TEXT NOT NULL,
      normalized_alias TEXT NOT NULL,
      PRIMARY KEY (anime_id, normalized_alias)
    );
    CREATE INDEX IF NOT EXISTS anime_aliases_normalized_idx ON anime_aliases(normalized_alias);
    CREATE TABLE IF NOT EXISTS scrape_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      status TEXT NOT NULL CHECK(status IN ('running', 'completed', 'partial', 'failed')),
      discovered_count INTEGER NOT NULL DEFAULT 0,
      queued_count INTEGER NOT NULL DEFAULT 0,
      succeeded_count INTEGER NOT NULL DEFAULT 0,
      failed_count INTEGER NOT NULL DEFAULT 0,
      error TEXT
    );
    CREATE TABLE IF NOT EXISTS scrape_failures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id INTEGER NOT NULL REFERENCES scrape_runs(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      error TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    PRAGMA user_version = 1;
  `);
}

function rowToAnime(row: AnimeRow): AniwavesAnime {
  return {
    sourceId: row.source_id,
    slug: row.slug,
    url: row.url,
    title: row.title,
    titleJapanese: row.title_japanese,
    alternateTitles: jsonArray(row.alternate_titles_json),
    synopsis: row.synopsis,
    type: row.type,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    year: row.year,
    episodeCount: row.episode_count,
    subbedEpisodes: row.subbed_episodes,
    dubbedEpisodes: row.dubbed_episodes,
    durationMinutes: row.duration_minutes,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url,
    contentRating: row.content_rating,
    score: row.score,
    scoreCount: row.score_count,
    genres: jsonArray(row.genres_json),
    tags: jsonArray(row.tags_json),
    studios: jsonArray(row.studios_json),
    producers: jsonArray(row.producers_json),
    licensors: jsonArray(row.licensors_json),
    sourceUpdatedAt: row.source_updated_at,
    scrapedAt: row.scraped_at,
  };
}

function jsonArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
