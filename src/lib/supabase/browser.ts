import { createClient } from "@supabase/supabase-js";

import { publicEnvironment } from "@/lib/env";

type AccessTokenProvider = () => Promise<string | null>;

export function createBrowserSupabaseClient(accessToken: AccessTokenProvider) {
  const url = publicEnvironment.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Supabase browser access is not configured.");
  }

  return createClient(url, publishableKey, { accessToken });
}
