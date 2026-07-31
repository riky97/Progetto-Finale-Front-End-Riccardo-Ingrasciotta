# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Anime List — a React SPA that browses anime data from the [Jikan API](https://jikan.moe/) (unofficial MyAnimeList REST API). Users can browse top anime (TV/movie), upcoming seasonals, today's airing schedule, genres, anime detail pages, and free-text search.

Stack: **Vite + TypeScript + React 17 + Tailwind CSS v4 + shadcn/ui (Radix) + react-router-dom v6 + axios.**

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

- **Entry**: [src/main.tsx](src/main.tsx) mounts the app and is where `<BrowserRouter>` and shadcn's `<TooltipProvider>` wrap everything. [src/App.tsx](src/App.tsx) is the layout shell (spine, sheet header, footer) plus the route table.

- **API layer** (`src/api/`):
  - [client.ts](src/api/client.ts) — the single axios instance (`baseURL` `https://api.jikan.moe/v4`, overridable with `VITE_JIKAN_BASE_URL`). Exposes `apiGet`, normalises failures into `ApiError`, and retries 429/5xx with exponential backoff, honouring `Retry-After`.
  - [requestQueue.ts](src/api/requestQueue.ts) — paces every outbound request to ~2.5 req/s and 55 req/min, keeping the app inside Jikan's public rate limits. **All network calls must go through `apiGet`** so the queue can't be bypassed; calling axios directly from a component reintroduces the 429 storms this was written to fix.
  - [anime.ts](src/api/anime.ts) — one function per endpoint. These use v4's query-parameter form (`/top/anime?type=tv&page=1`, `/anime?q=…`, `/anime?genres=…`, `/schedules?filter=<day>`, `/anime/{id}/full`, `/genres/anime`). Do not reintroduce v3-style path segments like `/top/anime/1/tv` or `/genre/anime/{id}/{page}` — those return nothing on v4 and were the original cause of the app being broken.

- **Data fetching**: [useAnimeQuery](src/hooks/useAnimeQuery.ts) is the only way screens load data. It returns `{ data, loading, error, refetch }` and discards superseded responses. Render lists through [AnimeGrid](src/components/AnimeGrid.tsx), which owns the loading/error/empty states so they can't be skipped.

- **Types** (`src/types/jikan.ts`): models only the fields the UI reads. Every list endpoint returns the same `Anime` shape inside a `JikanListResponse<T>` envelope; `/anime/{id}/full` returns `AnimeFull`.

- **Routing/state**: route params and query strings are the state. Use `useParams`/`useLocation`/`useSearchParams`; [useSection](src/shared/useSection.ts) derives the active section for the header and sidebar highlight. Search (`?q=`) and browse paging (`?page=`) live in the URL so results are linkable and back/forward works. There is deliberately **no** `localStorage` route/section tracking and no `window.location.href` string-splitting — that was the previous anti-pattern and should not come back.

- **Features** (`src/features/`): `home/` (`OnAirHero` + top/upcoming rows), `browse/` (shared "view all" surface for `/topanime/:type` and `/genre/:genreId`), `genre/`, `search/`, `information/`. Cross-cutting UI lives in `src/components/`, layout chrome in `src/components/layout/`, unmodified shadcn primitives in `src/components/ui/`.

- **Paging** is server-side and URL-driven on every paged surface (browse *and* search) via [SheetPagination](src/components/SheetPagination.tsx). Its controls are real `<a href="?page=N">` links with the click intercepted, so middle-click and "open in new tab" still work. `AnimeGrid` deliberately does **not** paginate — Jikan sometimes repeats an entry inside one page, so the grid dedupes by `mal_id` before rendering.

## Styling and design

Tailwind CSS v4 via the `@tailwindcss/vite` plugin. **There is no `tailwind.config.js`** — v4 does not need one, and everything lives in [src/styles/index.css](src/styles/index.css), which is the single stylesheet the app imports.

That one file is ordered deliberately:

