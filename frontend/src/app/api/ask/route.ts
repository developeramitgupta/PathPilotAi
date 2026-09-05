import { NextResponse } from "next/server";
import { z } from "zod";

import { answerPathPilotQuestion } from "@/lib/ai/orchestrator";
import { saveGuidanceTrace } from "@/lib/ai/traces";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { assertPersonalDataConsent } from "@/features/pathpilot/server/consent";
import { serviceAvailability } from "@/lib/env";

const requestSchema = z.object({
  question: z.string().trim().min(3).max(1000),
  profile: z.record(z.string(), z.unknown()).optional(),
  decisionMemory: z.array(z.record(z.string(), z.unknown())).optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const input = requestSchema.parse(await request.json());
    const result = await answerPathPilotQuestion(input.question, {
        profile: input.profile,
        decisionMemory: input.decisionMemory,
      });
    if (serviceAvailability.database) {
      await assertPersonalDataConsent(userId);
      await saveGuidanceTrace({
        userId,
        input: input.question,
        trace: result.trace,
        reasoningRefs: result.reasoningRefs,
        confidenceBand: result.confidenceBand,
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    return pathPilotApiError(error);
  }
}
