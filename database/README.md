# Database and verified data

PathPilot uses Next.js route handlers inside `app/src/app/api` as its application API. This directory holds the database and source-verified data it depends on:

- `drizzle` — generated Drizzle migrations
- `drizzle.config.ts` — database migration configuration
- `supabase` — Supabase configuration and RLS/storage migrations
- `scripts` — approved seed and import scripts
- `data` — verified, filter-ready local datasets

Run database commands from the workspace root, for example `npm run db:generate` or `npm run db:seed:official`.