1. `@import "tailwindcss"`, `tw-animate-css`, `shadcn/tailwind.css` (the last supplies the custom variants shadcn's primitives rely on — `shadcn` is a devDependency for exactly this reason).
2. `@custom-variant dark (&:is(.dark *))` — shadcn's primitives ship `dark:` classes. Binding the variant to a `.dark` ancestor the app never renders keeps them inert instead of firing off the visitor's OS colour-scheme preference. **Don't delete this**; without it the design half-inverts on dark-mode machines.
3. `@font-face` for the faces vendored in `src/fonts/`. Don't add webfonts.
4. `@theme` — the palette, type roles, and layout constants, as real Tailwind tokens (so `bg-paper`, `text-blue-ink`, `font-display` are generated utilities).
5. `:root` — shadcn's semantic aliases (`--primary`, `--muted`, `--ring`, …) pointed at the palette, followed by an `@theme inline` block that maps them back to `--color-*`. **Both halves are required.** The `:root` block alone does not generate `bg-primary` / `border-border` / `ring-ring`, and the shadcn primitives then render unstyled — this was an actual bug during the rebuild.
6. `@layer base` — reset, type defaults, focus rules.
7. `@layer components` — the four bespoke classes below.

### Design direction: "The Cut Sheet"

Anime is made on punched paper. Before a frame is broadcast it is a numbered row on a timing sheet, printed in two cheap inks on pale stock, with artwork mounted in a camera aperture against registration marks. This app is a list of anime, and the industry's own list artifact is the cut sheet — so that is what the UI is. (It replaced an ink-black/vermilion "eyecatch" direction, which was a generic dark-dashboard look wearing a theme.)

| token | value | role |
| --- | --- | --- |
| `paper` / `paper-2` / `paper-3` | `#e9e9e0` / `#dfdfd4` / `#d2d2c5` | drawing-stock grounds |
| `ink` / `ink-2` | `#16181b` / `#23262a` | type, spine, apertures |
| `blue` / `blue-ink` / `blue-pale` | `#0f62b0` / `#0a4a87` / `#b7cee2` | **all** structure: rules, labels, counts, focus |
| `pink` / `pink-deep` | `#ff3d8e` / `#c4155e` | the one hot ink |
| `graphite` | `#5c6066` | secondary metadata |

Type roles, all vendored: `font-display` CHANEY-Extended (title cards, page `h1`, big numerals — used sparingly), `font-heading` SofiaPro-Bold, `font-sans` Mark, `font-mono` Relative-Medium (the utility face carrying every annotation and figure), `font-longform` Plain-Light (synopsis prose only).

Rules that keep it coherent:

- **`pink` is a fill, never small text.** At 2.5:1 on paper it fails contrast for body copy. Use it as a background with `ink` on top, or for large display numerals. `pink-deep` is the text-safe variant.
- **`blue` carries all structure.** If a rule, label, count or annotation needs colour, it is blue — not pink.
- **Radius is 0 everywhere** (`--radius: 0px`, and every `--radius-*` step resolves to it). The sheet is drawn, not rounded. The only circles are the spine's peg holes.

### The bespoke classes

Four classes in `@layer components` do what utilities can't:

- `.aperture` — **the signature element.** A dark frame with registration ticks on the leading and trailing corners (two, not four, so it stays a mark and not a border). The ticks carry their own `drop-shadow` so they read over loud poster art. Pair with `.aperture-hover` on an ancestor to open the ticks outward on hover/focus.
- `.punch-strip` — the peg holes down the spine's edge.
- `.ruled` — printed timing-sheet rows, used behind the error/empty panels.
- `.annotation` — the small tracked-out blue label used for every field name and count.
- `.vertical-jp` — real `title_japanese` set vertically. Uses `text-orientation: mixed`, not `upright`: many values are part kanji and part romaji, and vertical Japanese rotates the latin run rather than stacking it letter by letter. Only ever fed API data — decorative kana was cut on purpose.

### shadcn/ui

Primitives live in `src/components/ui/` and are added with `npx shadcn@latest add <name>` (config in `components.json`, style `radix-nova`). Only what's used is installed: button, badge, card, input, pagination, separator, skeleton, tooltip. They are otherwise **unmodified upstream source** except for one documented change in `button.tsx` and `badge.tsx` — `as React.ElementType` on the `asChild` branch, because React 17's `@types/react` still admits string refs via `LegacyRef`, which Radix `Slot`'s `Ref<HTMLElement>` rejects.

Radix works on React 17 (`radix-ui@1.6.7` still lists it as a peer), so nothing here requires a React upgrade. Vitest needs the `react/jsx-runtime` alias and the `radix-ui` inline-deps entry in [vite.config.ts](vite.config.ts) — React 17 predates the `exports` map, so Vitest's Node resolver can't find the bare specifier Radix imports.

### Conventions worth keeping

- **Numerals mean the data is ordered.** Rank numerals appear only on genuinely ranked lists (the top charts), and show the API's own `rank`, not the array index — so they stay correct across pages and read non-sequentially (49, 56, 99…). Search, genre and seasonal results get a score badge instead. The sidebar is deliberately unnumbered: the sections are a set, not a sequence.
- Responsive breakpoint logic is centralised in [useWindowDimensions](src/hooks/useWindowDimensions.ts) (`isMobile` at <= 768px) and [gridConfig](src/shared/gridConfig.ts). `CARD_GRID_CLASS` and `columnsForWidth` describe the same ladder at Tailwind's default breakpoints and **must be changed together** — the grid uses the CSS one to lay out and the JS one to fill whole rows.
- Keyboard focus must stay visible. The base rule is a 3px `blue` outline; anything sitting on an ink ground adds `.focus-on-ink` for a paper-coloured ring. Note that shadcn primitives set `outline-style: none` in their base classes, so overriding their focus outline needs `outline-solid` as well as a width.
- Any animation must respect `prefers-reduced-motion` — the global media query handles CSS, and `OnAirHero` additionally checks `matchMedia` before it will auto-rotate.

## Branching

- `master` — stable.
- `develop` — active work.
- `main` — left as-is (GitHub default), not part of the day-to-day flow.
