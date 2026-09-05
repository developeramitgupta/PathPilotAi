import { Suspense } from "react";

import { StudentStageSelection } from "@/components/student-journey/student-stage-selection";

export default function StudentStagePage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#f8fafc]" aria-label="Loading student journey selection" />}><StudentStageSelection /></Suspense>;
}
