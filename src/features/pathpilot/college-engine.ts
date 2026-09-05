import { getLocalCollegeMatches } from "@/features/verified-data/server/local-catalogue";
import type { AgentOutput } from "@/lib/ai/schemas";

import type { CollegeFinderInput, CollegeFinderResult } from "./schemas";

/**
 * The bundled reviewed catalogue is the public default. It has complete fee
 * fields and must take priority over older database records that are missing
 * costs, so a budget is always a real hard filter.
 */
export async function generateCollegeMatches(input: CollegeFinderInput): Promise<AgentOutput<CollegeFinderResult>> {
  const result = getLocalCollegeMatches(input);
  return {
    result,
    reasoningRefs: ["annualBudget", "state", "programme", "officialSource"],
    confidenceBand: "high",
  };
}
