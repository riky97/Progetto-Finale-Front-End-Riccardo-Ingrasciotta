# Anime List — backend

Node + TypeScript + Express 5 + Prisma 7 + PostgreSQL. Auth is **Clerk**: this
service never handles passwords or sessions itself, it only verifies the
Clerk-issued JWT on each request.

There is deliberately **no `User` table**. Clerk is the source of truth for
identity; `Favorite` and `Watched` rows are keyed by the Clerk user id string.
`animeId` is an **AniList media id** (matching the frontend's data layer), never
a MyAnimeList `mal_id`.

This is a separate Node project from the Vite app at the repo root — its own
`package.json`, its own `node_modules`, its own `tsconfig.json`.

## Run it locally

From the repo root:

```sh
docker compose up -d            # Postgres 16 on localhost:5432
cp server/.env.example server/.env
# edit server/.env and paste your Clerk keys (see below)

cd server
npm install                     # postinstall runs `prisma generate`
npx prisma migrate dev          # creates the tables
npm run dev                     # http://localhost:8080
```

`docker compose down -v` wipes the database volume if you want a clean slate.

### Clerk keys

From <https://dashboard.clerk.com> → **API keys**:

- **Secret key** (`sk_test_…`) → `CLERK_SECRET_KEY`
- **Publishable key** (`pk_test_…`) → `CLERK_PUBLISHABLE_KEY`

Both are required. The publishable key is not secret, but `@clerk/express`
derives the Frontend API origin from it and throws *"Publishable key is
missing"* on every request without it.

Optionally paste the **JWT public key** (PEM) into `CLERK_JWT_KEY` to make token
verification fully networkless — no JWKS fetch on cold start.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | `tsx watch src/index.ts` |
| `npm run build` | `prisma generate && tsc` → `dist/` |
| `npm start` | runs the build (`node dist/index.js`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run migrate:dev` / `migrate:deploy` | Prisma migrations |
| `npm run smoke` | full auth + CRUD smoke test against local Postgres |
| `npm run token [userId]` | mint a dev session token for curl |

## API

All `/api/*` routes require `Authorization: Bearer <clerk session token>` and
404/401 otherwise. Every error responds as
`{ "error": { "code": "…", "message": "…" } }`.

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/health` | — | `200 { status, uptime }` — no auth, host healthcheck |
| `GET` | `/api/favorites` | — | `200 { animeIds: number[] }`, newest first |
| `POST` | `/api/favorites` | `{ animeId: number }` | `200 { animeId, createdAt }` |
| `DELETE` | `/api/favorites/:animeId` | — | `204` |
| `GET` `POST` `DELETE` | `/api/watched…` | same as favorites | same as favorites |

Behaviour decisions:

- **`POST` is idempotent.** It upserts against the `(clerkUserId, animeId)`
  unique constraint, so adding an existing favourite returns `200` with the
  original `createdAt` rather than a `409`.
- **`DELETE` on a row that isn't there returns `204`, not `404`.** The client
  action is "make sure this is not in my list"; the end state is the same either
  way, and a `404` would make an un-favourite button fail after a double click
  or a stale render. A *malformed* id (`/api/favorites/abc`) is still a `400`.
- **Validation errors are `400`** with the offending field named. `animeId` must
  be a positive 32-bit integer.
- **Auth failures are always `401`** — missing header, malformed token, expired
  token, or a signature from the wrong key all land in the same place.
  `clerkMiddleware()` itself never rejects (an unauthenticated request just gets
  a signed-out auth state), so `requireUser` is what turns that into the 401.
  No route can silently continue unauthenticated.
- **No rate limiting.** Deliberate for v1: these endpoints hit our own Postgres,
  not a third party, so the AniList request-pacing concern in the frontend does
  not apply here. Clerk already gates every route behind a verified session.
  Add a limiter if the service is ever exposed to untrusted traffic.

## Testing auth without a live Clerk instance

`npm run smoke` boots the real app from `src/app.ts` and makes real HTTP
requests. It does **not** stub or bypass any of our code — there is no test-only
auth bypass anywhere in `src/`. Instead it:

1. generates a throwaway RSA-2048 keypair,
2. sets `CLERK_JWT_KEY` to the public key — the same production knob for
   networkless verification,
3. mints session tokens with Clerk's own `signJwt` from `@clerk/backend/jwt`,
   signed with the matching private key and carrying the real session-token
   claim shape (`iss`/`sub`/`sid`/`azp`/`iat`/`nbf`/`exp`),
4. asserts both the accept and reject paths.

So `clerkMiddleware → authenticateRequest → signature check → claim assertions →
getAuth().userId` all run unmodified; only the signing keypair is substituted.

To curl a running server the same way:

```sh
npx tsx scripts/dev-token.ts        # first run prints the .env lines to paste
# paste CLERK_SECRET_KEY / CLERK_PUBLISHABLE_KEY / CLERK_JWT_KEY into server/.env
npm run dev

TOKEN=$(npx tsx scripts/dev-token.ts user_me 2>/dev/null)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/favorites
```

`.dev-keys.json` is gitignored. These are development-only credentials — never
put them in a deployed environment.

## Deploying

**Database — Supabase (free).** Create a project at
<https://supabase.com>, then Project Settings → Database → Connection string →
**URI**, pooled/"Transaction" mode (port 6543). That's `DATABASE_URL`.

**Backend — Render (free web service).**

- New → Web Service → connect this repo. Render reads `server/render.yaml`
  (Blueprint) for the build/start commands, health check path and the plan;
  or set them manually if you create the service from the dashboard instead:
  **Root Directory** `server`, build `npm ci && npm run build`, start
  `npx prisma migrate deploy && node dist/index.js`, health check `/health`.
- Set `DATABASE_URL` (from Supabase above), `CLERK_SECRET_KEY`,
  `CLERK_PUBLISHABLE_KEY` and `CORS_ORIGIN` (the deployed frontend origin) as
  environment variables. Do not set `PORT` — Render injects it.
- Free-plan services sleep after 15 minutes of inactivity; the first request
  after that takes a few seconds to wake up. Fine for a personal project, not
  for anything latency-sensitive.

**Railway** works too (`railway.json` in this directory is still valid) but
its free tier grants only $1/month of usage credit, which a Postgres add-on
plus an always-on web service exhausts almost immediately — expect to need a
paid Hobby plan there.

## Notes on versions

- **Express 5** (not 4): current stable, and `@clerk/express` supports it.
  Route params are typed `string | string[]` in v5, hence the narrowing in
  `src/routes/collection.ts`.
- **Prisma 7.9.1**, not the `latest` dist-tag. At the time of writing npm's
  `latest` for `prisma` points at `8.0.0-rc.10`, a release candidate; 7.9.1 is
  the newest stable. Prisma 7 moved the connection URL out of
  `schema.prisma` — it now lives in `prisma.config.ts` (for the CLI) and in the
  `@prisma/adapter-pg` driver adapter (for the runtime client).
- The generated Prisma client is emitted to `server/generated/prisma`, outside
  `src/`, so the single relative import `../generated/prisma` resolves
  identically from `src/` under `tsx` and from `dist/` after `tsc`.
- `npm audit` reports a high-severity advisory in `deepmerge-ts`, pulled in by
  the `prisma` **CLI** (a devDependency). It is not in the runtime dependency
  tree of the deployed server.
