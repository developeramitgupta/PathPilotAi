import { NextResponse } from "next/server";

import { recommendExams } from "@/features/pathpilot/exam-engine";
import { examNavigatorInputSchema } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";

export async function POST(request: Request) {
  try {
    await getPathPilotUserId();
    const input = examNavigatorInputSchema.parse(await request.json());
    return NextResponse.json(await recommendExams(input));
  } catch (error) {
    return pathPilotApiError(error);
  }
}
