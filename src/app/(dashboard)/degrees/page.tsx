import { DegreeAdvisorScreen } from "@/components/degrees/degree-advisor-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function Page() {
  return <QueryBoundary><DegreeAdvisorScreen /></QueryBoundary>;
}
