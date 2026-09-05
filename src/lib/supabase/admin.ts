import "server-only";

import { createClient } from "@supabase/supabase-js";

import { publicEnvironment } from "@/lib/env";

export function createSupabaseAdminClient() {
  const url = publicEnvironment.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  // Connection strings are sometimes accidentally pasted into this variable.
  // Only pass real Supabase server keys to the Storage API.
  if (!url || !secret || /^postgres(ql)?:\/\//i.test(secret)) return null;
  return createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
}
