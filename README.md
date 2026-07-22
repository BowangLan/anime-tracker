# Airing — anime schedule dashboard

A dashboard of currently airing anime, organized by the weekday each show
updates on, with its latest episode number and season progress. Built to answer
one question at a glance: _what's dropping, and when?_

The schedule is fetched live from the **AniList** GraphQL API (free, no key).
The only thing stored locally is which shows you follow.

An optional production-oriented Aniwaves metadata pipeline can populate a local
SQLite catalog and link matching source records from AniList detail pages. See
[`docs/ANIWAVES_PIPELINE.md`](docs/ANIWAVES_PIPELINE.md) for scope, authorization
requirements, operation, persistence, and API details.

For a dated product/technical audit and proposed roadmap, see
[`docs/STATE_AND_DIRECTIONS.md`](docs/STATE_AND_DIRECTIONS.md).

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI under the hood)
- **zustand** with `persist` for followed-show ids
- Design system from `getdesign`'s **Framer** profile — see `DESIGN.md`
- Data: [AniList GraphQL API](https://anilist.co/graphql)
- Optional catalog store: SQLite populated from public Aniwaves sitemaps

## Run it

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # production build + type check
bun run lint
```

## How it's laid out

| Path | What it holds |
| --- | --- |
| `src/lib/anilist.ts` | AniList client: query, `AiringAnime` type, current-season logic. |
| `src/lib/schedule.ts` | Client-side derivation: weekday, latest episode, progress, countdowns. |
| `src/lib/store.ts` | zustand store for followed shows (persisted to `localStorage`). |
| `src/lib/use-now.ts` | Hydration-safe, minute-ticking clock via `useSyncExternalStore`. |
| `src/app/page.tsx` | Server Component: fetches the season, renders the dashboard. |
| `src/components/dashboard.tsx` | The dashboard shell: sidebar, stats, 7-day board. |
| `src/components/anime-card.tsx` | One show in a day column: cover, episode, progress. |

## Design notes worth knowing

- **Weekday is derived from a past airing, in your timezone.** AniList gives
  each episode's `airingAt` UNIX timestamp. `deriveAiring()` takes the most
  recent *aired* episode and reads its weekday — so a show lands on the day it
  actually drops for the viewer, not a fixed broadcast-country day. New shows
  with nothing aired yet fall back to their next episode.

- **The season is always current.** `currentSeason()` maps today's date to
  WINTER/SPRING/SUMMER/FALL, so the dashboard follows the calendar with no code
  changes each season.

- **Fetched on the server, refreshed hourly.** `page.tsx` sets
  `revalidate = 3600`; the page is statically generated and regenerated each
  hour, keeping requests well within AniList's rate limits and off the client.

- **Why time-based UI waits for the client.** `useNow()` returns `null` on the
  server and through hydration. The dashboard gates all weekday/countdown markup
  on it, so the first client paint matches the server exactly (you briefly see a
  skeleton), then real data fills in — no hydration mismatch, correct local time.
