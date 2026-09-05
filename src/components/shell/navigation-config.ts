import {
  BookOpenCheck,
  ClipboardCheck,
  Compass,
  Flag,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  Radar,
  Route,
  Scale,
  Settings,
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
    label: "Explore",
    items: [
      { label: "Career Discovery", href: "/career-discovery", icon: Compass },
      { label: "College Finder", href: "/colleges", icon: GraduationCap },
      { label: "Exam Navigator", href: "/exams", icon: ClipboardCheck },
      { label: "Degree Advisor", href: "/degrees", icon: Scale },
    ],
  },
  {
    label: "Plan",
    items: [
      { label: "Roadmap", href: "/roadmap", icon: Route },
      { label: "Learning Coach", href: "/learning", icon: BookOpenCheck },
    ],
  },
  {
    label: "Your path",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Mission Mode", href: "/mission", icon: Flag },
      { label: "Health Score", href: "/health-score", icon: HeartPulse },
      { label: "Opportunity Radar", href: "/radar", icon: Radar },
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
