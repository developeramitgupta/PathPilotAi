import { NextResponse } from "next/server";
import { z } from "zod";

import { generateRoadmap } from "@/features/pathpilot/roadmap-engine";
import {
  careerMatchSchema,
  decisionRecordSchema,
  onboardingProfileSchema,
} from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { saveRoadmapPlan } from "@/features/pathpilot/server/repository";
import { serviceAvailability } from "@/lib/env";

const requestSchema = z.object({
  career: careerMatchSchema,
  profile: onboardingProfileSchema,
  decisions: z.array(decisionRecordSchema).default([]),
});

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const input = requestSchema.parse(await request.json());
    const output = await generateRoadmap(input);
    if (serviceAvailability.database) {
      await saveRoadmapPlan(userId, output.result);
    }
    return NextResponse.json(output);
  } catch (error) {
    return pathPilotApiError(error);
  }
}
