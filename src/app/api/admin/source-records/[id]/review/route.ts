import { NextResponse } from "next/server";
import { z } from "zod";

import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { requirePathPilotAdmin } from "@/features/pathpilot/server/auth";
import { reviewSourceRecord } from "@/features/verified-data/server/ingestion";

const reviewSchema = z.object({ decision: z.enum(["published", "rejected"]) });

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requirePathPilotAdmin();
    const { id } = await context.params;
    const { decision } = reviewSchema.parse(await request.json());
    await reviewSourceRecord({ recordId: id, actorUserId: actor.userId, decision });
    return NextResponse.json({ status: decision });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
