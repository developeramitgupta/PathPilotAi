import { DecisionHistoryScreen } from "@/components/decisions/decision-history-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function Page() {
  return <QueryBoundary><DecisionHistoryScreen /></QueryBoundary>;
}
