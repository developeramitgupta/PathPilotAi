import type { StagePlan, StudentAssessmentSubmission } from "@/features/pathpilot/schemas";

export function generateStagePlan(submission: StudentAssessmentSubmission): StagePlan {
  const generatedAt = new Date().toISOString();

  if (submission.studentJourney === "stream-explorer") {
    const streams = submission.stageAnswers.preferredStreams
      .filter((stream) => stream !== "still-exploring")
      .map((stream) => stream[0].toUpperCase() + stream.slice(1));
    return {
      journey: submission.studentJourney,
      title: streams.length ? `${streams.join(" + ")} pathways to explore` : "A wide-open stream exploration plan",
      summary: `Your interests in ${submission.profile.interests.slice(0, 2).join(" and ")} are the starting point. Build subject confidence before treating one stream as a final label.`,
      priorities: [
        { title: "Compare your stream pathways", detail: "See the subjects, careers, and flexibility behind your shortlisted Class 11 options.", href: "/roadmap" },
        { title: "Explore career families", detail: "Use interests and favourite subjects to understand the kinds of work you may enjoy later.", href: "/career-discovery" },
        { title: "Build one weekly learning habit", detail: "Choose an activity that strengthens a subject you may need in Class 11.", href: "/learning" },
      ],
      generatedAt,
    };
  }

  if (submission.studentJourney === "education-planner") {
    return {
      journey: submission.studentJourney,
      title: "Your degree, exam, and college decision plan",
      summary: `Prioritize ${submission.stageAnswers.degreeInterests.slice(0, 2).join(" and ")} while balancing ${submission.stageAnswers.collegePriority.replaceAll("-", " ")} and a ${submission.profile.studyBudget} study budget.`,
      priorities: [
        { title: "Compare degree routes", detail: "Turn your career interests into degree options with clear trade-offs.", href: "/degrees" },
        { title: "Build your official exam path", detail: `Your current exam approach is ${submission.stageAnswers.entranceExamAppetite.replaceAll("-", " ")}. Verify the right official timelines next.`, href: "/exams" },
        { title: "Set college-search priorities", detail: "Filter options by course fit, budget, location, and the kind of campus experience you want.", href: "/colleges" },
      ],
      generatedAt,
    };
  }

  return {
    journey: submission.studentJourney,
    title: "Your career launch plan",
    summary: `Use your ${submission.stageAnswers.evidenceReadiness.replaceAll("-", " ")} starting point to compare ${submission.stageAnswers.primaryDirection.replaceAll("-", " ")} options with concrete proof and application actions.`,
    priorities: [
      { title: "Choose a direction with evidence", detail: "Compare job, internship, and higher-studies paths before committing time and money.", href: "/degrees" },
      { title: "Strengthen your portfolio", detail: "Turn your skills and projects into proof that recruiters and mentors can understand.", href: "/projects" },
      { title: "Find your next opportunity", detail: "Focus on internships and roles that fit your location and readiness preferences.", href: "/opportunities" },
    ],
    generatedAt,
  };
}
