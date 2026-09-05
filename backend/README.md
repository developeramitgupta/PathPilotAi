# Backend and data

PathPilot currently uses Next.js route handlers inside `frontend/src/app/api` as its application API. This directory holds the systems those routes depend on:

- `drizzle` — generated Drizzle migrations
- `drizzle.config.ts` — database migration configuration
- `supabase` — Supabase configuration and RLS/storage migrations
- `scripts` — approved seed and import scripts
- `data` — verified, filter-ready local datasets

Run database commands from the workspace root, for example `npm run db:generate` or `npm run db:seed:official`.
