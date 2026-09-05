import { z } from "zod";
import {
  isStudentJourney,
  studentJourneys,
  type StudentJourney,
} from "@/features/student-journey/config";

export const workStyleSchema = z.object({
  collaboration: z.number().int().min(1).max(5),
  structure: z.number().int().min(1).max(5),
  creativity: z.number().int().min(1).max(5),
  analysis: z.number().int().min(1).max(5),
  people: z.number().int().min(1).max(5),
  field: z.number().int().min(1).max(5),
  risk: z.number().int().min(1).max(5),
  pace: z.number().int().min(1).max(5),
});

export const onboardingProfileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  city: z.string().trim().min(2, "Enter your city."),
  currentStage: z.enum([
    "class-10",
    "class-11-12",
    "college",
    "graduate",
    "early-career",
  ]),
  interests: z.array(z.string()).min(2, "Choose at least two interests."),
  favoriteSubjects: z
    .array(z.string())
    .min(2, "Choose at least two subjects."),
  hobbies: z.array(z.string()).min(1, "Choose at least one hobby."),
  workStyle: workStyleSchema,
  preferredWorkMode: z.enum(["solo", "team", "balanced"]),
  preferredEnvironment: z.enum(["indoor", "field", "hybrid"]),
  preferredStructure: z.enum(["structured", "flexible", "balanced"]),
  salaryExpectation: z.enum(["3-6L", "6-12L", "12-20L", "20L+"]),
  locationPref: z.enum(["home-city", "anywhere-india", "remote", "global"]),
  studyPref: z.enum(["theory", "applied", "balanced"]),
  higherStudiesLean: z.number().int().min(0).max(100),
  studyBudget: z.enum(["low", "medium", "high"]),
  learningStyle: z.enum(["video", "reading", "hands-on", "blended"]),
  strengths: z.array(z.string()).min(2, "Choose at least two strengths."),
  weaknesses: z.array(z.string()).min(1, "Choose at least one growth area."),
});

export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;

export const studentJourneySchema = z.enum(studentJourneys);

const assessmentMetaSchema = z.object({
  assessmentVersion: z.literal(1),
});

export const streamExplorerAnswersSchema = z.object({
  preferredStreams: z.array(z.enum(["science", "commerce", "humanities", "creative-vocational", "still-exploring"])).min(1),
  learningStyle: z.enum(["visual", "practice", "discussion", "structured"]),
  familyLocationConstraint: z.enum(["local-school", "open-to-options", "need-guidance"]),
  confidence: z.number().int().min(1).max(5),
});

export const educationPlannerAnswersSchema = z.object({
  academicPosition: z.enum(["class-11", "class-12", "after-class-12"]),
  degreeInterests: z.array(z.string().min(2)).min(1),
  entranceExamAppetite: z.enum(["focused", "balanced", "exploring", "not-sure"]),
  collegePriority: z.enum(["course-fit", "budget", "location", "rankings", "campus-life"]),
  decisionTimeline: z.enum(["this-year", "next-year", "exploring"]),
});

export const careerLaunchAnswersSchema = z.object({
  academicContext: z.enum(["first-second-year", "pre-final-year", "final-year", "graduate"]),
  degreeOrBranch: z.string().trim().min(2),
  evidenceReadiness: z.enum(["starting", "some-projects", "portfolio-ready"]),
  primaryDirection: z.enum(["job", "internship", "higher-studies", "comparing"]),
  opportunityPreference: z.enum(["home-city", "anywhere-india", "remote", "global"]),
});

export const studentAssessmentSubmissionSchema = z.discriminatedUnion("studentJourney", [
  z.object({ studentJourney: z.literal("stream-explorer"), profile: onboardingProfileSchema, stageAnswers: streamExplorerAnswersSchema }).merge(assessmentMetaSchema),
  z.object({ studentJourney: z.literal("education-planner"), profile: onboardingProfileSchema, stageAnswers: educationPlannerAnswersSchema }).merge(assessmentMetaSchema),
  z.object({ studentJourney: z.literal("career-launch"), profile: onboardingProfileSchema, stageAnswers: careerLaunchAnswersSchema }).merge(assessmentMetaSchema),
]);

