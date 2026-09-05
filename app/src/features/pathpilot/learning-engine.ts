import { z } from "zod";

import { generateStructured, isAiConfigured } from "@/lib/ai/openai";
import { learningResourceBank } from "@/lib/static-data/resources";
import {
  learningResourceSchema,
  type LearningResourceResult,
  type OnboardingProfile,
} from "./schemas";

const rerankSchema = z.object({
  ranked: z
    .array(
      z.object({
        id: z.string().min(1),
        relevance: z.number().int().min(0).max(100),
        whyRelevant: z.string().min(20).max(180),
      }),
    )
    .min(3)
    .max(8),
});

function words(value: string) {
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

function sharedWords(a: string, b: string) {
  const aWords = words(a);
  return Array.from(words(b)).filter((word) => aWords.has(word)).length;
}

export async function retrieveLearningResources({
  milestone,
  skillTag,
  learningStyle = "blended",
}: {
  milestone: string;
  skillTag: string;
  learningStyle?: OnboardingProfile["learningStyle"];
}): Promise<{ resources: LearningResourceResult[]; mode: "ai" | "deterministic-fallback" }> {
  const candidates = learningResourceBank
    .map((resource) => {
      const skillMatches = Math.max(
        ...resource.skillTags.map((tag) => sharedWords(skillTag, tag)),
        0,
      );
      const milestoneMatches = Math.max(
        ...resource.skillTags.map((tag) => sharedWords(milestone, tag)),
        0,
      );
      const styleMatch = resource.styleTags.includes(learningStyle) ? 1 : 0;
      return {
        resource,
        score: 54 + skillMatches * 18 + milestoneMatches * 10 + styleMatch * 8,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const fallback = candidates.slice(0, 6).map(({ resource, score }) =>
    learningResourceSchema.parse({
      ...resource,
      skillTag,
      relevance: Math.min(98, score),
      whyRelevant: `Matches the ${skillTag} focus in this milestone and supports a ${learningStyle.replace("-", " ")} learning preference.`,
    }),
  );

  if (!isAiConfigured()) {
    return { resources: fallback, mode: "deterministic-fallback" };
  }

  try {
    const ranked = await generateStructured({
      schema: rerankSchema,
      schemaName: "pathpilot_learning_resources",
      model: process.env.AI_MODEL_FAST ?? "gpt-5.6-luna",
      system:
        "You are PathPilot's Learning Coach. Re-rank only the supplied resources for the exact milestone and learning style. Explain practical relevance in one sentence; do not invent course claims.",
      user: JSON.stringify({ milestone, skillTag, learningStyle, candidates }),
    });
    if (!ranked) return { resources: fallback, mode: "deterministic-fallback" };
    const resourceMap = new Map(
      candidates.map(({ resource }) => [resource.id, resource]),
    );
    const resources = ranked.ranked.flatMap((item) => {
      const resource = resourceMap.get(item.id);
      if (!resource) return [];
      return [learningResourceSchema.parse({ ...resource, skillTag, ...item })];
    });
    if (resources.length < 3) return { resources: fallback, mode: "deterministic-fallback" };
    return { resources, mode: "ai" };
  } catch {
    return { resources: fallback, mode: "deterministic-fallback" };
  }
}
