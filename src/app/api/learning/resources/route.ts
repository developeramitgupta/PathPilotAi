import { NextResponse } from "next/server";
import { z } from "zod";

import { retrieveLearningResources } from "@/features/pathpilot/learning-engine";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";

const querySchema = z.object({
  milestone: z.string().min(2),
  skillTag: z.string().min(2),
  learningStyle: z.enum(["video", "reading", "hands-on", "blended"]).default("blended"),
});

export async function GET(request: Request) {
  try {
    await getPathPilotUserId();
    const url = new URL(request.url);
    const query = querySchema.parse({
      milestone: url.searchParams.get("milestone"),
      skillTag: url.searchParams.get("skillTag"),
      learningStyle: url.searchParams.get("learningStyle") ?? "blended",
    });
    return NextResponse.json(await retrieveLearningResources(query));
  } catch (error) {
    return pathPilotApiError(error);
  }
}
