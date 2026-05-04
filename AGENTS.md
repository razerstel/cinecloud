# CineCloud — Agent Instructions

## Git workflow (MANDATORY)

**Commit after every logical unit of work. Push when the feature is complete.**

- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`
- One commit per feature or fix — not one giant commit at the end
- Push to `origin/main` after each complete feature block
- Never commit `.env`, `prisma/dev.db`, or `node_modules` — they are gitignored
- Before starting work, run `git pull` to get the latest changes

```bash
git add <specific files>
git commit -m "feat: describe what changed and why"
git push
```

## Project

**CineCloud** — private Netflix-style streaming web app.

- Video via `vidsrc-embed.ru` iframe (7 mirror domains available)
- Metadata from TMDB API (token v4, read-only)
- Auth: login + register, JWT sessions
- DB: SQLite via Prisma (file at `prisma/dev.db`, gitignored)

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript strict |
| UI | Tailwind CSS v4 |
| Database | Prisma + SQLite |
| Auth | Auth.js v5 beta (`next-auth@beta`) with Credentials |
| Passwords | bcryptjs (cost 12) |
| Validation | Zod |
| TMDB client | `src/lib/tmdb.ts` (server-only) |

## Critical Next.js 16 differences

This is Next.js **16**, not 14 or 15. Breaking changes:

- `params` and `searchParams` in pages/layouts are **`Promise<...>`** — always `await` them
- Middleware is deprecated → use `src/proxy.ts` with `export function proxy(req)` and `export const config`
- `cookies()`, `headers()` are async — `await cookies()`
- Fetch is **not cached by default** — use `next: { revalidate: N }` explicitly
- Route protection file is `src/proxy.ts`, not `src/middleware.ts`

Before writing any Next.js code, read the relevant doc in `node_modules/next/dist/docs/01-app/`.

## File structure

```
src/
├── app/
│   ├── (app)/                    # Protected routes (auth required)
│   │   ├── layout.tsx            # Wraps all protected pages with Navbar
│   │   ├── page.tsx              # Home: Hero + category rows + Continue Watching
│   │   ├── loading.tsx           # Skeleton for home
│   │   ├── movie/[id]/page.tsx   # Movie detail: backdrop hero, overview, recs
│   │   ├── tv/[id]/page.tsx      # TV detail: seasons, episode list, recs
│   │   ├── watch/[type]/[id]/page.tsx  # Player page + EpisodeRow below
│   │   ├── search/page.tsx       # Multi-search results grid
│   │   └── my-list/page.tsx      # User's saved titles
│   ├── (auth)/
│   │   ├── login/                # Login form (client: login-form.tsx)
│   │   └── register/             # Register form (client: register-form.tsx)
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── register/route.ts
│       ├── progress/route.ts     # POST upsert / GET recent (WatchProgress)
│       └── watchlist/route.ts    # POST add / DELETE remove / GET list
├── components/
│   ├── Navbar.tsx               # Server component (reads auth session)
│   ├── NavLinks.tsx             # CLIENT — active pill nav links
│   ├── SearchInput.tsx          # CLIENT — collapsible search bar
│   ├── Hero.tsx                 # Backdrop hero with title + CTAs
│   ├── Row.tsx                  # Horizontal scroll row of Cards
│   ├── Card.tsx                 # CLIENT — landscape card with +/✓ watchlist toggle
│   ├── Player.tsx               # CLIENT — iframe + heartbeat progress + mirror switcher
│   ├── EpisodeRow.tsx           # CLIENT — horizontal episode strip below player
│   ├── WatchlistButton.tsx      # CLIENT — +/✓ toggle for detail pages
│   └── ContinueWatchingRow.tsx  # Server — fetches recent progress, renders Row
├── lib/
│   ├── auth.ts                  # Auth.js v5 full config (server-only via Prisma)
│   ├── auth.config.ts           # Edge-safe config (no DB imports) used by proxy.ts
│   ├── db.ts                    # Prisma client singleton (server-only)
│   ├── tmdb.ts                  # TMDB fetch helpers — server-only, re-exports tmdb-shared
│   ├── tmdb-shared.ts           # Types + pure helpers (tmdbImg, tmdbTitle, tmdbYear) — client-safe
│   ├── vidsrc.ts                # vidsrcEmbedUrl() + VIDSRC_BASES array
│   └── user-data.ts             # getWatchlistKeys() — server-only
└── proxy.ts                     # Route protection (Next 16 convention)
```

## Server vs client boundary

**Server-only** (never import in a `"use client"` file):
- `src/lib/auth.ts`, `src/lib/db.ts`, `src/lib/tmdb.ts`, `src/lib/user-data.ts`
- Any file that calls `prisma`, `auth()`, or TMDB API fetches

**Client-safe** (can import anywhere):
- `src/lib/tmdb-shared.ts` — types + pure string helpers only
- `src/lib/vidsrc.ts` — pure URL builder, no secrets

**Client components** (`"use client"` at top):
- `Card`, `Player`, `EpisodeRow`, `NavLinks`, `SearchInput`, `WatchlistButton`
- Login/register forms (`login-form.tsx`, `register-form.tsx`)

## Database schema (Prisma + SQLite)

```prisma
model User          { id, email (unique), passwordHash, name?, createdAt }
model WatchProgress { id, userId, mediaType, tmdbId, season(0=N/A), episode(0=N/A),
                      positionPct, durationSec?, updatedAt
                      @@unique([userId, mediaType, tmdbId, season, episode]) }
model WatchlistItem { id, userId, mediaType, tmdbId, addedAt
                      @@unique([userId, mediaType, tmdbId]) }
```

`season` and `episode` are `Int @default(0)` — **not nullable**. Use `0` as sentinel for movies.

After any schema change: `npx prisma migrate dev --name <description>`

## Environment variables

Never hardcode secrets. All vars live in `.env` (gitignored). See `.env.example` for the full list:

```
DATABASE_URL      → "file:./dev.db" (relative to prisma/schema.prisma)
AUTH_SECRET       → random string (openssl rand -base64 32)
AUTH_URL          → http://localhost:3000 (or public URL in prod)
TMDB_API_KEY      → v4 Bearer token from themoviedb.org
VIDSRC_BASE_URL   → https://vidsrc-embed.ru (or any of the 7 mirrors)
```

## Local development

```bash
cp .env.example .env      # fill AUTH_SECRET and TMDB_API_KEY
npm install
npx prisma migrate dev --name init
npm run dev               # http://localhost:3000
```

Build check before committing: `npm run build && npm run lint`

## Key behaviors to preserve

- **Auth**: proxy.ts redirects unauthenticated users to `/login?callbackUrl=<path>`
- **TMDB cache**: all fetches use `next: { revalidate: 3600 }` (1h ISR)
- **Progress tracking**: heartbeat every 30s in Player.tsx via `/api/progress`; `positionPct` estimated by elapsed time since season/episode doesn't expose `currentTime` cross-origin
- **Watchlist state**: pages fetch `getWatchlistKeys()` once and pass a `Set<string>` down to `Row` → `Card` to initialize `inWatchlist` without N DB queries
- **Mirror switching**: `Player.tsx` reads/writes `cinecloud:vidsrc-base` in localStorage via `useSyncExternalStore`; switching reloads iframe with new base
