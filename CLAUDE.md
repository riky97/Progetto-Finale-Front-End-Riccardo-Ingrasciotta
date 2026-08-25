# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Anime List — a React SPA that browses anime data from the [AniList GraphQL API](https://docs.anilist.co/). Users can browse top anime (TV/movie), upcoming seasonals, today's airing schedule, genres, anime detail pages, and free-text search.

The app previously ran on the [Jikan API](https://jikan.moe/) (an unofficial MyAnimeList *scraper*), which inherited MAL's instability and 504'd on nearly every endpoint. It was migrated to AniList, which is backed by AniList's own database. **Do not migrate back to Jikan or reintroduce `mal_id`-keyed data** — that decision was made deliberately.

Stack: **Vite + TypeScript + React 17 + Ant Design v4 + react-router-dom v6 + axios.**

## Commands

```sh
npm install
npm run dev        # Vite dev server on http://localhost:3000
npm run build      # tsc --noEmit && vite build  → dist/
npm run preview    # serve the production build
npm run typecheck  # tsc --noEmit
npm test           # vitest (jsdom)
npm run test:watch
```

Node: pinned via `.nvmrc` and `engines` to Node 24 (current LTS). Vite 5 requires >= 20.19.

No lint script is configured; correctness is enforced by `tsc` in strict mode (`noUnusedLocals`/`noUnusedParameters` are on, so unused symbols fail the build).

## Architecture

- **Entry**: [src/main.tsx](src/main.tsx) mounts the app and is where `<BrowserRouter>` and antd's `<ConfigProvider>` wrap everything. [src/App.tsx](src/App.tsx) is the layout shell (antd `Layout`, sidebar, header, footer) plus the route table.

- **API layer** (`src/api/`):
  - [client.ts](src/api/client.ts) — the single axios instance pointed at `https://graphql.anilist.co` (overridable with `VITE_ANILIST_URL`). AniList is **one endpoint**: every call is a `POST` of `{ query, variables }`, there are no REST paths. Exposes `gqlRequest(query, variables)`, which unwraps the `{ data, errors }` envelope, normalises failures into `ApiError`, and retries 429/5xx with exponential backoff honouring `Retry-After`. Note AniList can return HTTP 200 *with* an `errors` array — that is never retried.
  - [requestQueue.ts](src/api/requestQueue.ts) — paces outbound requests. AniList *documents* 90 req/min but the live API has long served a degraded **30 req/min** (check `X-RateLimit-Limit` on any response before changing this); the queue caps at 28/min with only a 120 ms minimum gap, since AniList enforces no per-second ceiling. **All network calls must go through `gqlRequest`** so the queue can't be bypassed.
  - [anime.ts](src/api/anime.ts) — one function per screen-level query, plus all normalisation. Current mapping:
    | Function | AniList query |
    | --- | --- |
    | `getTopAnime(type, …)` | `Page.media(type: ANIME, format: …, sort: SCORE_DESC)` |
    | `getUpcomingAnime(…)` | `Page.media(status: NOT_YET_RELEASED, sort: POPULARITY_DESC)` |
    | `getScheduleForDay(day, …)` | `Page.airingSchedules(airingAt_greater/lesser: …)` |
    | `searchAnime(q, …)` | `Page.media(search: $q, sort: SEARCH_MATCH)` |
    | `getAnimeByGenre(name, …)` | `Page.media(genre: $genre, sort: POPULARITY_DESC)` |
    | `getAnimeById(id)` | `Media(id: $id, type: ANIME)` |
    | `getAnimeByIds(ids)` | `Page.media(id_in: $ids)`, chunked at 50 |
    | `getAnimeGenres()` | `GenreCollection` |

- **Schema differences that will bite you** (these are why the migration was non-trivial):
  - **Genres are strings, not ids.** `GenreCollection` returns a bare `[String]` — there is no numeric genre id and no per-genre title count (Jikan's `count` was dropped rather than faked; deriving it would take one query per genre). The `/genre/:genreId` route therefore carries a **URL-encoded genre name**, e.g. `/genre/Slice%20of%20Life`. Build links with `encodeURIComponent(name)`; `useParams` hands back the decoded name.
  - **Scores are 0-100 integers**, not Jikan's 0-10 float. Always render via `scoreOutOfTen()` from `src/api/anime.ts` — never print `averageScore` raw.
  - **There is no global `rank` field.** The top charts *are* a `SCORE_DESC` page, so the rank numeral is **positional** — `AnimeGrid` takes a `rankStart` prop so page 2 continues at 25 instead of restarting at 1. On the detail page, "Rank" comes from `Media.rankings` filtered to `type: RATED, allTime: true` (which is scoped to the title's own format).
  - **Descriptions contain inline HTML** (`<br>`, `<i>`, entities). `stripHtml()` reduces them to plain text with paragraph breaks preserved; `.prose` already sets `white-space: pre-line`. Never `dangerouslySetInnerHTML` this.
  - **There is no weekday filter.** `weekdayWindow()` converts a `ScheduleDay` into a local midnight-to-midnight unix range for the nearest upcoming occurrence of that weekday. `airingSchedules` returns **one row per episode**, so results are deduped by media id (a batch-released season would otherwise repeat) and re-sorted by popularity, because raw time order is dominated by long-running ONAs.
  - **`pageInfo.total` is capped at 5000** for broad queries. Treat `>= 5000` as "lots" and don't print it as a count — `BrowsePage` suppresses the figure at the cap. Narrow queries (e.g. search) return a real total.
  - **`perPage` maxes out at 50**; asking for more is a validation error. `clampPerPage` enforces this.
  - AniList has no equivalent of Jikan's `background` field, so that detail-page block is gone. Adult titles are excluded via `isAdult: false` on every list query (and client-side for `airingSchedules`, which has no such argument); "Hentai" is likewise dropped from the genre list so it can't link to a guaranteed-empty page.

- **Data fetching**: [useAnimeQuery](src/hooks/useAnimeQuery.ts) is the only way screens load data. It returns `{ data, loading, error, refetch }` and discards superseded responses. Render lists through [AnimeGrid](src/components/AnimeGrid.tsx), which owns the loading/error/empty states so they can't be skipped.

- **Types** (`src/types/anilist.ts`): two layers on purpose. `AniListMedia` & friends mirror the raw schema and stay inside `src/api/`; the flat `Anime` / `AnimeFull` view model is what every component renders. `src/api/anime.ts` maps one to the other, so the nested shape, score scale and HTML descriptions are normalised in exactly one place. List queries return `PagedResponse<Anime>` (`{ data, pageInfo }`).

- **Routing/state**: route params and query strings are the state. Use `useParams`/`useLocation`/`useSearchParams`; [useSection](src/shared/useSection.ts) derives the active section for the header and sidebar highlight. Search (`?q=`) and browse paging (`?page=`) live in the URL so results are linkable and back/forward works. There is deliberately **no** `localStorage` route/section tracking and no `window.location.href` string-splitting — that was the previous anti-pattern and should not come back.

- **Features** (`src/features/`): `home/` (eyecatch carousel + top/upcoming rows), `browse/` (shared "view all" surface for `/topanime/:type` and `/genre/:genreId`), `genre/`, `search/`, `information/`, `library/` (shared surface for `/favorites` and `/watched`), `auth/` (Clerk's routed sign-in/sign-up). Cross-cutting UI lives in `src/components/`, layout chrome in `src/components/layout/`.

## Backend (`server/`)

A separate Node project in the same monorepo — its own `package.json`/`node_modules`, not merged into the root Vite app. Owns user accounts, favorites and watched lists; the frontend above still talks to AniList directly for anime data.

- **Stack**: Express 5 + TypeScript + Prisma 7 (driver adapter `@prisma/adapter-pg`, connection URL lives in `server/prisma.config.ts`, not `schema.prisma`) + PostgreSQL. Generated Prisma client lives in `server/generated/`, not under `src/`, so `tsc`'s output copies cleanly.
- **Auth**: Clerk (`@clerk/express`), not our own — there is deliberately **no `User` table**. `Favorite`/`Watched` rows are keyed directly by the Clerk user id (a string) from the verified session token. `clerkMiddleware()` + a thin `requireUser` (in `src/middleware/auth.ts`) 401s unauthenticated requests; `clerkMiddleware` alone never rejects on its own.
- **Endpoints**: `GET/POST /api/favorites`, `DELETE /api/favorites/:animeId`, same shape for `/api/watched`. All require auth. Adding an existing favorite is idempotent (upsert, no 409); deleting a missing one returns 204, not 404. `GET /health` is unauthenticated, for Railway's healthcheck.
- **Local dev**: `docker compose up -d` (root `docker-compose.yml`, Postgres 16) → `cp server/.env.example server/.env` and fill in real Clerk keys → `cd server && npm install && npx prisma migrate dev && npm run dev` (port 8080). `npm run smoke` in `server/` exercises the real Clerk verification path (signature + claims) against a throwaway RSA keypair set as `CLERK_JWT_KEY` — see `server/scripts/auth-smoke.ts` before assuming the auth path needs a live Clerk session to test.
- **Deploy**: Railway, Root Directory = `server`; `server/railway.json` sets build/start/pre-deploy (`prisma migrate deploy`) and the healthcheck path.

## Auth and the user's library (frontend half)

Environment: copy `.env.example` → `.env.local` (gitignored). `VITE_CLERK_PUBLISHABLE_KEY` is required — `main.tsx` throws without it — and `VITE_API_URL` points at the backend above.

- **Clerk is `@clerk/clerk-react@4`, not 5.** v5 peers on React 18; this app is React 17. Don't "upgrade" it without moving React first. `@clerk/nextjs` is for a different framework and does not apply here.
- **Provider nesting** in [main.tsx](src/main.tsx), outermost first: `ClerkProvider` → `ConfigProvider` → `BrowserRouter` → `LibraryProvider`. `LibraryProvider` calls `useAuth()`, so it must sit inside Clerk; it is inside the router so nothing above it needs re-mounting on navigation.
- **Two API clients, deliberately.** [libraryClient.ts](src/api/libraryClient.ts) is our own REST backend: per-user, Bearer-authenticated, no rate-limit queue. [client.ts](src/api/client.ts) is AniList: anonymous, GraphQL, queued at 28 req/min. Never merge them — that would either push our traffic through AniList's queue or send a Clerk token to AniList. Both throw the same `ApiError`, so `ErrorState`/`AnimeGrid` render failures from either identically.
- **The token is fetched per request.** Clerk session tokens are short-lived, so `LibraryProvider` registers `getToken` with `setLibraryTokenGetter` and an axios interceptor calls it on every request. Caching one in a module variable will start 401ing after about a minute.
- **[useLibrary.tsx](src/hooks/useLibrary.tsx) is a provider, not a per-component query.** Every card in a 24-card grid asks "am I favorited?"; fetching per card would be dozens of requests. Two `GET`s run once per session and the answer lives in context. Mutations are optimistic with rollback — safe because both backend endpoints are idempotent. Consume it via `useFavorites()` / `useWatched()`, which return a no-op `SIGNED_OUT` state when there is no session, so components never have to branch on auth just to read it.
- **`getAnimeByIds`** is the only new AniList query: `Page.media(id_in:)`, batched 50 at a time through the same `gqlRequest`/queue as everything else. `/favorites` and `/watched` use it — never loop `getAnimeById`. AniList ignores the order of `id_in`, so results are re-sorted to the order the backend returned (newest saved first). Unlike the other list queries it does **not** pass `isAdult: false`: a saved id must always resolve, or a title would silently vanish from the user's own list.
- **Routing/gating decisions**: sign-in and sign-up are routes (`/sign-in/*`, `/sign-up/*`, splat because Clerk owns its own sub-steps), not modals — the URL is the state everywhere else in this app. `/favorites` and `/watched` render an explicit signed-out state rather than redirecting, and carry `?redirect_url=` into sign-in so the user lands back where they were. The favourite toggle is **hidden** on cards when signed out (24 dead controls is worse than none) but the detail page shows a one-line prompt instead, because that's the page people arrive at from a shared link.
- **Theming Clerk**: [src/theme/clerkAppearance.ts](src/theme/clerkAppearance.ts) passes one `appearance` object on `ClerkProvider`. Clerk's `variables` never see the page's CSS custom properties, so the palette is duplicated there as literals — keep it in sync with `tokens.css`, which remains the source of truth. Clerk's "Secured by Clerk" badge has no appearance key (internal hashed class only) and is left as-is.

## Styling and design

Ant Design v4 is the component base and stays. Theming is layered deliberately:

1. `antd/dist/antd.variable.min.css` + `ConfigProvider.config()` in [src/theme/antdTheme.ts](src/theme/antdTheme.ts) — v4's CSS-variable theme API (v4 has no v5-style token system; colours are the only thing it can theme this way).
2. [src/styles/tokens.css](src/styles/tokens.css) — the design tokens (palette, `@font-face`, type scale, spacing) and base reset.
3. [src/styles/antd-overrides.css](src/styles/antd-overrides.css) — the one file allowed to override antd internals (dark surfaces, type stack). Do not add per-component antd override files; that was the old pattern.
4. [src/styles/app.css](src/styles/app.css) — the app's own components.

Design direction is the anime **eyecatch** (the title card at an ad break): ink-black ground, warm paper type, one vermilion accent used as a sheared slab, and real Japanese titles (`Media.title.native`) set vertically. Fonts are the ones vendored in `src/fonts/` — don't add webfonts.

Conventions worth keeping:
- Rank numerals appear **only** on genuinely ranked lists (top charts), where they are positional and offset by `rankStart`. Search, genre and seasonal results show a score badge instead, because position carries no meaning there.
- Responsive breakpoint logic is centralised in [useWindowDimensions](src/hooks/useWindowDimensions.ts) (`isMobile` at <= 768px) and [gridConfig](src/shared/gridConfig.ts). Don't re-derive column counts per screen.
- Keyboard focus must stay visible; antd resets outlines, so the focus rules in `app.css` intentionally use `!important`.

## Branching

- `master` — stable.
- `develop` — active work.
- `main` — left as-is (GitHub default), not part of the day-to-day flow.
