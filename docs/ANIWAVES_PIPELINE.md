# Aniwaves catalog pipeline

This pipeline discovers public anime detail pages from `aniwaves.ru` sitemaps,
extracts catalog metadata from JSON-LD and page markup, and incrementally upserts
the result into SQLite. It intentionally does **not** call blocked `/api` or
`/ajax` routes and does not collect video, embed, download, account, or comment
data.

## Before operating it

The source site's robots file and terms are separate controls. A URL being
crawlable under `robots.txt` is not a grant of a license to copy or republish its
content. Confirm that your use, retention, and display of source metadata is
authorized and complies with the current source terms and applicable law before
running this outside development. Keep the crawler user agent identifiable and
provide a monitored contact URL or email.

## Run a sync

Install and validate the project with Bun, then run the scraper script:

```bash
bun install
ANIWAVES_USER_AGENT='AiringCatalogBot/1.0 (+mailto:data@example.com)' \
  bun run scrape:aniwaves
```

The default database is `data/aniwaves.sqlite`. Override it with
`ANIWAVES_DB_PATH` or `--database`:

```bash
bun run scrape:aniwaves -- --database /var/lib/airing/aniwaves.sqlite
```

Useful operational flags:

- `--limit 100` caps one run, which is useful for smoke tests and gradual first
  imports.
- `--force` ignores source timestamps and refreshes every discovered record.
- `--concurrency 2 --delay-ms 1000` controls workers and the global request
  interval. The delay applies across all workers, not per worker.
- `--base-url` exists for fixture servers and disaster recovery testing. Only
  same-origin anime sitemap and `/watch/` URLs are followed.

Normal runs are incremental: an existing page is skipped when its sitemap
timestamp is not newer than the last stored source modification timestamp.
Failures are isolated per page and written to `scrape_failures`; a partially
failed run is marked `partial` and exits non-zero so a scheduler can alert without losing successful
upserts. HTTP 429 and 5xx responses are retried with bounded exponential backoff
and `Retry-After` support.

For production, schedule a single instance at a time (for example, daily), back
up the database, monitor non-zero exits, and place the database on persistent
storage. A Vercel function filesystem is ephemeral, so the web app and pipeline
must share a persistent volume or the database must be copied into the release
artifact after each completed sync.

## Storage model

SQLite runs in WAL mode with foreign keys and a busy timeout. Core tables are:

- `anime`: one current metadata snapshot per Aniwaves source id, with titles no
  longer present in the source sitemaps retained but marked inactive.
- `anime_aliases`: normalized English, romaji, native, and alternate titles used
  to connect AniList records to source records.
- `scrape_runs`: counts and status for every pipeline execution.
- `scrape_failures`: page-level errors tied to a run.

Generated `.sqlite`, `-wal`, and `-shm` files under `data/` are gitignored.

## App access

The existing AniList detail page performs a read-only exact alias match, with
year as a tie-breaker, and shows the canonical Aniwaves catalog link when a match
exists. Missing databases and unmatched titles degrade to no link.

The read-only API supports direct lookup and prefix search:

```text
GET /api/aniwaves/anime?sourceId=80525
GET /api/aniwaves/anime?q=Bungo%20Stray%20Dogs&year=2016&limit=20
```

Responses contain catalog metadata and canonical source URLs; they never expose
playback endpoints.

## Verification

```bash
bun run test:aniwaves
bun run lint
bun run build
bun run scrape:aniwaves -- --limit 1 --database /tmp/aniwaves-smoke.sqlite
```

Parser tests use synthetic HTML and XML fixtures. The final command is an
optional live smoke test and should only be run when source access is authorized.
