import { NextResponse } from "next/server";

import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { loadOnboardingProfile } from "@/features/pathpilot/server/repository";
import { serviceAvailability } from "@/lib/env";

export async function GET() {
  try {
    const userId = await getPathPilotUserId();
    if (!serviceAvailability.database) {
      return NextResponse.json({ profile: null, mode: "local-preview" });
    }
    return NextResponse.json({ profile: await loadOnboardingProfile(userId), mode: "connected" });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
