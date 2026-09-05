import { MissionModeScreen } from "@/components/mission/mission-mode-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function Page() {
  return <QueryBoundary><MissionModeScreen /></QueryBoundary>;
}
