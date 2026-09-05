import { CareerDiscoveryScreen } from "@/components/career-discovery/career-discovery-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function Page() {
  return <QueryBoundary><CareerDiscoveryScreen /></QueryBoundary>;
}
