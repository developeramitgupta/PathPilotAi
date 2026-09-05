import { ExamNavigatorScreen } from "@/components/exams/exam-navigator-screen";
import { QueryBoundary } from "@/components/shared/query-boundary";

export default function Page() {
  return <QueryBoundary><ExamNavigatorScreen /></QueryBoundary>;
}
