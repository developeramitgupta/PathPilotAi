import { NextResponse } from "next/server";

import { generateCollegeMatches } from "@/features/pathpilot/college-engine";
import { collegeFinderInputSchema } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";

export async function POST(request: Request) {
  try {
    // Published catalogues are public to explore. Sign-in is only required to
    // save a shortlist or personalise a student profile.
    const input = collegeFinderInputSchema.parse(await request.json());
    return NextResponse.json(await generateCollegeMatches(input));
  } catch (error) {
    return pathPilotApiError(error);
  }
}
