import { NextResponse } from "next/server";

import { rankRadarOpportunities } from "@/features/pathpilot/radar-engine";
import { getVerifiedOpportunities } from "@/features/verified-data/server/live-catalogue";
import {
  defaultOnboardingProfile,
  opportunityCategorySchema,
} from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";

export async function GET(request: Request) {
  try {
    // Official opportunities can be browsed without an account. Saving or
    // tracking a result remains an authenticated personal action.
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
    const verified = await getVerifiedOpportunities({
      interests: profile.interests,
      skills: skills ?? [],
      careerName,
    });
    const result = verified ?? rankRadarOpportunities({
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
