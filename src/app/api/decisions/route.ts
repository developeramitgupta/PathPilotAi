import { NextResponse } from "next/server";
import { z } from "zod";

import { decisionRecordSchema } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import {
  listDecisionMemory,
  removeDecision,
  saveDecision,
} from "@/features/pathpilot/server/repository";
import { serviceAvailability } from "@/lib/env";

const actionSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("record"), decision: decisionRecordSchema }),
  z.object({ operation: z.literal("undo"), decisionId: z.string().min(1) }),
]);

export async function GET() {
  try {
    const userId = await getPathPilotUserId();
    const history = serviceAvailability.database
      ? await listDecisionMemory(userId)
      : [];
    return NextResponse.json({ history });
  } catch (error) {
    return pathPilotApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const action = actionSchema.parse(await request.json());
    if (serviceAvailability.database) {
      if (action.operation === "record") {
        await saveDecision(userId, action.decision);
      } else {
        await removeDecision(userId, action.decisionId);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