export type StudentAssessmentSubmission = z.infer<typeof studentAssessmentSubmissionSchema>;
export type StudentStageAnswers = StudentAssessmentSubmission["stageAnswers"];

export const stagePlanSchema = z.object({
  journey: studentJourneySchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  priorities: z.array(z.object({ title: z.string().min(1), detail: z.string().min(1), href: z.string().startsWith("/") })).length(3),
  generatedAt: z.string().datetime(),
});

export type StagePlan = z.infer<typeof stagePlanSchema>;

export function normalizeStudentJourney(value: string | null | undefined): StudentJourney {
  return isStudentJourney(value) ? value : "education-planner";
}

export const careerMatchSchema = z.object({
  careerKey: z.string().min(1),
  careerName: z.string().min(1),
  family: z.string().min(1),
  compatibility: z.number().int().min(0).max(100),
  why: z.string().min(1),
  reasoningRefs: z.array(z.string().min(1)).min(1),
  salaryBandEntry: z.string().min(1),
  salaryBandMid: z.string().min(1),
  salaryBandSenior: z.string().min(1),
  demandTrend: z.enum(["growing", "stable", "declining"]),
  description: z.string().min(1),
  starterSkills: z.array(z.string()).min(2),
});

export const careerDiscoveryResultSchema = z.object({
  matches: z.array(careerMatchSchema).length(5),
  mode: z.enum(["ai", "deterministic-fallback"]),
  candidateCount: z.number().int().positive(),
  generatedAt: z.iso.datetime(),
});

export type CareerMatchResult = z.infer<typeof careerMatchSchema>;
export type CareerDiscoveryResult = z.infer<typeof careerDiscoveryResultSchema>;

export const collegeFinderInputSchema = z.object({
  annualBudget: z.number().int().min(25_000).max(1_500_000),
  state: z.string().trim().min(1),
  city: z.string().trim(),
  ownership: z.enum(["any", "government", "private"]),
  hostel: z.enum(["required", "preferred", "not-needed"]),
  placementPriority: z.number().int().min(1).max(5),
  branch: z.string().trim().min(1),
  scholarshipNeed: z.boolean(),
  boardPercentile: z.number().min(35).max(100),
  cultureTags: z.array(z.enum(["sports", "tech-clubs", "quiet-academic", "cultural"])),
});

export const collegeMatchSchema = z.object({
  collegeId: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  ownership: z.enum(["government", "private"]),
  tier: z.enum(["1", "2", "3"]),
  compatibility: z.number().int().min(0).max(100),
  why: z.string().min(1),
  reasoningRefs: z.array(z.string().min(1)).min(1),
  estimatedAnnualCost: z.number().int().nonnegative().nullable(),
  hostelAvailable: z.boolean().nullable(),
  scholarshipAvailable: z.boolean().nullable(),
  branches: z.array(z.string().min(1)),
  /** Admissions and placement fields are deliberately null until an official source supplies them. */
  boardCutoffDemo: z.number().min(0).max(100).nullable(),
  placementRateDemo: z.number().int().min(0).max(100).nullable(),
  medianPackageDemo: z.string().nullable(),
  cultureTags: z.array(z.string().min(1)),
  overview: z.string().min(1),
  sourceUrl: z.url().nullable(),
  lastVerifiedAt: z.iso.datetime().nullable(),
  officialRank: z.number().int().positive().nullable(),
  rankingYear: z.number().int().positive().nullable(),
  dataMode: z.enum(["official", "demo"]),
});

export const collegeFinderResultSchema = z.object({
  matches: z.array(collegeMatchSchema).max(8),
  mode: z.enum(["official", "ai", "deterministic-fallback"]),
  candidateCount: z.number().int().nonnegative(),
  generatedAt: z.iso.datetime(),
  disclaimer: z.string().min(1),
});

