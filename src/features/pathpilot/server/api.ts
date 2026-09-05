import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function pathPilotApiError(error: unknown) {
  const requestId = crypto.randomUUID();
  const headers = { "x-request-id": requestId };
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Some answers need attention.",
        requestId,
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 422, headers },
    );
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Please sign in to continue.", requestId }, { status: 401, headers });
  }
  if (error instanceof Error && error.message === "EMAIL_REQUIRED") {
    return NextResponse.json(
      { error: "A verified email address is required to use PathPilot personal features.", requestId },
      { status: 422, headers },
    );
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json(
      { error: "You do not have permission to perform this action.", requestId },
      { status: 403, headers },
    );
  }
  if (error instanceof Error && error.message === "PARENTAL_CONSENT_REQUIRED") {
    return NextResponse.json(
      {
        error: "A parent or guardian must give consent before this account can save sensitive guidance.",
        requestId,
      },
      { status: 403, headers },
    );
  }
  if (error instanceof Error && error.message === "DATA_SOURCE_NOT_CONFIGURED") {
    return NextResponse.json(
      { error: "The official data import is not configured yet.", requestId },
      { status: 503, headers },
    );
  }
  if (error instanceof Error && error.message === "GITHUB_PROFILE_NOT_FOUND") {
    return NextResponse.json(
      { error: "GitHub could not find that public profile.", requestId },
      { status: 404, headers },
    );
  }
  if (error instanceof Error && error.message === "GITHUB_RATE_LIMITED") {
    return NextResponse.json(
      { error: "GitHub is temporarily rate-limiting profile analysis. Please try again shortly.", requestId },
      { status: 429, headers },
    );
  }
  console.error(`[PathPilot API ${requestId}]`, error instanceof Error ? error.message : "Unknown server error");
  return NextResponse.json(
    { error: "PathPilot could not complete that request. Please try again.", requestId },
    { status: 500, headers },
  );
}
