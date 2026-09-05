import { z } from "zod";

import type { AgentOutput } from "@/lib/ai/schemas";
import { generateStructured, isAiConfigured } from "@/lib/ai/openai";
import {
  careerTaxonomy,
  type CareerTaxonomyEntry,
  type EducationCostBand,
} from "@/lib/static-data/careers";
import {
  careerDiscoveryResultSchema,
  type CareerDiscoveryResult,
  type DecisionRecord,
  type OnboardingProfile,
} from "./schemas";

interface ScoredCareer {
  career: CareerTaxonomyEntry;
  score: number;
  reasoningRefs: string[];
}

const aiRankingSchema = z.object({
  ranked: z.array(
    z.object({
      careerKey: z.string().min(1),
      compatibility: z.number().int().min(0).max(100),
      why: z.string().min(40).max(420),
      reasoningRefs: z.array(z.string().min(1)).min(2).max(5),
    }),
  ).length(5),
});

const budgetRanks: Record<EducationCostBand, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function normalizedSet(values: string[]) {
  return new Set(values.map((value) => value.toLowerCase()));
}

function overlapCount(studentValues: string[], careerValues: string[]) {
  const studentSet = normalizedSet(studentValues);
  return careerValues.reduce(
    (count, value) => count + (studentSet.has(value.toLowerCase()) ? 1 : 0),
    0,
  );
}

function scoreCareer(
  profile: OnboardingProfile,
  career: CareerTaxonomyEntry,
): ScoredCareer {
  const interestOverlap = overlapCount(profile.interests, career.interestTags);
  const subjectOverlap = overlapCount(
    profile.favoriteSubjects,
    career.subjectTags,
  );
  const hobbyOverlap = overlapCount(profile.hobbies, career.hobbyTags);
  const styleKeys = Object.keys(profile.workStyle) as Array<
    keyof OnboardingProfile["workStyle"]
  >;
  const styleDistance = styleKeys.reduce(
    (distance, key) =>
      distance + Math.abs(profile.workStyle[key] - career.workStyle[key]),
    0,
  );
  const styleScore = Math.max(0, 18 - styleDistance * 0.7);
  const studyScore =
    profile.studyPref === "balanced" || career.preferredStudy === "balanced"
      ? 8
      : profile.studyPref === career.preferredStudy
        ? 10
        : 2;
  const locationScore = career.locationModes.includes(profile.locationPref) ? 6 : 1;
  const rawScore =
    35 +
    Math.min(18, interestOverlap * 9) +
    Math.min(16, subjectOverlap * 8) +
    Math.min(8, hobbyOverlap * 4) +
    styleScore +
    studyScore +
    locationScore;

  const refs: string[] = [];
  if (interestOverlap > 0) refs.push("interests");
  if (subjectOverlap > 0) refs.push("favoriteSubjects");
  if (hobbyOverlap > 0) refs.push("hobbies");
  refs.push("workStyle.analysis", "studyPref");
  if (locationScore === 6) refs.push("locationPref");

  return {
    career,
    score: Math.round(Math.max(42, Math.min(96, rawScore))),
    reasoningRefs: refs.slice(0, 5),
  };
}

function filterCandidates(
  profile: OnboardingProfile,
  decisions: DecisionRecord[],
) {
  const rejectedCareerKeys = new Set(
    decisions
      .filter(
        (decision) =>
          decision.targetType === "career" && decision.action === "rejected",
      )
      .map((decision) => decision.targetId),
  );
  const studentBudgetRank = budgetRanks[profile.studyBudget];
  const hardFiltered = careerTaxonomy.filter(
    (career) =>
      !rejectedCareerKeys.has(career.key) &&
      budgetRanks[career.educationCostBand] <= studentBudgetRank &&
      career.locationModes.includes(profile.locationPref) &&
      (profile.studyPref === "balanced" ||
        career.preferredStudy === "balanced" ||
        profile.studyPref === career.preferredStudy),
  );
  const pool = hardFiltered.length >= 15 ? hardFiltered : careerTaxonomy;

  return pool
    .filter((career) => !rejectedCareerKeys.has(career.key))
    .map((career) => scoreCareer(profile, career))
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
}

