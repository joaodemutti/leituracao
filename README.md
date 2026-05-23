# Leituracao

React + Vite frontend backed by Supabase.

## Requirements

- Node.js 18+
- npm
- Docker Desktop, if running Supabase locally
- Supabase CLI, if running Supabase locally

## Setup

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .example .env.local
```

The app expects these variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not commit `.env.local` or real Supabase keys.

## Option A: Run With Local Supabase

This is the best option for development because the repository already includes Supabase migrations in `supabase/migrations`.

Start Docker Desktop, then run:

```bash
supabase start
```

The command prints local project values. Copy the local API URL and anon key into `.env.local`:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key from supabase start>
```

Then start the frontend on port `3000`, which matches `supabase/config.toml` auth redirect settings:

```bash
npm run dev -- --port 3000
```

Open:

```text
http://localhost:3000
```

Useful local Supabase URLs:

```text
API: http://127.0.0.1:54321
Studio: http://127.0.0.1:54323
Inbucket: http://127.0.0.1:54324
```

To reset the local database and rerun migrations:

```bash
supabase db reset
```

Note: `supabase/config.toml` references `./seed.sql`, but this repository currently does not include `supabase/seed.sql`. The migrations still contain the schema and catalog setup.

## Option B: Run With A Hosted Supabase Project

Use this when you only need to run the app against an existing Supabase project.

Add the hosted values to `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Make sure the hosted database has the migrations applied. If it does not, push them with the Supabase CLI after linking the project:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

Then run:

```bash
npm run dev -- --port 3000
```

## Which Is Easier?

For ongoing development, run Supabase locally. It keeps the database, auth, storage, and migrations reproducible without depending on shared credentials.

For a quick demo or if the database already exists online, passing the `.env` values is faster. Share only the required values privately and never commit them to the repo.

## Scripts

```bash
npm run dev       # start Vite dev server
npm run build     # build production assets
npm run preview   # preview production build
npm run lint      # run ESLint
```
