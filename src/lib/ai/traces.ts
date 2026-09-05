import "server-only";

import { createHash } from "node:crypto";

import { getDb } from "@/lib/db";
import { aiTraces } from "@/lib/db/schema";
import type { GuidanceTrace } from "@/lib/ai/orchestrator";

export function hashGuidanceInput(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function saveGuidanceTrace({
  userId,
  input,
  trace,
  reasoningRefs,
  confidenceBand,
}: {
  userId: string;
  input: string;
  trace: GuidanceTrace;
  reasoningRefs: string[];
  confidenceBand?: string;
}) {
  await getDb().insert(aiTraces).values({
    id: trace.traceId,
    userId,
    graph: trace.graph,
    route: trace.route,
    promptVersion: trace.promptVersion,
    providerModel: trace.mode === "ai" ? process.env.AI_MODEL_STRONG ?? "gpt-5.6-terra" : undefined,
    inputHash: hashGuidanceInput(input),
    evidenceRefs: reasoningRefs,
    confidenceBand,
    status: trace.mode === "ai" ? "succeeded" : "fallback",
    createdAt: new Date(),
  });
}
