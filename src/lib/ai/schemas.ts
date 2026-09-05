import { z } from "zod";

export const confidenceBandSchema = z.enum(["low", "medium", "high"]);

export const agentOutputSchema = z.object({
  result: z.unknown(),
  reasoningRefs: z.array(z.string().min(1)).min(1),
  confidenceBand: confidenceBandSchema.optional(),
});

export type AgentOutput<T = unknown> = Omit<z.infer<typeof agentOutputSchema>, "result"> & {
  result: T;
};

export const pathPilotStateSchema = z.object({
  profile: z.record(z.string(), z.unknown()),
  decisionMemory: z.array(z.record(z.string(), z.unknown())),
  moduleContext: z.record(z.string(), z.unknown()),
  conversation: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    }),
  ),
});

export type PathPilotState = z.infer<typeof pathPilotStateSchema>;