export type CollegeFinderInput = z.infer<typeof collegeFinderInputSchema>;
export type CollegeMatchResult = z.infer<typeof collegeMatchSchema>;
export type CollegeFinderResult = z.infer<typeof collegeFinderResultSchema>;

export const examNavigatorInputSchema = z.object({
  careerGoal: z.string().trim().min(2),
  location: z.string().trim().min(1),
  annualBudget: z.number().int().min(25_000).max(1_500_000),
  collegePreference: z.enum(["any", "government", "private"]),
  difficultyTolerance: z.number().int().min(1).max(5),
});

export const examRecommendationSchema = z.object({
  examId: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.number().int().min(1).max(5),
  eligibilitySummary: z.string().min(1),
  acceptedCollegesCountDemo: z.number().int().nonnegative(),
  why: z.string().min(1),
  reasoningRefs: z.array(z.string().min(1)).min(1),
  advantages: z.array(z.string().min(1)).min(2),
  successTips: z.array(z.string().min(1)).length(3),
  mockDates: z.object({
    application: z.string().min(1),
    exam: z.string().min(1),
    result: z.string().min(1),
  }),
  officialUrl: z.url(),
});

export const examNavigatorResultSchema = z.object({
  recommendations: z.array(examRecommendationSchema).max(8),
  mode: z.enum(["hybrid-ai", "rule-based-fallback"]),
  generatedAt: z.iso.datetime(),
  disclaimer: z.literal("Mock dates - verify every date on the official exam website."),
});

export type ExamNavigatorInput = z.infer<typeof examNavigatorInputSchema>;
export type ExamRecommendation = z.infer<typeof examRecommendationSchema>;
export type ExamNavigatorResult = z.infer<typeof examNavigatorResultSchema>;

export const degreeAdvisorInputSchema = z.object({
  shortlistedCareers: z.array(z.string().trim().min(1)).min(1).max(5),
  totalBudget: z.number().int().min(50_000).max(6_000_000),
  timeHorizon: z.enum(["fast", "balanced", "deep"]),
});

export const degreeComparisonSchema = z.object({
  degreeKey: z.string().min(1),
  degreeType: z.string().min(1),
  durationYears: z.number().positive(),
  averageTotalCost: z.number().int().positive(),
  typicalEntrySalary: z.string().min(1),
  topCareerOutcomes: z.array(z.string().min(1)).min(2),
  flexibilityScore: z.number().int().min(1).max(5),
  fitScore: z.number().int().min(0).max(100),
  roiNote: z.string().min(1),
  pros: z.array(z.string().min(1)).min(2),
  cons: z.array(z.string().min(1)).min(1),
  reasoningRefs: z.array(z.string().min(1)).min(1),
});

export const degreeAdvisorResultSchema = z.object({
  recommendation: z.object({
    degreeKey: z.string().min(1),
    headline: z.string().min(1),
    narrative: z.string().min(1),
    reasoningRefs: z.array(z.string().min(1)).min(1),
  }),
  comparisons: z.array(degreeComparisonSchema).length(6),
  mode: z.enum(["ai", "deterministic-fallback"]),
  generatedAt: z.iso.datetime(),
});

export type DegreeAdvisorInput = z.infer<typeof degreeAdvisorInputSchema>;
export type DegreeComparison = z.infer<typeof degreeComparisonSchema>;
export type DegreeAdvisorResult = z.infer<typeof degreeAdvisorResultSchema>;

export const decisionRecordSchema = z.object({
  id: z.string().min(1),
  targetType: z.enum([
    "career",
    "college",
    "exam",
    "degree",
    "opportunity",
    "project",
  ]),
  targetId: z.string().min(1),
  targetLabel: z.string().min(1),
  action: z.enum(["accepted", "rejected", "snoozed"]),
  reason: z.string().optional(),
  snoozedUntil: z.iso.datetime().optional(),
  createdAt: z.iso.datetime(),
});

