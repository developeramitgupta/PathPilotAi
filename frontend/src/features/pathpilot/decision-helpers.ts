import type { DecisionRecord } from "./schemas";

export function createAcceptedDecision(targetType: "college" | "exam" | "degree", targetId: string, targetLabel: string): DecisionRecord {
  return {
    id: crypto.randomUUID(),
    targetType,
    targetId,
    targetLabel,
    action: "accepted",
    createdAt: new Date().toISOString(),
  };
}
