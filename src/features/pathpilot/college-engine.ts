import { z } from "zod";

import type { AgentOutput } from "@/lib/ai/schemas";
import { generateStructured, isAiConfigured } from "@/lib/ai/openai";
import { collegeCatalog, type CollegeCatalogEntry } from "@/lib/static-data/colleges";
import {
  collegeFinderResultSchema,
  type CollegeFinderInput,
  type CollegeFinderResult,
  type CollegeMatchResult,
} from "./schemas";

const disclaimer = "Cutoffs and placement figures are demo data, not live admissions data." as const;

const aiRankingSchema = z.object({
  ranked: z.array(z.object({
    collegeId: z.string().min(1),
    compatibility: z.number().int().min(0).max(100),
    why: z.string().min(35).max(380),
    reasoningRefs: z.array(z.string().min(1)).min(2).max(5),
  })).min(1).max(8),
});

function scoreCollege(input: CollegeFinderInput, college: CollegeCatalogEntry) {
  const cultureMatches = input.cultureTags.filter((tag) => college.cultureTags.includes(tag)).length;
  const budgetHeadroom = Math.max(0, input.annualBudget - college.estimatedAnnualCost);
  const budgetScore = Math.max(4, 18 - Math.round((budgetHeadroom / input.annualBudget) * 8));
  const placementScore = Math.round((college.placementRateDemo / 100) * input.placementPriority * 4);
  const cutoffScore = input.boardPercentile >= college.boardCutoffDemo ? 15 : Math.max(0, 15 - Math.ceil(college.boardCutoffDemo - input.boardPercentile));
  const hostelScore = input.hostel === "not-needed" ? 5 : college.hostelAvailable ? 8 : 0;
  const scholarshipScore = input.scholarshipNeed ? (college.scholarshipAvailable ? 10 : 0) : 4;
  const tierScore = college.tier === "1" ? 7 : college.tier === "2" ? 4 : 1;
  const raw = 18 + budgetScore + placementScore + cutoffScore + hostelScore + scholarshipScore + cultureMatches * 4 + tierScore;
  const reasoningRefs = ["annualBudget", "branch", "placementPriority"];
  if (input.state !== "All India") reasoningRefs.push("state");
  if (input.hostel !== "not-needed") reasoningRefs.push("hostel");
  if (input.scholarshipNeed) reasoningRefs.push("scholarshipNeed");
  if (cultureMatches) reasoningRefs.push("cultureTags");
  return { college, score: Math.max(48, Math.min(97, Math.round(raw))), reasoningRefs: reasoningRefs.slice(0, 5) };
}

function candidatesFor(input: CollegeFinderInput) {
  const city = input.city.trim().toLowerCase();
  return collegeCatalog
    .filter((college) => college.estimatedAnnualCost <= input.annualBudget)
    .filter((college) => input.state === "All India" || college.state === input.state)
    .filter((college) => !city || college.city.toLowerCase().includes(city))
    .filter((college) => input.ownership === "any" || college.ownership === input.ownership)
    .filter((college) => college.branches.includes(input.branch))
    .filter((college) => input.hostel !== "required" || college.hostelAvailable)
    .map((college) => scoreCollege(input, college))
    .sort((a, b) => b.score - a.score || a.college.estimatedAnnualCost - b.college.estimatedAnnualCost)
    .slice(0, 24);
}

function toMatch(college: CollegeCatalogEntry, compatibility: number, why: string, reasoningRefs: string[]): CollegeMatchResult {
  return {
    collegeId: college.id,
    name: college.name,
    city: college.city,
    state: college.state,
    ownership: college.ownership,
    tier: college.tier,
    compatibility,
    why,
    reasoningRefs,
    estimatedAnnualCost: college.estimatedAnnualCost,
    hostelAvailable: college.hostelAvailable,
    scholarshipAvailable: college.scholarshipAvailable,
    branches: college.branches,
    boardCutoffDemo: college.boardCutoffDemo,
    placementRateDemo: college.placementRateDemo,
    medianPackageDemo: college.medianPackageDemo,
    cultureTags: college.cultureTags,
    overview: college.overview,
  };
}

function fallbackResult(input: CollegeFinderInput, candidates: ReturnType<typeof candidatesFor>): CollegeFinderResult {
  return collegeFinderResultSchema.parse({
    matches: candidates.slice(0, 8).map(({ college, score, reasoningRefs }) =>
      toMatch(
        college,
        score,
        `${college.name} fits your ${input.branch} goal within the selected annual budget. Its ${college.ownership} model, demo placement profile, and ${college.cultureTags.join(" and ")} culture signals align with the preferences you set.`,
        reasoningRefs,
      ),
    ),
    mode: "deterministic-fallback",
    candidateCount: candidates.length,
    generatedAt: new Date().toISOString(),
    disclaimer,
  });
}

export async function generateCollegeMatches(input: CollegeFinderInput): Promise<AgentOutput<CollegeFinderResult>> {
  const candidates = candidatesFor(input);
  const fallback = fallbackResult(input, candidates);
  if (!isAiConfigured() || candidates.length === 0) {
    return { result: fallback, reasoningRefs: ["annualBudget", "state", "branch", "placementPriority"], confidenceBand: "medium" };
  }

  try {
    const ranked = await generateStructured({
      schema: aiRankingSchema,
      schemaName: "pathpilot_college_ranking",
      system: `You are PathPilot's College Advisor for Indian students. Rank only supplied colleges. Cite only supplied preference field names in reasoningRefs. Never alter or invent costs, cutoffs, placement figures, branches, or availability. Every explanation must treat the figures as demo data and avoid admission guarantees.`,
      user: JSON.stringify({ input, disclaimer, candidates: candidates.map(({ college, score }) => ({ ...college, deterministicScore: score })) }),
    });
    if (!ranked) return { result: fallback, reasoningRefs: ["annualBudget", "state", "branch"], confidenceBand: "medium" };
    const candidateMap = new Map(candidates.map(({ college }) => [college.id, college]));
    const valid = ranked.ranked.filter((item, index, array) => candidateMap.has(item.collegeId) && array.findIndex((candidate) => candidate.collegeId === item.collegeId) === index).slice(0, 8);
    if (valid.length !== Math.min(8, candidates.length)) throw new Error("College Advisor returned an invalid candidate set.");
    const result = collegeFinderResultSchema.parse({
      matches: valid.map((item) => toMatch(candidateMap.get(item.collegeId)!, item.compatibility, item.why, item.reasoningRefs)),
      mode: "ai",
      candidateCount: candidates.length,
      generatedAt: new Date().toISOString(),
      disclaimer,
    });
    return { result, reasoningRefs: Array.from(new Set(result.matches.flatMap((match) => match.reasoningRefs))), confidenceBand: "high" };
  } catch {
    return { result: fallback, reasoningRefs: ["annualBudget", "state", "branch", "placementPriority"], confidenceBand: "medium" };
  }
}
