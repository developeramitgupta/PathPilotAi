import { NextResponse } from "next/server";

import { generateCollegeMatches } from "@/features/pathpilot/college-engine";
import { collegeFinderInputSchema } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";

export async function POST(request: Request) {
  try {
    await getPathPilotUserId();
    const input = collegeFinderInputSchema.parse(await request.json());
    return NextResponse.json(await generateCollegeMatches(input));
  } catch (error) {
    return pathPilotApiError(error);
  }
}
