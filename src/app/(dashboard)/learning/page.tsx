import { LearningCoachScreen } from "@/components/learning/learning-coach-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function Page() {
  return <QueryBoundary><LearningCoachScreen /></QueryBoundary>;
}
