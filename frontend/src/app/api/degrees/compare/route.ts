import { NextResponse } from "next/server";

import { compareDegrees } from "@/features/pathpilot/degree-engine";
import { degreeAdvisorInputSchema } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";

export async function POST(request: Request) {
  try {
    await getPathPilotUserId();
    const input = degreeAdvisorInputSchema.parse(await request.json());
    return NextResponse.json(await compareDegrees(input));
  } catch (error) {
    return pathPilotApiError(error);
  }
}
