import { BriefcaseBusiness, Building2, GraduationCap, type LucideIcon } from "lucide-react";

export const workspaceRoles = ["student", "institution", "industry"] as const;

export type WorkspaceRole = (typeof workspaceRoles)[number];

export type WorkspaceRoleConfig = {
  label: string;
  shortLabel: string;
  description: string;
  signUpTitle: string;
  signUpDescription: string;
  destination: string;
  icon: LucideIcon;
};

export const workspaceRoleConfig: Record<WorkspaceRole, WorkspaceRoleConfig> = {
  student: {
    label: "Student",
    shortLabel: "Student",
    description: "Find direction, build credible skills, and move toward the right opportunities.",
    signUpTitle: "Start with what makes you, you.",
    signUpDescription: "A short assessment turns your interests, strengths, and priorities into a practical starting path.",
    destination: "/onboarding",
    icon: GraduationCap,
  },
  institution: {
    label: "Institution",
    shortLabel: "Institution",
    description: "See student readiness clearly and coordinate the support that creates better outcomes.",
    signUpTitle: "Create a shared readiness view.",
    signUpDescription: "Set up your institution workspace to guide students, work with partners, and track outcomes.",
    destination: "/institution",
    icon: Building2,
  },
  industry: {
    label: "Industry",
    shortLabel: "Industry",
    description: "Find candidates through verified skills, projects, and readiness—not static resumes.",
    signUpTitle: "Build a stronger early-talent pipeline.",
    signUpDescription: "Set up your hiring workspace to define opportunities and discover evidence-backed candidates.",
    destination: "/industry",
    icon: BriefcaseBusiness,
  },
};

export function isWorkspaceRole(value: string | null | undefined): value is WorkspaceRole {
  return Boolean(value && workspaceRoles.includes(value as WorkspaceRole));
}
