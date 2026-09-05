import type {
  OpportunityCategory,
  OnboardingProfile,
  RadarOpportunity,
  RadarResult,
} from "./schemas";
import { radarOpportunityFixtures } from "@/lib/static-data/radar-opportunities";

export interface RadarEngineInput {
  profile: OnboardingProfile;
  careerName?: string;
  starterSkills?: string[];
  category?: OpportunityCategory | "all";
  now?: string;
}

function words(values: string[]) {
  return new Set(
    values
      .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/))
      .filter((value) => value.length > 2),
  );
}

function overlap(left: Set<string>, right: Set<string>) {
  let count = 0;
  for (const value of left) if (right.has(value)) count += 1;
  return count;
}

export function rankRadarOpportunities(input: RadarEngineInput): RadarResult {
  const profileTerms = words([
    ...input.profile.interests,
    ...input.profile.favoriteSubjects,
    ...input.profile.strengths,
    ...(input.starterSkills ?? []),
    input.careerName ?? "",
  ]);
  const locationBoost = input.profile.locationPref === "home-city" ? 2 : 5;

  const ranked = radarOpportunityFixtures
    .filter((item) => input.category === undefined || input.category === "all" || item.category === input.category)
    .map((item, index) => {
      const tagTerms = words(item.tags);
      const matches = overlap(profileTerms, tagTerms);
      const learningBoost =
        input.profile.learningStyle === "hands-on" &&
        ["hackathon", "competition", "open-source"].includes(item.category)
          ? 8
          : 0;
      const relevance = Math.max(
        55,
        Math.min(96, 61 + matches * 7 + learningBoost + locationBoost - (index % 4)),
      );
      const matchedTags = item.tags.filter((tag) => overlap(profileTerms, words([tag])) > 0);
      const topReasons = matchedTags.slice(0, 2);
      const fallbackReason = input.careerName
        ? `builds visible evidence for ${input.careerName}`
        : `fits your ${input.profile.learningStyle} learning preference`;

      return {
        ...item,
        relevance,
        whyRelevant: topReasons.length
          ? `Matches your ${topReasons.join(" and ")} signals and ${fallbackReason}.`
          : `This ${item.category} pattern ${fallbackReason}.`,
        reasoningRefs: [
          ...(topReasons.length ? ["profile.interests", "profile.favoriteSubjects"] : []),
          "profile.learningStyle",
          ...(input.careerName ? ["selectedCareer"] : []),
        ],
        isDemo: true,
      } satisfies RadarOpportunity;
    })
    .toSorted((a, b) => b.relevance - a.relevance);

  return {
    opportunities: ranked,
    mode: "static-ranked-demo",
    generatedAt: input.now ?? new Date().toISOString(),
    disclaimer:
      "Demo opportunity patterns, not live listings. Verify current programs and dates independently.",
  };
}
