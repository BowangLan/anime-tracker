import assert from "node:assert/strict";
import test from "node:test";
import { parseAnimePage, parseSitemap, parseSitemapIndex } from "./parser";

test("parses sitemap indexes and entries", () => {
  assert.deepEqual(
    parseSitemapIndex("<sitemapindex><sitemap><loc>/sitemap-anime-1.xml</loc></sitemap></sitemapindex>", "https://aniwaves.ru"),
    ["https://aniwaves.ru/sitemap-anime-1.xml"],
  );
  assert.deepEqual(
    parseSitemap("<urlset><url><loc>/watch/example-42</loc><lastmod>2026-07-19T04:32:23Z</lastmod></url></urlset>", "https://aniwaves.ru"),
    [{ url: "https://aniwaves.ru/watch/example-42", lastModified: "2026-07-19T04:32:23.000Z" }],
  );
});

test("parses structured anime metadata and page-only fields", () => {
  const html = `
    <script type="application/ld+json">{
      "@context":"https://schema.org", "@type":"TVSeries",
      "url":"https://aniwaves.ru/watch/bungo-stray-dogs-80525", "name":"Bungo Stray Dogs",
      "alternateName":"Literary Stray Dogs", "description":"Short synopsis", "startDate":"2016-04-07",
      "endDate":"2016-06-23", "dateModified":"2026-07-19T04:32:23Z", "numberOfEpisodes":12,
      "image":"https://static.aniwaves.ru/cover.jpg", "contentRating":"R", "genre":["Action","Mystery"],
      "about":[{"name":"Detective"}], "productionCompany":[{"name":"Bones"}],
      "additionalProperty":[{"name":"Subbed episodes released","value":12},{"name":"Dubbed episodes released","value":10}],
      "aggregateRating":{"ratingValue":8,"ratingCount":724736}
    }</script>
    <div id="watch-main" data-id="80525"></div>
    <div id="w-info">
      <div class="poster"><img src="/poster.jpg"></div>
      <h1 class="title" data-jp="Bungou Stray Dogs">Bungo Stray Dogs</h1>
      <div class="names">Bungou Stray Dogs, Literary Stray Dogs, 文豪ストレイドッグス</div>
      <div class="film-description"><div class="content">A complete synopsis.</div></div>
      <div class="bmeta"><div class="meta"><div>Type: <span>TV</span></div><div>Status: Finished</div></div>
      <div class="meta"><div>Duration: 23 min</div><div>Episodes: 12 / 12</div></div></div>
      <a href="/producers/kadokawa">Kadokawa</a><a href="/licensors/crunchyroll">Crunchyroll</a>
    </div>`;
  const anime = parseAnimePage(html, "https://aniwaves.ru/watch/bungo-stray-dogs-80525", "2026-07-19T10:00:00.000Z");
  assert.equal(anime.sourceId, 80525);
  assert.equal(anime.slug, "bungo-stray-dogs");
  assert.equal(anime.year, 2016);
  assert.equal(anime.episodeCount, 12);
  assert.equal(anime.durationMinutes, 23);
  assert.equal(anime.synopsis, "A complete synopsis.");
  assert.deepEqual(anime.genres, ["Action", "Mystery"]);
  assert.deepEqual(anime.studios, ["Bones"]);
  assert.deepEqual(anime.producers, ["Kadokawa"]);
  assert.deepEqual(anime.licensors, ["Crunchyroll"]);
  assert.ok(anime.alternateTitles.includes("文豪ストレイドッグス"));
});
