import { NextResponse } from "next/server";
import { z } from "zod";

import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { requirePathPilotAdmin } from "@/features/pathpilot/server/auth";
import { importAishePage } from "@/features/verified-data/server/ingestion";

const importRequestSchema = z.object({
  offset: z.number().int().min(0).optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

/** Starts an admin-authorized, review-gated AISHE import. */
export async function POST(request: Request) {
  try {
    const actor = await requirePathPilotAdmin();
    const input = importRequestSchema.parse(await request.json());
    const result = await importAishePage({ actorUserId: actor.userId, ...input });
    return NextResponse.json({
      ...result,
      publication: "pending_admin_review",
    });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
