import { NextResponse } from "next/server";

import { generateCareerDiscovery } from "@/features/pathpilot/career-engine";
import { onboardingProfileSchema } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import {
  replaceCareerMatches,
  saveOnboardingProfile,
} from "@/features/pathpilot/server/repository";
import { serviceAvailability } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const profile = onboardingProfileSchema.parse(await request.json());
    const output = await generateCareerDiscovery(profile);

    if (serviceAvailability.database) {
      await saveOnboardingProfile(userId, profile);
      await replaceCareerMatches(userId, output.result);
    }

    return NextResponse.json({ profile, ...output });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
