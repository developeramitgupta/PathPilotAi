import { AppShell } from "@/components/shell/app-shell";
import { StudentJourneyGuard } from "@/components/student-journey/student-journey-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell><StudentJourneyGuard>{children}</StudentJourneyGuard></AppShell>;
}
