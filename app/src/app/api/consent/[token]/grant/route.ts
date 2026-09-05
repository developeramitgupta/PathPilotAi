import { NextResponse } from "next/server";

import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getAuthenticatedEmail } from "@/features/pathpilot/server/auth";
import { grantParentalConsent } from "@/features/pathpilot/server/consent";

export async function POST(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const parentEmail = await getAuthenticatedEmail();
    await grantParentalConsent(token, parentEmail);
    return NextResponse.json({ status: "granted" });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
