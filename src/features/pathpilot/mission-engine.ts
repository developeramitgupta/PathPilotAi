import type {
  Achievement,
  MissionInput,
  MissionMilestone,
  MissionPlan,
} from "./schemas";
import { getCareerLevel } from "./health-engine";

const milestoneWeights = [16, 15, 22, 18, 16, 13] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function inferKind(phase: string, title: string): MissionMilestone["kind"] {
  const value = `${phase} ${title}`.toLowerCase();
  if (value.includes("project") || value.includes("portfolio")) return "project";
  if (value.includes("interview") || value.includes("placement")) return "career";
  if (value.includes("internship") || value.includes("proof")) return "proof";
  return "skill";
}

function fallbackMilestones(goal: string) {
  return [
    ["Map the target", `Define what strong entry-level evidence for ${goal} looks like.`, "career"],
    ["Strengthen one core skill", "Complete a focused learning sprint and record what you can now do.", "skill"],
    ["Ship a small proof project", "Build a scoped artifact that demonstrates the core skill in context.", "project"],
    ["Publish a case study", "Explain the problem, decisions, feedback, and outcome in a recruiter-friendly story.", "project"],
    ["Practice the role conversation", "Prepare examples and complete a rubric-based mock interview.", "career"],
    ["Create an opportunity loop", "Shortlist relevant programs and make one evidence-led application.", "proof"],
  ] as const;
}

function normalizeMilestones(milestones: MissionMilestone[]) {
  const incomplete = milestones
    .filter((item) => item.status !== "done")
    .toSorted((a, b) => b.weight - a.weight)[0];
  return milestones.map((item) => ({
    ...item,
    status:
      item.status === "done"
        ? ("done" as const)
        : item.id === incomplete?.id
          ? ("active" as const)
          : ("upcoming" as const),
  }));
}

function achievementsFor(
  milestones: MissionMilestone[],
  healthScore: number,
): Achievement[] {
  const completed = milestones.filter((item) => item.status === "done");
  const hasProject = completed.some((item) => item.kind === "project");
  const hasCareerProof = completed.some(
    (item) => item.kind === "proof" || item.kind === "career",
  );
  return [
    {
      key: "first-step",
      title: "Momentum maker",
      description: "Complete the first mission milestone.",
      unlocked: completed.length >= 1,
    },
    {
      key: "first-project",
      title: "First project shipped",
      description: "Complete a project milestone.",
      unlocked: hasProject,
    },
    {
      key: "career-proof",
      title: "Proof over promise",
      description: "Complete a career-proof milestone.",
      unlocked: hasCareerProof,
    },
    {
      key: "health-75",
      title: "Readiness 75+",
      description: "Reach Achiever level on Career Health.",
      unlocked: healthScore >= 75,
    },
    {
      key: "mission-complete",
      title: "Mission complete",
      description: "Complete every weighted milestone.",
      unlocked: completed.length === milestones.length,
    },
  ];
}

export function recalculateMission(
  mission: MissionPlan,
  healthScore: number,
  updatedAt = new Date().toISOString(),
): MissionPlan {
  const milestones = normalizeMilestones(mission.milestones);
  const progressPct = Math.round(
    milestones
      .filter((item) => item.status === "done")
      .reduce((total, item) => total + item.weight, 0),
  );
  const nextMilestone = milestones.find((item) => item.status === "active") ?? null;
  return {
    ...mission,
    level: getCareerLevel(healthScore),
    progressPct,
    nextMilestoneId: nextMilestone?.id ?? null,
    milestones,
    achievements: achievementsFor(milestones, healthScore),
    updatedAt,
  };
}

export function buildMissionPlan(
  input: MissionInput,
  now = new Date().toISOString(),
): MissionPlan {
  const missionKey = slugify(input.goal) || "career-mission";
  const roadmapItems = input.roadmap?.milestones.slice(0, 6);
  const milestones: MissionMilestone[] = roadmapItems?.length === 6
    ? roadmapItems.map((item, index) => ({
        id: `mission-${missionKey}-${index + 1}`,
        title: item.title,
        description: item.description,
        kind: inferKind(item.phase, item.title),
        weight: milestoneWeights[index],
        status: item.status,
        sourceRef: `roadmap.${item.id}`,
      }))
    : fallbackMilestones(input.goal).map(([title, description, kind], index) => ({
        id: `mission-${missionKey}-${index + 1}`,
        title,
        description,
        kind,
        weight: milestoneWeights[index],
        status: index === 0 ? ("active" as const) : ("upcoming" as const),
        sourceRef: `missionGap.${kind}.${index + 1}`,
      }));

  return recalculateMission(
    {
      id: `mission-${missionKey}`,
      goal: input.goal,
      targetType: input.targetType,
      level: getCareerLevel(input.healthScore),
      progressPct: 0,
      nextMilestoneId: null,
      milestones,
      achievements: [],
      createdAt: now,
      updatedAt: now,
      mode: "deterministic",
    },
    input.healthScore,
    now,
  );
}

export function toggleMissionMilestone(
  mission: MissionPlan,
  milestoneId: string,
  healthScore: number,
) {
  const milestones = mission.milestones.map((item) =>
    item.id === milestoneId
      ? { ...item, status: item.status === "done" ? ("active" as const) : ("done" as const) }
      : item,
  );
  return recalculateMission({ ...mission, milestones }, healthScore);
}
