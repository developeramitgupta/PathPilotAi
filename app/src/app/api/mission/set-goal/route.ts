import { NextResponse } from "next/server";

import { buildMissionPlan } from "@/features/pathpilot/mission-engine";
import { missionInputSchema, missionPlanSchema } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { saveMissionPlan } from "@/features/pathpilot/server/repository";
import { serviceAvailability } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const input = missionInputSchema.parse(await request.json());
    const result = buildMissionPlan(input);
    if (serviceAvailability.database) await saveMissionPlan(userId, result);
    return NextResponse.json({
      result,
      reasoningRefs: ["careerHealth.level", "roadmap.milestones"],
      confidenceBand: "high",
    });
  } catch (error) {
    return pathPilotApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const result = missionPlanSchema.parse(await request.json());
    if (serviceAvailability.database) await saveMissionPlan(userId, result);
    return NextResponse.json({ result });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
