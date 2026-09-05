import {
  BookOpenCheck,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  FileText,
  Flag,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  Map,
  Route,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const studentJourneys = [
  "stream-explorer",
  "education-planner",
  "career-launch",
] as const;

export type StudentJourney = (typeof studentJourneys)[number];

export type JourneyNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type JourneyNavigationGroup = {
  label: string;
  items: JourneyNavigationItem[];
};

export type StudentJourneyConfig = {
  key: StudentJourney;
  label: string;
  cardTitle: string;
  cardDescription: string;
  eligibility: string;
  defaultCurrentStage: "class-10" | "class-11-12" | "college" | "graduate" | "early-career";
  assessmentTitle: string;
  assessmentDescription: string;
  dashboardEyebrow: string;
  dashboardTitle: string;
  dashboardDescription: string;
  nextAction: { title: string; detail: string; action: string; href: string; icon: LucideIcon };
  navigation: JourneyNavigationGroup[];
  mobileNavigation: JourneyNavigationItem[];
  allowedRoutePrefixes: string[];
  unavailableMessage: string;
};

const baseRoutes = ["/dashboard", "/settings", "/onboarding"];

export const studentJourneyConfig: Record<StudentJourney, StudentJourneyConfig> = {
  "stream-explorer": {
    key: "stream-explorer",
    label: "Stream Explorer",
    cardTitle: "I’m in Class 10",
    cardDescription: "Choose a Class 11 stream with a clearer view of subjects, strengths, and future career families.",
    eligibility: "For students choosing their Class 11 direction.",
    defaultCurrentStage: "class-10",
    assessmentTitle: "Shape your Class 11 direction",
    assessmentDescription: "We’ll connect your interests, subjects, learning style, and family context to a practical stream plan.",
    dashboardEyebrow: "Stream Explorer",
    dashboardTitle: "Choose a stream with your future in view.",
    dashboardDescription: "Explore career families first, then build the Class 10–12 subject plan that keeps your options open.",
    nextAction: { title: "Find your best-fit stream", detail: "Review your subject strengths, stream preferences, and the career families they can unlock.", action: "Explore stream pathways", href: "/roadmap", icon: Sparkles },
    navigation: [
      { label: "Explore", items: [{ label: "Home", href: "/dashboard", icon: LayoutDashboard }, { label: "Career Discovery", href: "/career-discovery", icon: Compass }, { label: "Stream Pathway", href: "/roadmap", icon: Route }] },
      { label: "Build", items: [{ label: "Skills & Activities", href: "/learning", icon: BookOpenCheck }, { label: "Mission", href: "/mission", icon: Flag }] },
      { label: "Account", items: [{ label: "Settings", href: "/settings", icon: Settings }] },
    ],
    mobileNavigation: [{ label: "Home", href: "/dashboard", icon: LayoutDashboard }, { label: "Discover", href: "/career-discovery", icon: Compass }, { label: "Pathway", href: "/roadmap", icon: Route }, { label: "Mission", href: "/mission", icon: Flag }],
    allowedRoutePrefixes: [...baseRoutes, "/career-discovery", "/roadmap", "/learning", "/mission"],
    unavailableMessage: "This tool is part of the Education Planner journey. For now, focus on your stream, subjects, and future career options.",
  },
  "education-planner": {
    key: "education-planner",
    label: "Education Planner",
    cardTitle: "I’m in Class 11, 12, or have passed Class 12",
    cardDescription: "Plan the right degree, college, entrance exams, budget, and career direction from one place.",
    eligibility: "For Class 11–12 students and students who have completed Class 12.",
    defaultCurrentStage: "class-11-12",
    assessmentTitle: "Plan your education decisions",
    assessmentDescription: "We’ll organize your career ideas, degree choices, exam appetite, budget, location, and decision deadlines.",
    dashboardEyebrow: "Education Planner",
    dashboardTitle: "Turn your next education decision into a plan.",
    dashboardDescription: "Compare career-degree routes, prioritize official entrance exams, and build a college search that respects your constraints.",
    nextAction: { title: "Connect a career direction to the right degree", detail: "Start with your strongest career matches, then compare the degree and exam paths that keep them possible.", action: "Review degree pathways", href: "/degrees", icon: GraduationCap },
    navigation: [
      { label: "Explore", items: [{ label: "Home", href: "/dashboard", icon: LayoutDashboard }, { label: "Career Discovery", href: "/career-discovery", icon: Compass }, { label: "Degree Advisor", href: "/degrees", icon: GraduationCap }, { label: "College Finder", href: "/colleges", icon: Map }, { label: "Entrance Exams", href: "/exams", icon: ClipboardCheck }] },
      { label: "Plan", items: [{ label: "Roadmap", href: "/roadmap", icon: Route }, { label: "Mission", href: "/mission", icon: Flag }] },
      { label: "Account", items: [{ label: "Settings", href: "/settings", icon: Settings }] },
    ],
    mobileNavigation: [{ label: "Home", href: "/dashboard", icon: LayoutDashboard }, { label: "Discover", href: "/career-discovery", icon: Compass }, { label: "Degrees", href: "/degrees", icon: GraduationCap }, { label: "Plan", href: "/roadmap", icon: Route }],
    allowedRoutePrefixes: [...baseRoutes, "/career-discovery", "/degrees", "/colleges", "/exams", "/roadmap", "/mission"],
    unavailableMessage: "This tool is part of the Career Launch journey. Stay focused on the degree, college, and entrance-exam decisions in front of you.",
  },
  "career-launch": {
    key: "career-launch",
    label: "Career Launch",
    cardTitle: "I’m in college, final year, or graduated",
    cardDescription: "Choose between job and higher studies while building projects, proof, internship readiness, and applications.",
    eligibility: "For college students, final-year students, and graduates.",
    defaultCurrentStage: "college",
    assessmentTitle: "Build your launch plan",
    assessmentDescription: "We’ll compare job and higher-studies paths, map skill gaps, and choose the evidence and opportunities to pursue next.",
    dashboardEyebrow: "Career Launch",
    dashboardTitle: "Make your next move with evidence.",
    dashboardDescription: "Choose a job or higher-studies direction, strengthen your portfolio, and turn readiness into applications.",
    nextAction: { title: "Choose your job or higher-studies direction", detail: "Use your skills, projects, readiness, and location preferences to compare the paths before you commit.", action: "Compare my directions", href: "/degrees", icon: BriefcaseBusiness },
    navigation: [
      { label: "Launch", items: [{ label: "Home", href: "/dashboard", icon: LayoutDashboard }, { label: "Career Direction", href: "/career-discovery", icon: Compass }, { label: "Roadmap", href: "/roadmap", icon: Route }, { label: "Learning Coach", href: "/learning", icon: BookOpenCheck }] },
      { label: "Evidence", items: [{ label: "Project Mentor", href: "/projects", icon: Sparkles }, { label: "Resume", href: "/resume", icon: FileText }, { label: "GitHub", href: "/github", icon: GitBranch }, { label: "Interview Coach", href: "/interview", icon: ClipboardCheck }] },
      { label: "Opportunities", items: [{ label: "Opportunities", href: "/opportunities", icon: BriefcaseBusiness }, { label: "Higher studies", href: "/degrees", icon: GraduationCap }, { label: "Settings", href: "/settings", icon: Settings }] },
    ],
    mobileNavigation: [{ label: "Home", href: "/dashboard", icon: LayoutDashboard }, { label: "Direction", href: "/career-discovery", icon: Compass }, { label: "Roadmap", href: "/roadmap", icon: Route }, { label: "Jobs", href: "/opportunities", icon: BriefcaseBusiness }],
    allowedRoutePrefixes: [...baseRoutes, "/career-discovery", "/roadmap", "/learning", "/projects", "/resume", "/github", "/interview", "/opportunities", "/degrees"],
    unavailableMessage: "This tool is part of the Education Planner journey. Your current workspace is focused on job readiness, internships, and higher-studies decisions.",
  },
};

export function isStudentJourney(value: string | null | undefined): value is StudentJourney {
  return Boolean(value && studentJourneys.includes(value as StudentJourney));
}

export function getStudentJourney(value: string | null | undefined): StudentJourney {
  return isStudentJourney(value) ? value : "education-planner";
}

export function isJourneyRouteAllowed(journey: StudentJourney, pathname: string) {
  return studentJourneyConfig[journey].allowedRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
