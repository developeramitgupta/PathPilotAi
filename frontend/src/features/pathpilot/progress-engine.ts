import type {
  CareerHealthScore,
  MissionPlan,
  OnboardingProfile,
  ProgressDimension,
  ProgressSnapshot,
  RoadmapPlan,
} from "./schemas";

export interface ProgressEngineInput {
  profile: OnboardingProfile;
  health: CareerHealthScore;
  roadmap?: RoadmapPlan | null;
  mission?: MissionPlan | null;
  resourceProgress?: Record<string, "saved" | "started" | "done">;
  decisionCount?: number;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function trend(value: number, shape: number[]) {
  return shape.map((offset) => clamp(value + offset));
}

export function buildProgressSnapshot(input: ProgressEngineInput): ProgressSnapshot {
  const roadmapDone = input.roadmap?.milestones.filter((item) => item.status === "done").length ?? 0;
  const roadmapTotal = input.roadmap?.milestones.length ?? 0;
  const missionDone = input.mission?.milestones.filter((item) => item.status === "done").length ?? 0;
  const resourceStates = Object.values(input.resourceProgress ?? {});
  const coursesDone = resourceStates.filter((state) => state === "done").length;
  const coursesStarted = resourceStates.filter((state) => state === "started").length;
  const healthByKey = new Map(input.health.categories.map((category) => [category.key, category]));
  const skillsValue = healthByKey.get("skills-courses")?.score ?? 0;
  const projectsValue = healthByKey.get("projects")?.score ?? 0;
  const interviewValue = healthByKey.get("interview")?.score ?? 0;
  const resumeValue = healthByKey.get("resume")?.score ?? 0;
  const githubValue = healthByKey.get("github")?.score ?? 0;
  const careerReadiness = clamp(
    (input.roadmap?.progressPct ?? 18) * 0.45 +
      (input.mission?.progressPct ?? 12) * 0.35 +
      Math.min(input.decisionCount ?? 0, 5) * 4 +
      16,
  );
  const coursesValue = clamp(38 + coursesDone * 12 + coursesStarted * 6 + roadmapDone * 2);

  const dimensions: ProgressDimension[] = [
    {
      key: "career-readiness",
      label: "Career readiness",
      value: careerReadiness,
      delta: Math.max(1, roadmapDone + missionDone),
      trend: trend(careerReadiness, [-14, -12, -10, -7, -8, -4, 0]),
      detail: `${roadmapDone}/${roadmapTotal || 6} roadmap milestones completed`,
      href: "/roadmap",
      evidenceMode: roadmapTotal ? "live" : "demo",
    },
    {
      key: "skills",
      label: "Skills",
      value: skillsValue,
      delta: Math.max(1, roadmapDone + coursesDone),
      trend: trend(skillsValue, [-13, -10, -11, -7, -5, -3, 0]),
      detail: `${roadmapDone} skill milestones completed`,
      href: "/learning",
      evidenceMode: roadmapDone || coursesDone ? "live" : "demo",
    },
    {
      key: "projects",
      label: "Projects",
      value: projectsValue,
      delta: missionDone ? 5 : 2,
      trend: trend(projectsValue, [-10, -10, -7, -6, -4, -3, 0]),
      detail: missionDone ? `${missionDone} mission milestones shipped` : "1 demo project in progress",
      href: "/projects",
      evidenceMode: missionDone ? "mixed" : "demo",
    },
    {
      key: "courses",
      label: "Courses",
      value: coursesValue,
      delta: Math.max(1, coursesDone * 3 + coursesStarted),
      trend: trend(coursesValue, [-16, -13, -11, -9, -6, -4, 0]),
      detail: `${coursesDone} completed, ${coursesStarted} in progress`,
      href: "/learning",
      evidenceMode: resourceStates.length ? "live" : "demo",
    },
    {
      key: "interview",
      label: "Interview",
      value: interviewValue,
      delta: 3,
      trend: trend(interviewValue, [-7, -5, -6, -4, -3, -1, 0]),
      detail: "Demo practice baseline",
      href: "/interview",
      evidenceMode: "demo",
    },
    {
      key: "resume",
      label: "Resume",
      value: resumeValue,
      delta: 6,
      trend: trend(resumeValue, [-12, -10, -8, -8, -5, -2, 0]),
      detail: "Demo analyzer score",
      href: "/resume",
      evidenceMode: "demo",
    },
    {
      key: "github",
      label: "GitHub",
      value: githubValue,
      delta: 4,
      trend: trend(githubValue, [-9, -7, -7, -5, -3, -2, 0]),
      detail: "Demo public-profile activity",
      href: "/github",
      evidenceMode: "demo",
    },
    {
      key: "overall",
      label: "Overall",
      value: input.health.score,
      delta: input.health.weeklyDelta,
      trend: input.health.history,
      detail: "Weighted Career Health Score",
      href: "/health-score",
      evidenceMode: "mixed",
    },
  ];

  return {
    dimensions,
    activeDays: clamp(Math.min(7, 3 + roadmapDone + Math.min(coursesStarted, 1))),
    completedThisWeek: roadmapDone + missionDone + coursesDone,
    focusMinutes: 135 + roadmapDone * 40 + coursesStarted * 25,
    generatedAt: input.health.generatedAt,
  };
}
