import type { AgentOutput } from "@/lib/ai/schemas";
import { generateCareerDiscovery } from "@/features/pathpilot/career-engine";
import { generateCollegeMatches } from "@/features/pathpilot/college-engine";
import { compareDegrees } from "@/features/pathpilot/degree-engine";
import { recommendExams } from "@/features/pathpilot/exam-engine";
import { retrieveLearningResources } from "@/features/pathpilot/learning-engine";
import { calculateCareerHealth, type HealthEngineInput } from "@/features/pathpilot/health-engine";
import { buildMissionPlan } from "@/features/pathpilot/mission-engine";
import { buildProgressSnapshot, type ProgressEngineInput } from "@/features/pathpilot/progress-engine";
import { rankRadarOpportunities, type RadarEngineInput } from "@/features/pathpilot/radar-engine";
import { generateRoadmap } from "@/features/pathpilot/roadmap-engine";
import type {
  CareerMatchResult,
  CollegeFinderInput,
  DecisionRecord,
  DegreeAdvisorInput,
  ExamNavigatorInput,
  MissionInput,
  OnboardingProfile,
  RoadmapPlan,
} from "@/features/pathpilot/schemas";

export interface ModuleExecutionContext {
  userId: string;
  profileVersion: string;
  decisionMemoryVersion: string;
  requestId: string;
}

export interface PathPilotModuleService<TInput, TResult> {
  execute(input: TInput, context: ModuleExecutionContext): Promise<AgentOutput<TResult>>;
}

export type ModuleServiceKey =
  | "careerDiscovery"
  | "collegeFinder"
  | "examNavigator"
  | "degreeAdvisor"
  | "roadmapGenerator"
  | "learningCoach"
  | "projectMentor"
  | "resumeAnalyzer"
  | "githubAnalyzer"
  | "opportunityFinder"
  | "interviewCoach"
  | "progressDashboard"
  | "careerSimulator"
  | "whatIfSimulator"
  | "careerHealthScore"
  | "opportunityRadar"
  | "studentTimeline"
  | "futureTwin"
  | "decisionMemory"
  | "missionMode"
  | "parentAlignment"
  | "cohortCompass"
  | "localOpportunityGraph"
  | "skillDecayTracker"
  | "microMentorMatching"
  | "narrativePortfolio"
  | "financialRealityPlanner"
  | "confidenceJournal"
  | "dynamicInterviewPanel"
  | "regretMinimizationReport";

export class ModuleNotImplementedError extends Error {
  constructor(public readonly moduleKey: ModuleServiceKey) {
    super(`${moduleKey} has a contract but is not connected yet.`);
    this.name = "ModuleNotImplementedError";
  }
}

export function createPlaceholderModuleService<TInput, TResult>(moduleKey: ModuleServiceKey) {
  return {
    async execute(): Promise<AgentOutput<TResult>> {
      throw new ModuleNotImplementedError(moduleKey);
    },
  } satisfies PathPilotModuleService<TInput, TResult>;
}

export const implementedServices = {
  careerDiscovery: {
    execute(
      input: { profile: OnboardingProfile; decisions?: DecisionRecord[] },
    ) {
      return generateCareerDiscovery(input.profile, input.decisions);
    },
  },
  collegeFinder: {
    execute(input: CollegeFinderInput) {
      return generateCollegeMatches(input);
    },
  },
  examNavigator: {
    execute(input: ExamNavigatorInput) {
      return recommendExams(input);
    },
  },
  degreeAdvisor: {
    execute(input: DegreeAdvisorInput) {
      return compareDegrees(input);
    },
  },
  roadmapGenerator: {
    execute(input: {
      career: CareerMatchResult;
      profile: OnboardingProfile;
      decisions?: DecisionRecord[];
      previous?: RoadmapPlan | null;
    }) {
      return generateRoadmap(input);
    },
  },
  learningCoach: {
    async execute(input: {
      milestone: string;
      skillTag: string;
      learningStyle: OnboardingProfile["learningStyle"];
    }) {
      const result = await retrieveLearningResources(input);
      return {
        result,
        reasoningRefs: ["roadmap.currentMilestone", "learningStyle"],
        confidenceBand: result.mode === "ai" ? "high" : "medium",
      } satisfies AgentOutput<typeof result>;
    },
  },
  decisionMemory: {
    async execute(input: DecisionRecord) {
      return {
        result: input,
        reasoningRefs: ["decisionMemory"],
        confidenceBand: "high",
      } satisfies AgentOutput<DecisionRecord>;
    },
  },
  progressDashboard: {
    async execute(input: ProgressEngineInput) {
      const result = buildProgressSnapshot(input);
      return {
        result,
        reasoningRefs: ["progressSnapshot", "roadmap", "mission"],
        confidenceBand: "high",
      } satisfies AgentOutput<typeof result>;
    },
  },
  careerHealthScore: {
    async execute(input: HealthEngineInput) {
      const result = calculateCareerHealth(input);
      return {
        result,
        reasoningRefs: ["careerHealth.weights", "progressSnapshot"],
        confidenceBand: "high",
      } satisfies AgentOutput<typeof result>;
    },
  },
  missionMode: {
    async execute(input: MissionInput) {
      const result = buildMissionPlan(input);
      return {
        result,
        reasoningRefs: ["careerHealth.level", "roadmap.milestones"],
        confidenceBand: "high",
      } satisfies AgentOutput<typeof result>;
    },
  },
  opportunityRadar: {
    async execute(input: RadarEngineInput) {
      const result = rankRadarOpportunities(input);
      return {
        result,
        reasoningRefs: ["profile.interests", "profile.learningStyle", "selectedCareer"],
        confidenceBand: "medium",
      } satisfies AgentOutput<typeof result>;
    },
  },
} as const;

export const placeholderServices = {
  projectMentor: createPlaceholderModuleService("projectMentor"),
  resumeAnalyzer: createPlaceholderModuleService("resumeAnalyzer"),
  githubAnalyzer: createPlaceholderModuleService("githubAnalyzer"),
  opportunityFinder: createPlaceholderModuleService("opportunityFinder"),
  interviewCoach: createPlaceholderModuleService("interviewCoach"),
  careerSimulator: createPlaceholderModuleService("careerSimulator"),
  whatIfSimulator: createPlaceholderModuleService("whatIfSimulator"),
  studentTimeline: createPlaceholderModuleService("studentTimeline"),
  futureTwin: createPlaceholderModuleService("futureTwin"),
  parentAlignment: createPlaceholderModuleService("parentAlignment"),
  cohortCompass: createPlaceholderModuleService("cohortCompass"),
  localOpportunityGraph: createPlaceholderModuleService("localOpportunityGraph"),
  skillDecayTracker: createPlaceholderModuleService("skillDecayTracker"),
  microMentorMatching: createPlaceholderModuleService("microMentorMatching"),
  narrativePortfolio: createPlaceholderModuleService("narrativePortfolio"),
  financialRealityPlanner: createPlaceholderModuleService("financialRealityPlanner"),
  confidenceJournal: createPlaceholderModuleService("confidenceJournal"),
  dynamicInterviewPanel: createPlaceholderModuleService("dynamicInterviewPanel"),
  regretMinimizationReport: createPlaceholderModuleService("regretMinimizationReport"),
} satisfies Partial<Record<ModuleServiceKey, PathPilotModuleService<unknown, unknown>>>;
