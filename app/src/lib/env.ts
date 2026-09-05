import { z } from "zod";

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
});

export const publicEnvironment = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || undefined,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
});

/** Clerk rejects placeholder and malformed keys at request time. Treat those
 * values as unconfigured so a credentials-free local preview can still run. */
export function hasValidClerkPublishableKey(value = publicEnvironment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  return Boolean(value && /^(pk_test|pk_live)_/.test(value));
}

export const serviceAvailability = {
  clerk: hasValidClerkPublishableKey(),
  supabase: Boolean(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL &&
      publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  database: Boolean(process.env.DATABASE_URL),
} as const;
