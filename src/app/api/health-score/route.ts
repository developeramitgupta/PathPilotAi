import { NextResponse } from "next/server";

import { calculateCareerHealth } from "@/features/pathpilot/health-engine";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { defaultOnboardingProfile } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";

export async function GET() {
  try {
    await getPathPilotUserId();
    const result = calculateCareerHealth({ profile: defaultOnboardingProfile });
    return NextResponse.json({
      result,
      reasoningRefs: ["careerHealth.weights", "progressSnapshot"],
      confidenceBand: "high",
    });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
