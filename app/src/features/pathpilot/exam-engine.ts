import { z } from "zod";

import type { AgentOutput } from "@/lib/ai/schemas";
import { generateStructured, isAiConfigured } from "@/lib/ai/openai";
import { examCatalog, type ExamCatalogEntry } from "@/lib/static-data/exams";
import { examNavigatorResultSchema, type ExamNavigatorInput, type ExamNavigatorResult } from "./schemas";

const disclaimer = "Mock dates - verify every date on the official exam website." as const;
const aiExamSchema = z.object({
  ranked: z.array(z.object({ examId: z.string().min(1), why: z.string().min(30).max(360), reasoningRefs: z.array(z.string().min(1)).min(2).max(4) })).min(1).max(8),
});

function termMatch(goal: string, term: string) {
  const normalizedGoal = goal.toLowerCase();
  const normalizedTerm = term.toLowerCase();
  return normalizedGoal.includes(normalizedTerm) || normalizedTerm.includes(normalizedGoal);
}

function rankedCandidates(input: ExamNavigatorInput) {
  const ownership = input.collegePreference === "any" ? null : input.collegePreference;
  const goal = input.careerGoal.toLowerCase();
  const targetCategory =
    ["software", "engineer", "technology", "data"].some((term) => goal.includes(term)) ? "engineering" :
      ["medicine", "doctor", "health", "dentist"].some((term) => goal.includes(term)) ? "medicine" :
        ["law", "legal", "advocate"].some((term) => goal.includes(term)) ? "law" :
          ["design", "fashion", "visual", "ux"].some((term) => goal.includes(term)) ? "design" :
            ["account", "finance", "audit", "commerce", "tax"].some((term) => goal.includes(term)) ? "commerce" :
              ["hospitality", "hotel", "tourism", "chef"].some((term) => goal.includes(term)) ? "hospitality" : null;
  return examCatalog
    .map((exam) => {
      const goalMatches = exam.careerTerms.filter((term) => termMatch(input.careerGoal, term)).length;
      const locationMatch = exam.locations.includes("All India") || exam.locations.some((location) => input.location.toLowerCase().includes(location.toLowerCase()));
      const ownershipMatch = !ownership || exam.collegeOwnership.includes(ownership);
      const difficultyGap = Math.abs(exam.difficulty - input.difficultyTolerance);
      const categoryMatch = targetCategory ? exam.category.toLowerCase().includes(targetCategory) : false;
      const score = goalMatches * 28 + (categoryMatch ? 18 : 0) + (locationMatch ? 16 : 0) + (ownershipMatch ? 12 : 0) + Math.max(0, 12 - difficultyGap * 4);
      return { exam, score, goalMatches };
    })
    .filter(({ goalMatches, exam }) => goalMatches > 0 || exam.id === "cuet-ug")
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function recommendation(exam: ExamCatalogEntry, input: ExamNavigatorInput, why?: string, reasoningRefs = ["careerGoal", "difficultyTolerance"]) {
  return {
    examId: exam.id,
    name: exam.name,
    shortName: exam.shortName,
    category: exam.category,
    difficulty: exam.difficulty,
    eligibilitySummary: exam.eligibilitySummary,
    acceptedCollegesCountDemo: exam.acceptedCollegesCountDemo,
    why: why ?? `${exam.shortName} maps directly to your ${input.careerGoal} goal and fits your stated difficulty tolerance. It also keeps options open across ${exam.acceptedCollegesCountDemo || "the relevant professional pathway"} demo-listed institutions or routes.`,
    reasoningRefs,
    advantages: exam.advantages,
    successTips: exam.tips,
    mockDates: exam.mockDates,
    officialUrl: exam.officialUrl,
  };
}

export async function recommendExams(input: ExamNavigatorInput): Promise<AgentOutput<ExamNavigatorResult>> {
  const candidates = rankedCandidates(input);
  const fallback = examNavigatorResultSchema.parse({
    recommendations: candidates.map(({ exam }) => recommendation(exam, input)),
    mode: "rule-based-fallback",
    generatedAt: new Date().toISOString(),
    disclaimer,
  });
  if (!isAiConfigured() || candidates.length === 0) return { result: fallback, reasoningRefs: ["careerGoal", "location", "collegePreference", "difficultyTolerance"], confidenceBand: "high" };

  try {
    const ranked = await generateStructured({
      schema: aiExamSchema,
      schemaName: "pathpilot_exam_ranking",
      system: "You are PathPilot's Exam Planner. Rank only supplied exams and explain why each serves the student's goal over alternatives. Never generate or restate dates. Never invent eligibility, institution counts, or tips. Cite supplied input field names only.",
      user: JSON.stringify({ input, candidates: candidates.map(({ exam, score }) => ({ examId: exam.id, name: exam.name, category: exam.category, deterministicScore: score, advantages: exam.advantages })) }),
    });
    if (!ranked) return { result: fallback, reasoningRefs: ["careerGoal", "difficultyTolerance"], confidenceBand: "high" };
    const map = new Map(candidates.map(({ exam }) => [exam.id, exam]));
    const valid = ranked.ranked.filter((item, index, array) => map.has(item.examId) && array.findIndex((candidate) => candidate.examId === item.examId) === index);
    if (valid.length !== candidates.length) throw new Error("Exam Planner returned an invalid exam set.");
    const result = examNavigatorResultSchema.parse({ recommendations: valid.map((item) => recommendation(map.get(item.examId)!, input, item.why, item.reasoningRefs)), mode: "hybrid-ai", generatedAt: new Date().toISOString(), disclaimer });
    return { result, reasoningRefs: Array.from(new Set(result.recommendations.flatMap((exam) => exam.reasoningRefs))), confidenceBand: "high" };
  } catch {
    return { result: fallback, reasoningRefs: ["careerGoal", "location", "collegePreference", "difficultyTolerance"], confidenceBand: "high" };
  }
}
