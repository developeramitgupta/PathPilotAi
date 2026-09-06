import type { Partner, WorkspaceStudent } from "@/features/workspaces/workspace-data";

export type SkillGap = {
  skill: string;
  demand: number;
  supply: number;
  gap: number;
  priority: "Critical" | "High" | "Medium";
  studentsAffected: number;
};

export type TrainingProgram = {
  id: string;
  name: string;
  skill: string;
  priority: SkillGap["priority"];
  targetStudents: number;
  duration: string;
  status: "Planned" | "Active" | "Completed";
  mentor: string;
};

export type IndustryRequirement = {
  id: string;
  company: string;
  role: string;
  location: string;
  minimumReadiness: number;
  skills: string[];
  preferredSkills: string[];
  deadline: string;
  status: "Open" | "Draft" | "Closed";
};

export type StudentMatch = {
  student: WorkspaceStudent;
  score: number;
  quality: "Excellent" | "Strong" | "Good" | "Fair";
  eligible: boolean;
  requiredSkillMatches: number;
  preferredSkillMatches: number;
  reasoning: string;
};

export type PlacementDrive = {
  id: string;
  company: string;
  role: string;
  date: string;
  status: "Upcoming" | "Live" | "Completed";
  funnel: Array<{ label: string; count: number }>;
  panels: Array<{ id: string; name: string; time: string; room: string; status: "Ready" | "In progress" | "Complete" }>;
  issues: Array<{ id: string; label: string; detail: string }>;
};

export type RecruiterSignal = {
  partnerId: string;
  participation: number;
  responseRate: number;
  repeatScore: number;
  feedbackScore: number;
  engagementScore: number;
};

const skillDemand: Array<{ skill: string; demand: number }> = [
  { skill: "SQL", demand: 88 },
  { skill: "Python", demand: 84 },
  { skill: "Research", demand: 76 },
  { skill: "Communication", demand: 74 },
  { skill: "Statistics", demand: 72 },
  { skill: "Figma", demand: 69 },
  { skill: "Storytelling", demand: 65 },
  { skill: "Analysis", demand: 62 },
];

export const seedTrainings: TrainingProgram[] = [
  { id: "training-sql", name: "SQL evidence sprint", skill: "SQL", priority: "Critical", targetStudents: 24, duration: "2 weeks", status: "Active", mentor: "Placement cell" },
  { id: "training-story", name: "Portfolio storytelling lab", skill: "Storytelling", priority: "High", targetStudents: 18, duration: "3 sessions", status: "Planned", mentor: "Career faculty" },
];

export const seedIndustryRequirements: IndustryRequirement[] = [
  { id: "req-aster", company: "Aster Analytics", role: "Data analyst internship", location: "Bengaluru", minimumReadiness: 70, skills: ["Python", "SQL", "Statistics"], preferredSkills: ["Analysis"], deadline: "Closes in 14 days", status: "Open" },
  { id: "req-nexa", company: "Nexa Labs", role: "Product discovery sprint", location: "Remote / India", minimumReadiness: 65, skills: ["Research", "Figma"], preferredSkills: ["Storytelling"], deadline: "Closes in 8 days", status: "Open" },
  { id: "req-urban", company: "UrbanGrid", role: "Operations graduate role", location: "Hyderabad", minimumReadiness: 68, skills: ["Analysis", "Communication"], preferredSkills: ["Excel"], deadline: "Closes in 21 days", status: "Open" },
];

