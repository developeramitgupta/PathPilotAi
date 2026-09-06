import { OpportunityRadarScreen } from "@/components/radar/opportunity-radar-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function Page() {
  return <QueryBoundary><OpportunityRadarScreen /></QueryBoundary>;
}
