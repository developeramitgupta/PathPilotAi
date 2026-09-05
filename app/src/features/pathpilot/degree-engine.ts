import { z } from "zod";

import type { AgentOutput } from "@/lib/ai/schemas";
import { generateStructured, isAiConfigured } from "@/lib/ai/openai";
import { degreePaths, type DegreePathEntry } from "@/lib/static-data/degrees";
import { degreeAdvisorResultSchema, type DegreeAdvisorInput, type DegreeAdvisorResult } from "./schemas";

const aiDegreeSchema = z.object({
  recommendedDegreeKey: z.string().min(1),
  headline: z.string().min(15).max(120),
  narrative: z.string().min(60).max(600),
  reasoningRefs: z.array(z.string().min(1)).min(2).max(4),
  notes: z.array(z.object({ degreeKey: z.string().min(1), roiNote: z.string().min(20).max(240) })).length(6),
});

function careerOverlap(careers: string[], path: DegreePathEntry) {
  const text = careers.join(" ").toLowerCase();
  return path.careerTerms.filter((term) => text.includes(term)).length;
}

function outcomeOverlap(careers: string[], path: DegreePathEntry) {
  const normalizedCareers = careers.map((career) => career.toLowerCase());
  return path.topCareerOutcomes.filter((outcome) =>
    normalizedCareers.some((career) => career.includes(outcome.toLowerCase()) || outcome.toLowerCase().includes(career)),
  ).length;
}

function scorePath(input: DegreeAdvisorInput, path: DegreePathEntry) {
  const overlap = careerOverlap(input.shortlistedCareers, path);
  const directOutcomes = outcomeOverlap(input.shortlistedCareers, path);
  const budgetFit = path.averageTotalCost <= input.totalBudget ? 20 : Math.max(0, 20 - Math.ceil((path.averageTotalCost - input.totalBudget) / 100_000) * 2);
  const timeFit = input.timeHorizon === "fast" ? path.speedScore : input.timeHorizon === "deep" ? path.depthScore : Math.round((path.speedScore + path.depthScore) / 2);
  return Math.max(40, Math.min(94, 20 + overlap * 6 + directOutcomes * 8 + budgetFit + timeFit * 3 + path.flexibilityScore));
}

function roiNote(input: DegreeAdvisorInput, path: DegreePathEntry) {
  const budgetPhrase = path.averageTotalCost <= input.totalBudget ? "within your stated total budget" : "above your stated total budget";
  return `${path.degreeType} is ${budgetPhrase}. Treat the salary band as illustrative; ROI depends most on institution quality, completed projects, experience, and the role you actually secure.`;
}

function baseResult(input: DegreeAdvisorInput): DegreeAdvisorResult {
  const comparisons = degreePaths
    .map((path) => ({ path, score: scorePath(input, path) }))
    .sort((a, b) => b.score - a.score)
    .map(({ path, score }) => ({
      degreeKey: path.key, degreeType: path.degreeType, durationYears: path.durationYears,
      averageTotalCost: path.averageTotalCost, typicalEntrySalary: path.typicalEntrySalary,
      topCareerOutcomes: path.topCareerOutcomes, flexibilityScore: path.flexibilityScore,
      fitScore: score, roiNote: roiNote(input, path), pros: path.pros, cons: path.cons,
      reasoningRefs: ["shortlistedCareers", "totalBudget", "timeHorizon"],
    }));
  const top = comparisons[0];
  return degreeAdvisorResultSchema.parse({
    recommendation: { degreeKey: top.degreeKey, headline: `${top.degreeType} is your strongest current fit`, narrative: `For ${input.shortlistedCareers.join(" and ")}, ${top.degreeType} creates the best balance of career alignment, total cost, time, and flexibility in this comparison. Use this as a decision aid and compare actual institutions before committing.`, reasoningRefs: ["shortlistedCareers", "totalBudget", "timeHorizon"] },
    comparisons, mode: "deterministic-fallback", generatedAt: new Date().toISOString(),
  });
}

export async function compareDegrees(input: DegreeAdvisorInput): Promise<AgentOutput<DegreeAdvisorResult>> {
  const fallback = baseResult(input);
  if (!isAiConfigured()) return { result: fallback, reasoningRefs: ["shortlistedCareers", "totalBudget", "timeHorizon"], confidenceBand: "medium" };
  try {
    const response = await generateStructured({
      schema: aiDegreeSchema,
      schemaName: "pathpilot_degree_comparison",
      system: "You are PathPilot's Education Advisor. Personalize the recommendation over the six supplied degree paths. Never alter static cost, duration, salary, outcome, or score fields. Do not guarantee ROI or employment. Return exactly one note per supplied degree key and cite input field names only.",
      user: JSON.stringify({ input, comparisons: fallback.comparisons }),
    });
    if (!response) return { result: fallback, reasoningRefs: ["shortlistedCareers", "totalBudget", "timeHorizon"], confidenceBand: "medium" };
    const keys = new Set(fallback.comparisons.map((item) => item.degreeKey));
    if (!keys.has(response.recommendedDegreeKey) || response.notes.some((note) => !keys.has(note.degreeKey))) throw new Error("Education Advisor returned an invalid degree key.");
    const notes = new Map(response.notes.map((note) => [note.degreeKey, note.roiNote]));
    const result = degreeAdvisorResultSchema.parse({ ...fallback, mode: "ai", recommendation: { degreeKey: response.recommendedDegreeKey, headline: response.headline, narrative: response.narrative, reasoningRefs: response.reasoningRefs }, comparisons: fallback.comparisons.map((item) => ({ ...item, roiNote: notes.get(item.degreeKey) ?? item.roiNote })) });
    return { result, reasoningRefs: response.reasoningRefs, confidenceBand: "high" };
  } catch {
    return { result: fallback, reasoningRefs: ["shortlistedCareers", "totalBudget", "timeHorizon"], confidenceBand: "medium" };
  }
}