export type DecisionRecord = z.infer<typeof decisionRecordSchema>;

export const roadmapMilestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  phase: z.string().min(1),
  status: z.enum(["upcoming", "active", "done"]),
  estWeeks: z.number().int().positive(),
  orderIndex: z.number().int().nonnegative(),
  skillTag: z.string().min(1),
});

export const roadmapPlanSchema = z.object({
  id: z.string().min(1),
  careerKey: z.string().min(1),
  careerName: z.string().min(1),
  version: z.number().int().positive(),
  changelog: z.string().min(1),
  progressPct: z.number().int().min(0).max(100),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  milestones: z.array(roadmapMilestoneSchema).min(6),
  mode: z.enum(["ai", "deterministic-fallback"]),
});

export type RoadmapMilestone = z.infer<typeof roadmapMilestoneSchema>;
export type RoadmapPlan = z.infer<typeof roadmapPlanSchema>;

export const learningResourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  provider: z.string().min(1),
  type: z.enum(["course", "docs", "book", "practice", "video", "certificate"]),
  url: z.url(),
  free: z.boolean(),
  skillTag: z.string().min(1),
  styleTags: z.array(z.enum(["video", "reading", "hands-on", "blended"])),
  estMinutes: z.number().int().positive(),
  whyRelevant: z.string().min(1),
  relevance: z.number().int().min(0).max(100),
});

export type LearningResourceResult = z.infer<typeof learningResourceSchema>;

export const progressDimensionKeySchema = z.enum([
  "career-readiness",
  "skills",
  "projects",
  "courses",
  "interview",
  "resume",
  "github",
  "overall",
]);

export const progressDimensionSchema = z.object({
  key: progressDimensionKeySchema,
  label: z.string().min(1),
  value: z.number().int().min(0).max(100),
  delta: z.number().int().min(-100).max(100),
  trend: z.array(z.number().int().min(0).max(100)).length(7),
  detail: z.string().min(1),
  href: z.string().startsWith("/"),
  evidenceMode: z.enum(["live", "mixed", "demo"]),
});

export const progressSnapshotSchema = z.object({
  dimensions: z.array(progressDimensionSchema).length(8),
  activeDays: z.number().int().min(0).max(7),
  completedThisWeek: z.number().int().nonnegative(),
  focusMinutes: z.number().int().nonnegative(),
  generatedAt: z.iso.datetime(),
});

export type ProgressDimension = z.infer<typeof progressDimensionSchema>;
export type ProgressSnapshot = z.infer<typeof progressSnapshotSchema>;

export const healthCategoryKeySchema = z.enum([
  "projects",
  "resume",
  "github",
  "skills-courses",
  "interview",
  "consistency",
  "experience",
]);

export const healthCategorySchema = z.object({
  key: healthCategoryKeySchema,
  label: z.string().min(1),
  score: z.number().int().min(0).max(100),
  weight: z.number().int().min(1).max(100),
  weightedPoints: z.number().min(0).max(100),
  evidence: z.string().min(1),
  evidenceMode: z.enum(["live", "mixed", "demo"]),
  href: z.string().startsWith("/"),
});

export const careerHealthScoreSchema = z.object({
  score: z.number().int().min(0).max(100),
  weeklyDelta: z.number().int().min(-100).max(100),
  level: z.enum(["explorer", "builder", "achiever", "pro"]),
  categories: z.array(healthCategorySchema).length(7),
  weakestCategoryKey: healthCategoryKeySchema,
  narration: z.string().min(1),
  history: z.array(z.number().int().min(0).max(100)).length(7),
  generatedAt: z.iso.datetime(),
});

export type HealthCategoryKey = z.infer<typeof healthCategoryKeySchema>;
export type HealthCategory = z.infer<typeof healthCategorySchema>;
export type CareerHealthScore = z.infer<typeof careerHealthScoreSchema>;

