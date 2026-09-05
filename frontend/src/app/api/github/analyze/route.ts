import { NextResponse } from "next/server";
import { z } from "zod";

import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { assertPersonalDataConsent } from "@/features/pathpilot/server/consent";
import {
  analysePublicGitHubProfile,
  saveGitHubAnalysis,
} from "@/features/github/server/analyze";
import { serviceAvailability } from "@/lib/env";

const inputSchema = z.object({ username: z.string().trim().min(1).max(39) });

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const { username } = inputSchema.parse(await request.json());
    const result = await analysePublicGitHubProfile(username);
    if (serviceAvailability.database) {
      await assertPersonalDataConsent(userId);
      await saveGitHubAnalysis(userId, result);
    }
    return NextResponse.json({ ...result, persisted: serviceAvailability.database });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
