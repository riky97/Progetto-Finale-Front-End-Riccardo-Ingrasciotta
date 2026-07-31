# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Anime List — a React SPA that browses anime data from the [Jikan API](https://jikan.moe/) (unofficial MyAnimeList REST API). Users can browse top anime (TV/movie), upcoming seasonals, today's airing schedule, genres, anime detail pages, and free-text search.

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
  - [client.ts](src/api/client.ts) — the single axios instance (`baseURL` `https://api.jikan.moe/v4`, overridable with `VITE_JIKAN_BASE_URL`). Exposes `apiGet`, normalises failures into `ApiError`, and retries 429/5xx with exponential backoff, honouring `Retry-After`.
  - [requestQueue.ts](src/api/requestQueue.ts) — paces every outbound request to ~2.5 req/s and 55 req/min, keeping the app inside Jikan's public rate limits. **All network calls must go through `apiGet`** so the queue can't be bypassed; calling axios directly from a component reintroduces the 429 storms this was written to fix.
  - [anime.ts](src/api/anime.ts) — one function per endpoint. These use v4's query-parameter form (`/top/anime?type=tv&page=1`, `/anime?q=…`, `/anime?genres=…`, `/schedules?filter=<day>`, `/anime/{id}/full`, `/genres/anime`). Do not reintroduce v3-style path segments like `/top/anime/1/tv` or `/genre/anime/{id}/{page}` — those return nothing on v4 and were the original cause of the app being broken.

- **Data fetching**: [useAnimeQuery](src/hooks/useAnimeQuery.ts) is the only way screens load data. It returns `{ data, loading, error, refetch }` and discards superseded responses. Render lists through [AnimeGrid](src/components/AnimeGrid.tsx), which owns the loading/error/empty states so they can't be skipped.

- **Types** (`src/types/jikan.ts`): models only the fields the UI reads. Every list endpoint returns the same `Anime` shape inside a `JikanListResponse<T>` envelope; `/anime/{id}/full` returns `AnimeFull`.

- **Routing/state**: route params and query strings are the state. Use `useParams`/`useLocation`/`useSearchParams`; [useSection](src/shared/useSection.ts) derives the active section for the header and sidebar highlight. Search (`?q=`) and browse paging (`?page=`) live in the URL so results are linkable and back/forward works. There is deliberately **no** `localStorage` route/section tracking and no `window.location.href` string-splitting — that was the previous anti-pattern and should not come back.

- **Features** (`src/features/`): `home/` (eyecatch carousel + top/upcoming rows), `browse/` (shared "view all" surface for `/topanime/:type` and `/genre/:genreId`), `genre/`, `search/`, `information/`. Cross-cutting UI lives in `src/components/`, layout chrome in `src/components/layout/`.

## Styling and design

Ant Design v4 is the component base and stays. Theming is layered deliberately:

1. `antd/dist/antd.variable.min.css` + `ConfigProvider.config()` in [src/theme/antdTheme.ts](src/theme/antdTheme.ts) — v4's CSS-variable theme API (v4 has no v5-style token system; colours are the only thing it can theme this way).
2. [src/styles/tokens.css](src/styles/tokens.css) — the design tokens (palette, `@font-face`, type scale, spacing) and base reset.
3. [src/styles/antd-overrides.css](src/styles/antd-overrides.css) — the one file allowed to override antd internals (dark surfaces, type stack). Do not add per-component antd override files; that was the old pattern.
4. [src/styles/app.css](src/styles/app.css) — the app's own components.

Design direction is the anime **eyecatch** (the title card at an ad break): ink-black ground, warm paper type, one vermilion accent used as a sheared slab, and real `title_japanese` values set vertically. Fonts are the ones vendored in `src/fonts/` — don't add webfonts.

Conventions worth keeping:
- Rank numerals appear **only** on genuinely ranked lists (top charts). Search, genre and seasonal results show a score badge instead, because position carries no meaning there.
- Responsive breakpoint logic is centralised in [useWindowDimensions](src/hooks/useWindowDimensions.ts) (`isMobile` at <= 768px) and [gridConfig](src/shared/gridConfig.ts). Don't re-derive column counts per screen.
- Keyboard focus must stay visible; antd resets outlines, so the focus rules in `app.css` intentionally use `!important`.

## Branching

- `master` — stable.
- `develop` — active work.
- `main` — left as-is (GitHub default), not part of the day-to-day flow.
