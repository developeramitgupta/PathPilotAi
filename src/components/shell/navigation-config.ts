import {
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  FileCheck2,
  Flag,
  FolderGit2,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  Map,
  MessageSquareText,
  Radar,
  Route,
  Scale,
  Search,
  Settings,
  Target,
  Telescope,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: "Discover",
    items: [
      { label: "Career Discovery", href: "/career-discovery", icon: Compass },
      { label: "College Finder", href: "/colleges", icon: GraduationCap },
      { label: "Exam Navigator", href: "/exams", icon: ClipboardCheck },
      { label: "Degree Advisor", href: "/degrees", icon: Scale },
    ],
  },
  {
    label: "Build",
    items: [
      { label: "Roadmap", href: "/roadmap", icon: Route },
      { label: "Learning Coach", href: "/learning", icon: BookOpenCheck },
      { label: "Project Mentor", href: "/projects", icon: FolderGit2 },
    ],
  },
  {
    label: "Prove",
    items: [
      { label: "Resume Analyzer", href: "/resume", icon: FileCheck2 },
      { label: "GitHub Analyzer", href: "/github", icon: FolderGit2 },
      { label: "Interview Coach", href: "/interview", icon: MessageSquareText },
      { label: "Portfolio", href: "/portfolio/demo", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Grow",
    items: [
      { label: "Career Simulator", href: "/simulator", icon: Target },
      { label: "What-If Simulator", href: "/what-if", icon: Scale },
      { label: "Future Twin", href: "/future-twin", icon: Telescope },
      { label: "Opportunity Finder", href: "/opportunities", icon: Search },
      { label: "Opportunity Radar", href: "/radar", icon: Radar },
      { label: "Financial Planner", href: "/financial-planner", icon: WalletCards },
      { label: "Confidence Journal", href: "/journal", icon: BrainCircuit },
    ],
  },
  {
    label: "You",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Mission Mode", href: "/mission", icon: Flag },
      { label: "Timeline", href: "/timeline", icon: Map },
      { label: "Health Score", href: "/health-score", icon: HeartPulse },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const mobilePrimary: NavigationItem[] = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/career-discovery", icon: Compass },
  { label: "Roadmap", href: "/roadmap", icon: Route },
  { label: "Missions", href: "/mission", icon: Flag },
];