export const missionMilestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  kind: z.enum(["skill", "project", "proof", "career"]),
  weight: z.number().int().min(1).max(100),
  status: z.enum(["upcoming", "active", "done"]),
  sourceRef: z.string().min(1),
});

export const achievementSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  unlocked: z.boolean(),
});

export const missionPlanSchema = z.object({
  id: z.string().min(1),
  goal: z.string().min(2),
  targetType: z.enum(["dream-career", "dream-company"]),
  level: z.enum(["explorer", "builder", "achiever", "pro"]),
  progressPct: z.number().int().min(0).max(100),
  nextMilestoneId: z.string().nullable(),
  milestones: z.array(missionMilestoneSchema).min(5).max(8),
  achievements: z.array(achievementSchema).min(4),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  mode: z.literal("deterministic"),
});

export const missionInputSchema = z.object({
  goal: z.string().trim().min(2).max(100),
  targetType: z.enum(["dream-career", "dream-company"]),
  healthScore: z.number().int().min(0).max(100),
  roadmap: roadmapPlanSchema.nullable().optional(),
  career: careerMatchSchema.nullable().optional(),
});

export type MissionMilestone = z.infer<typeof missionMilestoneSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type MissionPlan = z.infer<typeof missionPlanSchema>;
export type MissionInput = z.infer<typeof missionInputSchema>;

export const opportunityCategorySchema = z.enum([
  "internship",
  "hackathon",
  "scholarship",
  "competition",
  "open-source",
  "event",
]);

export const radarOpportunitySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: opportunityCategorySchema,
  organizerLabel: z.string().min(1),
  format: z.enum(["online", "in-person", "hybrid"]),
  location: z.string().min(1),
  skillLevel: z.enum(["beginner", "intermediate", "advanced", "all-levels"]),
  typicalTiming: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string().min(1)).min(2),
  relevance: z.number().int().min(0).max(100),
  whyRelevant: z.string().min(1),
  reasoningRefs: z.array(z.string().min(1)).min(1),
  isDemo: z.boolean(),
  sourceUrl: z.url().nullable().optional(),
  applicationUrl: z.url().nullable().optional(),
  deadlineAt: z.iso.datetime().nullable().optional(),
  lastVerifiedAt: z.iso.datetime().nullable().optional(),
  stipendInr: z.number().int().nonnegative().nullable().optional(),
  duration: z.string().min(1).nullable().optional(),
});

export const radarResultSchema = z.object({
  opportunities: z.array(radarOpportunitySchema),
  mode: z.enum(["official-live", "static-ranked-demo", "official-empty"]),
  generatedAt: z.iso.datetime(),
  disclaimer: z.string().min(1),
});

export type OpportunityCategory = z.infer<typeof opportunityCategorySchema>;
export type RadarOpportunity = z.infer<typeof radarOpportunitySchema>;
export type RadarResult = z.infer<typeof radarResultSchema>;
export type OpportunityAction = "saved" | "dismissed" | "joined";

export const rejectReasons = [
  "Not interested",
  "Too expensive",
  "Parents disagree",
  "Already decided against",
  "Other",
] as const;

export const defaultOnboardingProfile: OnboardingProfile = {
  name: "Aarav Rao",
  city: "Pune",
  currentStage: "class-11-12",
  interests: ["Technology", "Design"],
  favoriteSubjects: ["Mathematics", "Computer Science"],
  hobbies: ["Building things"],
  workStyle: {
    collaboration: 3,
    structure: 4,
    creativity: 4,
    analysis: 5,
    people: 3,
    field: 2,
    risk: 3,
    pace: 4,
  },
  preferredWorkMode: "balanced",
  preferredEnvironment: "indoor",
  preferredStructure: "structured",
  salaryExpectation: "12-20L",
  locationPref: "anywhere-india",
  studyPref: "applied",
  higherStudiesLean: 45,
  studyBudget: "medium",
  learningStyle: "hands-on",
  strengths: ["Problem solving", "Curiosity"],
  weaknesses: ["Public speaking"],
};
