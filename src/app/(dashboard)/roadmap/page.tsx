import { RoadmapScreen } from "@/components/roadmap/roadmap-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function Page() {
  return <QueryBoundary><RoadmapScreen /></QueryBoundary>;
}
