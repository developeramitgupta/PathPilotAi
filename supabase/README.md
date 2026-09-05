# Supabase setup

PathPilot uses Clerk as a Supabase Third-Party Auth provider. Do not use the deprecated Clerk JWT-template integration.

1. Activate the Supabase integration in Clerk and copy the Clerk domain.
2. Register that domain in the hosted Supabase project under Authentication → Third-Party Auth → Clerk.
3. For local Supabase, set `[auth.third_party.clerk]` to `enabled = true` in `config.toml` and add the real Clerk domain.
4. Generate and apply the Drizzle schema using `npm run db:generate` and `npm run db:migrate`; migration commands prefer `DIRECT_URL`.
5. Apply the RLS migration in `migrations/` after the Drizzle tables exist.
6. Run Supabase security and performance advisors before promotion.

User-reference columns remain `text` because Clerk IDs are strings. Every ownership policy reads `(select auth.jwt() ->> 'sub')`; `auth.uid()` is intentionally not used.

The current migration explicitly grants Data API access because new Supabase projects may not auto-expose newly created tables. Public reference tables are still protected by read-only RLS policies.
