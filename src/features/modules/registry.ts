export type ModuleStage = "mvp" | "future";
export type ModuleStatus = "foundation" | "available" | "next" | "planned";

export interface ModuleDefinition {
  slug: string;
  title: string;
  purpose: string;
  stage: ModuleStage;
  status: ModuleStatus;
  milestone: number;
}

export const moduleRegistry: ModuleDefinition[] = [
  { slug: "dashboard", title: "Progress Dashboard", purpose: "Aggregate readiness, activity, and next actions in one home screen.", stage: "mvp", status: "available", milestone: 3 },
  { slug: "career-discovery", title: "Career Discovery", purpose: "Rank explained career matches from the student profile.", stage: "mvp", status: "available", milestone: 2 },
  { slug: "colleges", title: "Smart College Finder", purpose: "Rank colleges by constraints and personal fit.", stage: "mvp", status: "available", milestone: 2 },
  { slug: "exams", title: "Entrance Exam Navigator", purpose: "Recommend the exams that actually serve a chosen goal.", stage: "mvp", status: "available", milestone: 2 },
  { slug: "degrees", title: "Degree Advisor", purpose: "Compare degree paths on cost, duration, outcomes, and fit.", stage: "mvp", status: "available", milestone: 2 },
  { slug: "roadmap", title: "Career Roadmap", purpose: "Maintain a versioned, evolving milestone plan.", stage: "mvp", status: "available", milestone: 2 },
  { slug: "learning", title: "Learning Coach", purpose: "Retrieve resources relevant to the current milestone.", stage: "mvp", status: "available", milestone: 2 },
  { slug: "projects", title: "Project Mentor", purpose: "Suggest portfolio projects sized to the student’s level.", stage: "mvp", status: "planned", milestone: 5 },
  { slug: "resume", title: "Resume Analyzer", purpose: "Prioritize deterministic and AI-assisted resume fixes.", stage: "mvp", status: "planned", milestone: 5 },
  { slug: "github", title: "GitHub Analyzer", purpose: "Measure what a public GitHub profile communicates.", stage: "mvp", status: "planned", milestone: 5 },
  { slug: "interview", title: "Interview Coach", purpose: "Run adaptive mock interviews with per-answer feedback.", stage: "mvp", status: "planned", milestone: 5 },
  { slug: "portfolio/demo", title: "Narrative Portfolio", purpose: "Compose a shareable story from existing student work.", stage: "mvp", status: "planned", milestone: 6 },
  { slug: "simulator", title: "Career Simulator", purpose: "Translate a target role into gaps, time, transparent readiness bands, and a mission.", stage: "mvp", status: "available", milestone: 4 },
  { slug: "what-if", title: "What-If Simulator", purpose: "Compare two or three paths using auditable formulas.", stage: "mvp", status: "planned", milestone: 6 },
  { slug: "future-twin", title: "AI Future Twin", purpose: "Show clearly framed 2, 5, and 10-year trajectory scenarios.", stage: "mvp", status: "planned", milestone: 6 },
  { slug: "opportunities", title: "Opportunity Finder", purpose: "Rank clearly labeled demo opportunities against the profile.", stage: "mvp", status: "planned", milestone: 6 },
  { slug: "radar", title: "Opportunity Radar", purpose: "Surface relevant programs, events, and challenges.", stage: "mvp", status: "available", milestone: 3 },
  { slug: "financial-planner", title: "Financial Reality Planner", purpose: "Model illustrative cost, EMI, and breakeven scenarios.", stage: "mvp", status: "planned", milestone: 6 },
  { slug: "journal", title: "Confidence Journal", purpose: "Compare self-rating with measured readiness over time.", stage: "mvp", status: "planned", milestone: 6 },
  { slug: "mission", title: "Mission Mode", purpose: "Turn a dream goal into a weighted, trackable mission.", stage: "mvp", status: "available", milestone: 3 },
  { slug: "timeline", title: "Student Timeline", purpose: "Show the personalized education-to-career journey with stage-specific deep links.", stage: "mvp", status: "available", milestone: 3 },
  { slug: "health-score", title: "Career Health Score", purpose: "Compute transparent readiness from visible category weights.", stage: "mvp", status: "available", milestone: 3 },
  { slug: "settings", title: "Settings", purpose: "Manage profile, appearance, language, and guidance preferences.", stage: "mvp", status: "available", milestone: 6 },
  { slug: "settings/sharing", title: "Guardian & Counselor Sharing", purpose: "Generate and revoke explicit, expiring read-only access grants.", stage: "mvp", status: "planned", milestone: 6 },
];

export function getModuleBySlug(slug: string) {
  return moduleRegistry.find((module) => module.slug === slug);
}
