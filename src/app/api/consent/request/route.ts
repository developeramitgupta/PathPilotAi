import { NextResponse } from "next/server";
import { z } from "zod";

import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { createParentalConsentRequest } from "@/features/pathpilot/server/consent";

const requestSchema = z.object({ parentEmail: z.string().trim().email() });

export async function POST(request: Request) {
  try {
    const studentUserId = await getPathPilotUserId();
    const { parentEmail } = requestSchema.parse(await request.json());
    const result = await createParentalConsentRequest(studentUserId, parentEmail);
    return NextResponse.json({
      status: "pending",
      expiresAt: result.expiresAt.toISOString(),
      // Email delivery is activated only once a transactional provider is configured.
      delivery: "provider-not-configured",
    });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
