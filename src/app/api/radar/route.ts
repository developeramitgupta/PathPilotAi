import { NextResponse } from "next/server";

import { rankRadarOpportunities } from "@/features/pathpilot/radar-engine";
import {
  defaultOnboardingProfile,
  opportunityCategorySchema,
} from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";

export async function GET(request: Request) {
  try {
    await getPathPilotUserId();
    const { searchParams } = new URL(request.url);
    const careerName = searchParams.get("career")?.trim() || undefined;
    const interests = searchParams
      .get("interests")
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const skills = searchParams
      .get("skills")
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const categoryValue = searchParams.get("category");
    const category =
      categoryValue === "all" || !categoryValue
        ? "all"
        : opportunityCategorySchema.parse(categoryValue);
    const profile = {
      ...defaultOnboardingProfile,
      interests: interests?.length ? interests : defaultOnboardingProfile.interests,
    };
    const result = rankRadarOpportunities({
      profile,
      careerName,
      starterSkills: skills,
      category,
    });
    return NextResponse.json({
      result,
      reasoningRefs: ["profile.interests", "profile.learningStyle", "selectedCareer"],
      confidenceBand: "medium",
    });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