function deterministicResult(candidates: ScoredCareer[]): CareerDiscoveryResult {
  const matches = candidates.slice(0, 5).map(({ career, score, reasoningRefs }) => ({
    careerKey: career.key,
    careerName: career.name,
    family: career.family,
    compatibility: score,
    why: `Your ${reasoningRefs.includes("favoriteSubjects") ? "favorite subjects" : "interests"} and ${reasoningRefs.includes("hobbies") ? "hands-on hobbies" : "preferred way of working"} align with the analytical and practical work common in ${career.name}. The match also respects your study and location preferences.`,
    reasoningRefs,
    salaryBandEntry: career.salaryBandEntry,
    salaryBandMid: career.salaryBandMid,
    salaryBandSenior: career.salaryBandSenior,
    demandTrend: career.demandTrend,
    description: career.description,
    starterSkills: career.starterSkills,
  }));

  return careerDiscoveryResultSchema.parse({
    matches,
    mode: "deterministic-fallback",
    candidateCount: candidates.length,
    generatedAt: new Date().toISOString(),
  });
}

export async function generateCareerDiscovery(
  profile: OnboardingProfile,
  decisions: DecisionRecord[] = [],
): Promise<AgentOutput<CareerDiscoveryResult>> {
  const candidates = filterCandidates(profile, decisions);
  const fallback = deterministicResult(candidates);

  if (!isAiConfigured()) {
    return {
      result: fallback,
      reasoningRefs: ["interests", "favoriteSubjects", "workStyle", "studyPref"],
      confidenceBand: "medium",
    };
  }

  try {
    const ranked = await generateStructured({
      schema: aiRankingSchema,
      schemaName: "pathpilot_career_ranking",
      system:
        "You are PathPilot's Career Strategist for Indian students. Rank only the supplied candidates. Every explanation must cite the supplied profile fields, remain age-appropriate, avoid guarantees, and never invent salary or demand data. Do not return rejected options.",
      user: JSON.stringify({
        profile,
        decisions,
        candidates: candidates.map(({ career, score }) => ({
          careerKey: career.key,
          careerName: career.name,
          family: career.family,
          deterministicScore: score,
          tags: {
            interests: career.interestTags,
            subjects: career.subjectTags,
            workStyle: career.workStyle,
          },
        })),
      }),
    });

    if (!ranked) return { result: fallback, reasoningRefs: fallback.matches.flatMap((match) => match.reasoningRefs), confidenceBand: "medium" };

    const candidateMap = new Map(
      candidates.map(({ career }) => [career.key, career]),
    );
    const uniqueKeys = new Set(ranked.ranked.map((item) => item.careerKey));
    if (
      uniqueKeys.size !== 5 ||
      ranked.ranked.some((item) => !candidateMap.has(item.careerKey))
    ) {
      throw new Error("Career Strategist returned candidates outside the filtered set.");
    }

    const result = careerDiscoveryResultSchema.parse({
      mode: "ai",
      candidateCount: candidates.length,
      generatedAt: new Date().toISOString(),
      matches: ranked.ranked.map((item) => {
        const career = candidateMap.get(item.careerKey)!;
        return {
          ...item,
          careerName: career.name,
          family: career.family,
          salaryBandEntry: career.salaryBandEntry,
          salaryBandMid: career.salaryBandMid,
          salaryBandSenior: career.salaryBandSenior,
          demandTrend: career.demandTrend,
          description: career.description,
          starterSkills: career.starterSkills,
        };
      }),
    });

    return {
      result,
      reasoningRefs: Array.from(
        new Set(result.matches.flatMap((match) => match.reasoningRefs)),
      ),
      confidenceBand: "high",
    };
  } catch {
    return {
      result: fallback,
      reasoningRefs: ["interests", "favoriteSubjects", "workStyle", "studyPref"],
      confidenceBand: "medium",
    };
  }
}
