import type {
  CareerHealthScore,
  MissionPlan,
  OnboardingProfile,
  RoadmapPlan,
} from "./schemas";

export interface HealthEngineInput {
  profile: OnboardingProfile;
  roadmap?: RoadmapPlan | null;
  mission?: MissionPlan | null;
  resourceProgress?: Record<string, "saved" | "started" | "done">;
  decisionCount?: number;
  now?: string;
}

const weights = {
  projects: 20,
  resume: 15,
  github: 15,
  "skills-courses": 15,
  interview: 15,
  consistency: 10,
  experience: 10,
} as const;

export function getCareerLevel(score: number): CareerHealthScore["level"] {
  if (score <= 25) return "explorer";
  if (score <= 50) return "builder";
  if (score <= 75) return "achiever";
  return "pro";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function historyFor(score: number) {
  const offsets = [-11, -9, -8, -5, -6, -3, 0];
  return offsets.map((offset) => clamp(score + offset));
}

export function calculateCareerHealth(input: HealthEngineInput): CareerHealthScore {
  const roadmapMilestones = input.roadmap?.milestones ?? [];
  const missionMilestones = input.mission?.milestones ?? [];
  const roadmapDone = roadmapMilestones.filter((item) => item.status === "done").length;
  const missionDone = missionMilestones.filter((item) => item.status === "done");
  const missionProjects = missionDone.filter((item) => item.kind === "project").length;
  const missionCareerProof = missionDone.filter(
    (item) => item.kind === "proof" || item.kind === "career",
  ).length;
  const resourceStates = Object.values(input.resourceProgress ?? {});
  const resourcesDone = resourceStates.filter((state) => state === "done").length;
  const resourcesStarted = resourceStates.filter((state) => state === "started").length;

  // Modules scheduled for later milestones contribute a clearly labeled demo baseline.
  // Live activity from Roadmap, Learning, Mission, and Decision Memory increases it.
  const scores = {
    projects: clamp(48 + missionProjects * 14 + Math.min(roadmapDone, 3) * 3),
    resume: 68,
    github: 72,
    "skills-courses": clamp(
      42 + roadmapDone * 6 + resourcesDone * 7 + resourcesStarted * 3,
    ),
    interview: 56,
    consistency: clamp(
      58 + Math.min(roadmapDone + missionDone.length + resourcesDone, 7) * 5,
    ),
    experience: clamp(35 + missionCareerProof * 16 + Math.max(0, roadmapDone - 3) * 4),
  } as const;

  const categories: CareerHealthScore["categories"] = [
    {
      key: "projects",
      label: "Projects",
      score: scores.projects,
      weight: weights.projects,
      weightedPoints: Number(((scores.projects * weights.projects) / 100).toFixed(1)),
      evidence: missionProjects
        ? `${missionProjects} mission project milestone${missionProjects === 1 ? "" : "s"} completed`
        : "Demo project baseline until Project Mentor is connected",
      evidenceMode: missionProjects ? "mixed" : "demo",
      href: "/projects",
    },
    {
      key: "resume",
      label: "Resume",
      score: scores.resume,
      weight: weights.resume,
      weightedPoints: Number(((scores.resume * weights.resume) / 100).toFixed(1)),
      evidence: "Demo analyzer score until Resume Analyzer is connected",
      evidenceMode: "demo",
      href: "/resume",
    },
    {
      key: "github",
      label: "GitHub",
      score: scores.github,
      weight: weights.github,
      weightedPoints: Number(((scores.github * weights.github) / 100).toFixed(1)),
      evidence: "Demo public-profile score until GitHub Analyzer is connected",
      evidenceMode: "demo",
      href: "/github",
    },
    {
      key: "skills-courses",
      label: "Skills & courses",
      score: scores["skills-courses"],
      weight: weights["skills-courses"],
      weightedPoints: Number(
        ((scores["skills-courses"] * weights["skills-courses"]) / 100).toFixed(1),
      ),
      evidence: `${roadmapDone} roadmap milestones and ${resourcesDone} resources completed`,
      evidenceMode: roadmapDone || resourcesDone ? "live" : "demo",
      href: "/learning",
    },
    {
      key: "interview",
      label: "Interview",
      score: scores.interview,
      weight: weights.interview,
      weightedPoints: Number(((scores.interview * weights.interview) / 100).toFixed(1)),
      evidence: "Demo practice score until Interview Coach is connected",
      evidenceMode: "demo",
      href: "/interview",
    },
    {
      key: "consistency",
      label: "Consistency",
      score: scores.consistency,
      weight: weights.consistency,
      weightedPoints: Number(
        ((scores.consistency * weights.consistency) / 100).toFixed(1),
      ),
      evidence: `${roadmapDone + missionDone.length + resourcesDone} tracked completions across active modules`,
      evidenceMode: roadmapDone || missionDone.length || resourcesDone ? "live" : "demo",
      href: "/dashboard",
    },
    {
      key: "experience",
      label: "Experience",
      score: scores.experience,
      weight: weights.experience,
      weightedPoints: Number(((scores.experience * weights.experience) / 100).toFixed(1)),
      evidence: missionCareerProof
        ? `${missionCareerProof} career-proof milestone${missionCareerProof === 1 ? "" : "s"} completed`
        : "Demo experience baseline until internship logging is connected",
      evidenceMode: missionCareerProof ? "mixed" : "demo",
      href: "/opportunities",
    },
  ];

  const score = clamp(
    categories.reduce((total, category) => total + category.weightedPoints, 0),
  );
  const history = historyFor(score);
  const weakest = categories.reduce((current, category) =>
    category.score < current.score ? category : current,
  );

  return {
    score,
    weeklyDelta: score - history[0],
    level: getCareerLevel(score),
    categories,
    weakestCategoryKey: weakest.key,
    narration: `${input.profile.name.split(" ")[0]}, ${weakest.label.toLowerCase()} is your clearest next lever—one focused action there will improve the whole readiness picture.`,
    history,
    generatedAt: input.now ?? new Date().toISOString(),
  };
}
