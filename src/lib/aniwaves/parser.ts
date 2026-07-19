import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { uniqueTitles } from "./normalize";
import type { AniwavesAnime, SitemapEntry } from "./types";

type JsonLd = Record<string, unknown>;

const xmlParser = new XMLParser({ ignoreAttributes: false, trimValues: true });

export function parseSitemapIndex(xml: string, baseUrl: string): string[] {
  const parsed = xmlParser.parse(xml) as {
    sitemapindex?: { sitemap?: Array<{ loc?: string }> | { loc?: string } };
  };
  return asArray(parsed.sitemapindex?.sitemap)
    .map((entry) => absoluteHttpUrl(entry.loc, baseUrl))
    .filter((url): url is string => Boolean(url));
}

export function parseSitemap(xml: string, baseUrl: string): SitemapEntry[] {
  const parsed = xmlParser.parse(xml) as {
    urlset?: { url?: Array<{ loc?: string; lastmod?: string }> | { loc?: string; lastmod?: string } };
  };
  return asArray(parsed.urlset?.url)
    .map((entry) => ({
      url: absoluteHttpUrl(entry.loc, baseUrl),
      lastModified: isoDate(entry.lastmod),
    }))
    .filter((entry): entry is SitemapEntry => Boolean(entry.url));
}

export function parseAnimePage(html: string, pageUrl: string, scrapedAt = new Date().toISOString()): AniwavesAnime {
  const $ = load(html);
  const jsonLd = $("script[type='application/ld+json']")
    .toArray()
    .map((element) => parseJsonLd($(element).text()))
    .flatMap(flattenJsonLd)
    .find((entry) => ["TVSeries", "Movie", "CreativeWorkSeries"].includes(String(entry["@type"] ?? "")));

  if (!jsonLd) throw new Error("Anime JSON-LD was not found");

  const sourceId = positiveInteger($("#watch-main").attr("data-id")) ?? sourceIdFromUrl(pageUrl);
  if (!sourceId) throw new Error("Aniwaves source id was not found");

  const canonicalUrl = absoluteHttpUrl(asString(jsonLd.url), pageUrl) ?? pageUrl;
  const canonical = new URL(canonicalUrl);
  const slug = canonical.pathname.split("/").filter(Boolean).at(-1)?.replace(/-\d+$/, "") ?? String(sourceId);
  const title = asString(jsonLd.name)?.trim() || $("#w-info h1.title").first().text().trim();
  if (!title) throw new Error("Anime title was not found");

  const japaneseTitle = $("#w-info h1.title").first().attr("data-jp")?.trim() || null;
  const pageAliases = $("#w-info .names")
    .first()
    .text()
    .split(",")
    .map((value) => value.trim());
  const alternateTitles = uniqueTitles([
    ...asStringArray(jsonLd.alternateName),
    ...pageAliases,
    japaneseTitle,
  ]).filter((value) => value !== title);
  const additional = additionalProperties(jsonLd.additionalProperty);

  return {
    sourceId,
    slug,
    url: canonical.href,
    title,
    titleJapanese: japaneseTitle,
    alternateTitles,
    synopsis: textOrNull($("#w-info .film-description .content").first().text()) ?? asString(jsonLd.description),
    type: metaValue($, "Type"),
    status: metaValue($, "Status"),
    startDate: isoDate(asString(jsonLd.startDate) ?? additional.get("Start date")),
    endDate: isoDate(asString(jsonLd.endDate) ?? additional.get("End date")),
    year: yearFrom(jsonLd.startDate) ?? yearFrom(metaValue($, "Premiered")),
    episodeCount: positiveInteger(jsonLd.numberOfEpisodes) ?? episodeTotal(metaValue($, "Episodes")),
    subbedEpisodes: positiveInteger(additional.get("Subbed episodes released")),
    dubbedEpisodes: positiveInteger(additional.get("Dubbed episodes released")),
    durationMinutes: positiveInteger(metaValue($, "Duration")),
    imageUrl: absoluteHttpUrl(asString(jsonLd.image), pageUrl),
    thumbnailUrl: absoluteHttpUrl($("#w-info .poster img").first().attr("src"), pageUrl),
    contentRating: asString(jsonLd.contentRating),
    score: finiteNumber(asRecord(jsonLd.aggregateRating)?.ratingValue),
    scoreCount: positiveInteger(asRecord(jsonLd.aggregateRating)?.ratingCount),
    genres: uniqueTitles(asStringArray(jsonLd.genre)),
    tags: uniqueTitles(asArray(jsonLd.about).map((item) => asString(asRecord(item)?.name))),
    studios: organizations(jsonLd.productionCompany),
    producers: linkTitles($, "/producers/"),
    licensors: linkTitles($, "/licensors/"),
    sourceUpdatedAt: isoDate(asString(jsonLd.dateModified)),
    scrapedAt,
  };
}

function parseJsonLd(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function flattenJsonLd(value: unknown): JsonLd[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  const record = asRecord(value);
  if (!record) return [];
  return [record, ...asArray(record["@graph"]).flatMap(flattenJsonLd)];
}

function metaValue($: ReturnType<typeof load>, label: string): string | null {
  const prefix = `${label.toLowerCase()}:`;
  for (const element of $("#w-info .bmeta .meta > div").toArray()) {
    const text = $(element).text().replace(/\s+/g, " ").trim();
    if (text.toLowerCase().startsWith(prefix)) return text.slice(prefix.length).trim() || null;
  }
  return null;
}

function linkTitles($: ReturnType<typeof load>, path: string): string[] {
  return uniqueTitles($(`#w-info a[href^='${path}']`).toArray().map((element) => $(element).text()));
}

function organizations(value: unknown): string[] {
  return uniqueTitles(asArray(value).map((item) => asString(asRecord(item)?.name)));
}

function additionalProperties(value: unknown): Map<string, unknown> {
  return new Map(
    asArray(value)
      .map((item) => asRecord(item))
      .filter((item): item is JsonLd => Boolean(item))
      .map((item) => [String(item.name ?? ""), item.value]),
  );
}

function episodeTotal(value: string | null): number | null {
  if (!value) return null;
  return positiveInteger(value.match(/\d+/g)?.at(-1));
}

function sourceIdFromUrl(value: string): number | null {
  return positiveInteger(/-(\d+)\/?$/.exec(new URL(value).pathname)?.[1]);
}

function yearFrom(value: unknown): number | null {
  const match = /(?:^|\D)((?:19|20)\d{2})(?:\D|$)/.exec(String(value ?? ""));
  return match ? Number(match[1]) : null;
}

function isoDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function positiveInteger(value: unknown): number | null {
  const number = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function finiteNumber(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asRecord(value: unknown): JsonLd | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonLd) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  return asArray(value).map(asString).filter((item): item is string => Boolean(item));
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function textOrNull(value: string): string | null {
  const text = value.replace(/\s+/g, " ").trim();
  return text || null;
}

function absoluteHttpUrl(value: unknown, baseUrl: string): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, baseUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
