import robotsParser from "robots-parser";
import {
  beginScrapeRun,
  entriesNeedingRefresh,
  finishScrapeRun,
  openWritableDatabase,
  reconcileDiscoveredEntries,
  recordFailure,
  upsertAnime,
} from "./database";
import { parseAnimePage, parseSitemap, parseSitemapIndex } from "./parser";
import type { ScrapeOptions, ScrapeSummary, SitemapEntry } from "./types";

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const MAX_RETRIES = 3;

export async function scrapeAniwaves(options: ScrapeOptions): Promise<ScrapeSummary> {
  const baseUrl = new URL(options.baseUrl);
  if (!(["http:", "https:"].includes(baseUrl.protocol))) throw new Error("Base URL must use HTTP or HTTPS");

  const db = openWritableDatabase(options.databasePath);
  const runId = beginScrapeRun(db);
  const summary: ScrapeSummary = { runId, discovered: 0, queued: 0, succeeded: 0, failed: 0, skipped: 0 };

  try {
    const fetcher = new PoliteFetcher(options.delayMs, options.userAgent, baseUrl.origin);
    const robotsUrl = new URL("/robots.txt", baseUrl).href;
    const robotsText = await fetcher.text(robotsUrl, ["text/plain", "text/"]);
    const robots = robotsParser(robotsUrl, robotsText);
    fetcher.setDelay(Math.max(options.delayMs, (robots.getCrawlDelay(options.userAgent) ?? 0) * 1_000));
    const sitemapUrl = new URL("/sitemap.xml", baseUrl).href;
    assertAllowed(robots, sitemapUrl, options.userAgent);

    const sitemapIndex = await fetcher.text(sitemapUrl, ["application/xml", "text/xml", "text/plain"]);
    const sitemapUrls = parseSitemapIndex(sitemapIndex, baseUrl.href).filter((url) => {
      const parsed = new URL(url);
      return parsed.origin === baseUrl.origin && /sitemap-anime-\d+\.xml$/.test(parsed.pathname);
    });
    if (sitemapUrls.length === 0) throw new Error("No anime sitemaps were discovered");

    const discovered = new Map<string, SitemapEntry>();
    for (const url of sitemapUrls) {
      assertAllowed(robots, url, options.userAgent);
      const xml = await fetcher.text(url, ["application/xml", "text/xml", "text/plain"]);
      for (const entry of parseSitemap(xml, baseUrl.href)) {
        const parsed = new URL(entry.url);
        if (parsed.origin === baseUrl.origin && parsed.pathname.startsWith("/watch/")) discovered.set(entry.url, entry);
      }
    }

    summary.discovered = discovered.size;
    reconcileDiscoveredEntries(db, [...discovered.values()], runId);
    const staleEntries = entriesNeedingRefresh(db, [...discovered.values()], options.force);
    const queue = options.limit == null ? staleEntries : staleEntries.slice(0, options.limit);
    summary.queued = queue.length;
    summary.skipped = summary.discovered - queue.length;

    let cursor = 0;
    const workers = Array.from({ length: Math.min(options.concurrency, Math.max(queue.length, 1)) }, async () => {
      while (cursor < queue.length) {
        const entry = queue[cursor++];
        try {
          assertAllowed(robots, entry.url, options.userAgent);
          const html = await fetcher.text(entry.url, ["text/html"]);
          const anime = parseAnimePage(html, entry.url);
          upsertAnime(db, anime, runId);
          summary.succeeded += 1;
        } catch (error) {
          summary.failed += 1;
          recordFailure(db, runId, entry.url, error);
          console.error(`[aniwaves] failed ${entry.url}:`, error instanceof Error ? error.message : error);
        }
      }
    });
    await Promise.all(workers);

    finishScrapeRun(db, runId, { status: summary.failed > 0 ? "partial" : "completed", ...summary });
    return summary;
  } catch (error) {
    finishScrapeRun(db, runId, {
      status: "failed",
      ...summary,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    db.close();
  }
}

class PoliteFetcher {
  private nextRequestAt = 0;
  private gate: Promise<void> = Promise.resolve();

  constructor(
    private delayMs: number,
    private readonly userAgent: string,
    private readonly allowedOrigin: string,
  ) {}

  setDelay(delayMs: number): void {
    this.delayMs = delayMs;
  }

  async text(url: string, acceptedTypes: string[]): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      await this.waitForTurn();
      try {
        const response = await fetch(url, {
          headers: { accept: acceptedTypes.join(", "), "user-agent": this.userAgent },
          redirect: "follow",
          signal: AbortSignal.timeout(20_000),
        });
        if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
          await wait(retryDelay(response.headers.get("retry-after"), attempt));
          continue;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
        if (new URL(response.url).origin !== this.allowedOrigin) throw new Error(`Cross-origin redirect to ${response.url}`);
        const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
        if (contentType && !acceptedTypes.some((type) => contentType.includes(type))) {
          throw new Error(`Unexpected content type: ${contentType}`);
        }
        const contentLength = Number(response.headers.get("content-length"));
        if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
          throw new Error(`Response exceeds ${MAX_RESPONSE_BYTES} bytes`);
        }
        const body = await response.text();
        if (Buffer.byteLength(body) > MAX_RESPONSE_BYTES) throw new Error(`Response exceeds ${MAX_RESPONSE_BYTES} bytes`);
        return body;
      } catch (error) {
        lastError = error;
        if (attempt < MAX_RETRIES) await wait(retryDelay(null, attempt));
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async waitForTurn(): Promise<void> {
    const previous = this.gate;
    let release = () => {};
    this.gate = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    const delay = Math.max(0, this.nextRequestAt - Date.now());
    if (delay > 0) await wait(delay);
    this.nextRequestAt = Date.now() + this.delayMs;
    release();
  }
}

function assertAllowed(
  robots: ReturnType<typeof robotsParser>,
  url: string,
  userAgent: string,
): void {
  if (robots.isAllowed(url, userAgent) === false) throw new Error(`robots.txt disallows ${url}`);
}

function retryDelay(retryAfter: string | null, attempt: number): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.min(seconds * 1_000, 60_000);
    const date = new Date(retryAfter).valueOf();
    if (Number.isFinite(date)) return Math.min(Math.max(date - Date.now(), 0), 60_000);
  }
  return Math.min(1_000 * 2 ** attempt + Math.floor(Math.random() * 250), 10_000);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
