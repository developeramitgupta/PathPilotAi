import { CollegeFinderScreen } from "@/components/colleges/college-finder-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function Page() {
  return <QueryBoundary><CollegeFinderScreen /></QueryBoundary>;
}
