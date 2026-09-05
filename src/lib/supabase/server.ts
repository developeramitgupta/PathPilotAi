import "server-only";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

import { publicEnvironment, serviceAvailability } from "@/lib/env";

export function createServerSupabaseClient() {
  const url = publicEnvironment.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey || !serviceAvailability.clerk) {
    return null;
  }

  return createClient(url, publishableKey, {
    async accessToken() {
      return (await auth()).getToken();
    },
  });
}
