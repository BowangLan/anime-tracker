import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { findAnimeByTitles, openWritableDatabase, searchAnime, upsertAnime } from "./database";
import type { AniwavesAnime } from "./types";

test("upserts, searches, and matches catalog records", () => {
  const directory = mkdtempSync(join(tmpdir(), "aniwaves-db-test-"));
  const path = join(directory, "catalog.sqlite");
  try {
    const db = openWritableDatabase(path);
    upsertAnime(db, fixtureAnime());
    db.close();

    assert.equal(findAnimeByTitles(["Bungou Stray Dogs"], 2016, path)?.sourceId, 80525);
    assert.equal(searchAnime("bungo", { year: 2016, path })[0]?.title, "Bungo Stray Dogs");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

function fixtureAnime(): AniwavesAnime {
  return {
    sourceId: 80525,
    slug: "bungo-stray-dogs",
    url: "https://aniwaves.ru/watch/bungo-stray-dogs-80525",
    title: "Bungo Stray Dogs",
    titleJapanese: "Bungou Stray Dogs",
    alternateTitles: ["Literary Stray Dogs", "文豪ストレイドッグス"],
    synopsis: "Synopsis",
    type: "TV",
    status: "Finished",
    startDate: "2016-04-07T00:00:00.000Z",
    endDate: "2016-06-23T00:00:00.000Z",
    year: 2016,
    episodeCount: 12,
    subbedEpisodes: 12,
    dubbedEpisodes: 12,
    durationMinutes: 23,
    imageUrl: null,
    thumbnailUrl: null,
    contentRating: "R",
    score: 8,
    scoreCount: 724736,
    genres: ["Action"],
    tags: ["Detective"],
    studios: ["Bones"],
    producers: [],
    licensors: [],
    sourceUpdatedAt: "2026-07-19T04:32:23.000Z",
    scrapedAt: "2026-07-19T10:00:00.000Z",
  };
}
