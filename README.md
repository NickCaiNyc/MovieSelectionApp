# Smarter Movie Seating (V1)

A modern, type-safe foundation for exploring movie showtimes and comparing the best available seats across nearby theaters. The
project is built as a single Next.js 15 application that bundles the frontend, backend, and database access layers together for a
smooth Vercel deployment story.

## Tech stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Styling**: Tailwind CSS and shadcn/ui primitives
- **Data fetching**: TanStack Query + tRPC
- **Database**: Supabase (Postgres) managed via Prisma ORM
- **Language**: TypeScript end-to-end

## Getting started

```bash
pnpm install
pnpm dlx prisma generate
pnpm run dev
```

### Environment variables

Copy the sample configuration and update it with your Supabase project credentials and TMDB token:

```bash
cp .env.example .env.local
```

Required variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `TMDB_API_KEY` (optional – mock data is returned if unset)

### Database

This project uses Prisma migrations. Initialize your Supabase (or local Postgres) database with:

```bash
pnpm dlx prisma migrate dev
```

For deployment on Vercel, run `prisma migrate deploy` and ensure the environment variables are configured in the project settings.

## Project structure

```
app/               # Next.js App Router routes
components/        # Shared UI components and feature widgets
lib/               # Utility helpers and TRPC client
server/            # tRPC routers, Prisma client, Supabase helpers
prisma/            # Prisma schema and migrations
```

Key frontend routes include:

- `/movies` – browse movies and open the seating compare workflow
- `/movie/[id]` – detailed movie page with a CTA to find seats
- `/compare/[movieId]` – side-by-side seat block comparison across theaters

## Mock data & TODOs

- The tRPC routers return mock movie, showtime, and seat-map data when external services are not configured.
- `PreferenceModal` persists preferences in Supabase once auth is connected; currently it stores records using the hard-coded
  `demo-user` identifier.
- Extend `server/routers/showtimes.ts` with real Supabase queries or third-party data sources for richer showtime coverage.
- Add more sample seat maps under `mockSeatMaps` in `server/routers/seats.ts` to experiment with the comparison UI.
