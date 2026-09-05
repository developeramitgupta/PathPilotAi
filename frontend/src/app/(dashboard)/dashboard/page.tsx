import { ProgressDashboardScreen } from "@/components/dashboard/progress-dashboard-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function DashboardPage() {
  return <QueryBoundary><ProgressDashboardScreen /></QueryBoundary>;
}