export const seedPlacementDrives: PlacementDrive[] = [
  {
    id: "drive-aster",
    company: "Aster Analytics",
    role: "Data analyst internship",
    date: "18 Sep · 10:00 AM",
    status: "Live",
    funnel: [{ label: "Registered", count: 32 }, { label: "Eligible", count: 24 }, { label: "Assessment", count: 18 }, { label: "Shortlisted", count: 8 }, { label: "Interview", count: 4 }, { label: "Selected", count: 2 }],
    panels: [{ id: "panel-1", name: "Assessment desk", time: "10:00–11:00", room: "Lab 2", status: "Complete" }, { id: "panel-2", name: "Technical interview", time: "11:30–13:00", room: "Room 204", status: "In progress" }, { id: "panel-3", name: "Hiring discussion", time: "14:00–15:00", room: "Room 204", status: "Ready" }],
    issues: [{ id: "issue-identity", label: "ID check pending", detail: "Two candidates are awaiting document verification." }, { id: "issue-room", label: "Panel room confirmation", detail: "Confirm the final interview room before 1:30 PM." }],
  },
];

function hasSkill(student: WorkspaceStudent, skill: string) {
  return student.evidence.some((item) => item.toLocaleLowerCase("en-IN").includes(skill.toLocaleLowerCase("en-IN")));
}

export function computeSkillGaps(students: WorkspaceStudent[]): SkillGap[] {
  return skillDemand.map(({ skill, demand }) => {
    const covered = students.filter((student) => hasSkill(student, skill));
    const supply = Math.round((covered.length / Math.max(students.length, 1)) * 100);
    const gap = Math.max(0, demand - supply);
    return {
      skill,
      demand,
      supply,
      gap,
      priority: (gap >= 55 ? "Critical" : gap >= 35 ? "High" : "Medium") as SkillGap["priority"],
      studentsAffected: students.length - covered.length,
    };
  }).sort((left, right) => right.gap - left.gap);
}

export function computeMatches(students: WorkspaceStudent[], requirement: IndustryRequirement): StudentMatch[] {
  return students.map((student) => {
    const requiredSkillMatches = requirement.skills.filter((skill) => hasSkill(student, skill)).length;
    const preferredSkillMatches = requirement.preferredSkills.filter((skill) => hasSkill(student, skill)).length;
    const eligible = student.readiness >= requirement.minimumReadiness;
    const requiredScore = Math.round((requiredSkillMatches / Math.max(requirement.skills.length, 1)) * 55);
    const preferredScore = Math.round((preferredSkillMatches / Math.max(requirement.preferredSkills.length, 1)) * 15);
    const readinessScore = Math.round(student.readiness * 0.3);
    const score = eligible ? Math.min(98, requiredScore + preferredScore + readinessScore) : Math.min(64, requiredScore + preferredScore + Math.round(readinessScore * 0.75));
    const quality = (score >= 85 ? "Excellent" : score >= 72 ? "Strong" : score >= 58 ? "Good" : "Fair") as StudentMatch["quality"];
    return {
      student,
      score,
      quality,
      eligible,
      requiredSkillMatches,
      preferredSkillMatches,
      reasoning: eligible
        ? `${requiredSkillMatches}/${requirement.skills.length} required skills evidenced; readiness clears the ${requirement.minimumReadiness}% threshold.`
        : `${requiredSkillMatches}/${requirement.skills.length} required skills evidenced; readiness is below the ${requirement.minimumReadiness}% threshold.`,
    };
  }).sort((left, right) => Number(right.eligible) - Number(left.eligible) || right.score - left.score || left.student.name.localeCompare(right.student.name));
}

export function computeRecruiterSignals(partners: Partner[]): RecruiterSignal[] {
  return partners.map((partner, index) => {
    const participation = Math.min(98, 54 + partner.activeBriefs * 13 + index * 4);
    const responseRate = Math.min(96, 60 + partner.activeBriefs * 10 + index * 3);
    const repeatScore = Math.min(95, 56 + partner.activeBriefs * 11 + index * 5);
    const feedbackScore = Math.min(97, 68 + index * 6);
    return { partnerId: partner.id, participation, responseRate, repeatScore, feedbackScore, engagementScore: Math.round((participation + responseRate + repeatScore + feedbackScore) / 4) };
  }).sort((left, right) => right.engagementScore - left.engagementScore);
}
