import { NextResponse } from "next/server";
import { z } from "zod";

import { generateCareerDiscovery } from "@/features/pathpilot/career-engine";
import {
  decisionRecordSchema,
  onboardingProfileSchema,
} from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import {
  listDecisionMemory,
  loadOnboardingProfile,
  replaceCareerMatches,
} from "@/features/pathpilot/server/repository";
import { serviceAvailability } from "@/lib/env";

const requestSchema = z.object({
  regenerate: z.boolean().default(false),
  profile: onboardingProfileSchema.optional(),
  decisions: z.array(decisionRecordSchema).default([]),
});

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const input = requestSchema.parse(await request.json());
    const profile =
      input.profile ??
      (serviceAvailability.database
        ? await loadOnboardingProfile(userId)
        : null);
    if (!profile) {
      return NextResponse.json(
        { error: "Complete your profile to get your first matches." },
        { status: 409 },
      );
    }
    const decisions = serviceAvailability.database
      ? await listDecisionMemory(userId)
      : input.decisions;
    const output = await generateCareerDiscovery(profile, decisions);
    if (serviceAvailability.database) {
      await replaceCareerMatches(userId, output.result);
    }
    return NextResponse.json(output);
  } catch (error) {
    return pathPilotApiError(error);
  }
}
