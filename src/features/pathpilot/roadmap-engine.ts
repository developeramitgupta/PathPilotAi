import { randomUUID } from "node:crypto";
import { z } from "zod";

import type { AgentOutput } from "@/lib/ai/schemas";
import { generateStructured, isAiConfigured } from "@/lib/ai/openai";
import type {
  CareerMatchResult,
  DecisionRecord,
  OnboardingProfile,
  RoadmapPlan,
} from "./schemas";
import { roadmapPlanSchema } from "./schemas";

const generatedRoadmapSchema = z.object({
  changelog: z.string().min(20).max(300),
  milestones: z
    .array(
      z.object({
        title: z.string().min(3).max(100),
        description: z.string().min(20).max(300),
        phase: z.string().min(2).max(60),
        estWeeks: z.number().int().min(1).max(52),
        skillTag: z.string().min(2).max(60),
      }),
    )
    .min(6)
    .max(9),
});

function createFallbackMilestones(career: CareerMatchResult) {
  const [firstSkill, secondSkill, thirdSkill] = career.starterSkills;
  return [
    {
      title: `Understand the ${career.careerName} landscape`,
      description: `Map the day-to-day work, education routes, and entry roles connected to ${career.careerName} before committing to a narrow path.`,
      phase: "Orientation",
      estWeeks: 1,
      skillTag: "Career planning",
    },
    {
      title: `Build foundations in ${firstSkill}`,
      description: `Complete a structured beginner pathway and produce short notes or exercises that prove your grasp of ${firstSkill}.`,
      phase: "Foundation",
      estWeeks: 4,
      skillTag: firstSkill,
    },
    {
      title: `Practice ${secondSkill} every week`,
      description: `Use guided exercises to turn ${secondSkill} from theoretical knowledge into a repeatable working habit.`,
      phase: "Skill building",
      estWeeks: 5,
      skillTag: secondSkill,
    },
    {
      title: `Ship a focused ${career.family} project`,
      description: `Create one small project that combines ${firstSkill} and ${thirdSkill}, then document the problem, process, and result.`,
      phase: "Portfolio",
      estWeeks: 4,
      skillTag: "Portfolio building",
    },
    {
      title: "Get feedback from a real audience",
      description: "Share the project with teachers, peers, or practitioners, record the feedback, and make one visible revision.",
      phase: "Validation",
      estWeeks: 2,
      skillTag: "Communication",
    },
    {
      title: `Find an exposure opportunity in ${career.family}`,
      description: "Shortlist an internship, competition, shadowing opportunity, volunteer role, or community project that gives you real context.",
      phase: "Industry exposure",
      estWeeks: 6,
      skillTag: "Employability",
    },
    {
      title: "Prepare your career story",
      description: `Turn your learning and project evidence into a concise introduction that explains why ${career.careerName} fits your direction.`,
      phase: "Interview preparation",
      estWeeks: 2,
      skillTag: "Interview preparation",
    },
  ];
}

function buildPlan({
  career,
  generated,
  previous,
  mode,
}: {
  career: CareerMatchResult;
  generated: z.infer<typeof generatedRoadmapSchema>;
  previous?: RoadmapPlan | null;
  mode: "ai" | "deterministic-fallback";
}) {
  const now = new Date().toISOString();
  const version = previous ? previous.version + 1 : 1;
  const completedTitles = new Set(
    previous?.milestones
      .filter((milestone) => milestone.status === "done")
      .map((milestone) => milestone.title) ?? [],
  );
  const firstIncomplete = generated.milestones.findIndex(
    (milestone) => !completedTitles.has(milestone.title),
  );

  return roadmapPlanSchema.parse({
    id: previous?.id ?? `roadmap_${randomUUID()}`,
    careerKey: career.careerKey,
    careerName: career.careerName,
    version,
    changelog: generated.changelog,
    progressPct: previous?.progressPct ?? 0,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
    mode,
    milestones: generated.milestones.map((milestone, orderIndex) => ({
      ...milestone,
      id: `milestone_${randomUUID()}`,
      orderIndex,
      status: completedTitles.has(milestone.title)
        ? "done"
        : orderIndex === Math.max(0, firstIncomplete)
          ? "active"
          : "upcoming",
    })),
  });
}

export async function generateRoadmap({
  career,
  profile,
  decisions = [],
  previous = null,
}: {
  career: CareerMatchResult;
  profile: OnboardingProfile;
  decisions?: DecisionRecord[];
  previous?: RoadmapPlan | null;
}): Promise<AgentOutput<RoadmapPlan>> {
  const fallbackGenerated = generatedRoadmapSchema.parse({
    changelog: previous
      ? `Version ${previous.version + 1} keeps completed work and updates the remaining milestones using your latest profile and decisions.`
      : `Created your first ${career.careerName} roadmap from your current stage, learning preferences, and starter skills.`,
    milestones: createFallbackMilestones(career),
  });

  if (!isAiConfigured()) {
    return {
      result: buildPlan({
        career,
        generated: fallbackGenerated,
        previous,
        mode: "deterministic-fallback",
      }),
      reasoningRefs: ["currentStage", "learningStyle", "strengths", "decisionMemory"],
      confidenceBand: "medium",
    };
  }

  try {
    const generated = await generateStructured({
      schema: generatedRoadmapSchema,
      schemaName: "pathpilot_career_roadmap",
      system:
        "You are PathPilot's Learning Coach and Career Strategist collaborating on a realistic roadmap for an Indian student. Return 6-9 ordered milestones spanning orientation, skills, a project, industry exposure, interview preparation, and placement readiness. Preserve completed work from the prior roadmap. Do not guarantee outcomes. The changelog must say what changed.",
      user: JSON.stringify({ career, profile, decisions, previous }),
    });
    const result = buildPlan({
      career,
      generated: generated ?? fallbackGenerated,
      previous,
      mode: generated ? "ai" : "deterministic-fallback",
    });
    return {
      result,
      reasoningRefs: ["currentStage", "learningStyle", "strengths", "decisionMemory"],
      confidenceBand: generated ? "high" : "medium",
    };
  } catch {
    return {
      result: buildPlan({
        career,
        generated: fallbackGenerated,
        previous,
        mode: "deterministic-fallback",
      }),
      reasoningRefs: ["currentStage", "learningStyle", "strengths", "decisionMemory"],
      confidenceBand: "medium",
    };
  }
}
