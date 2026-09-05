import { NextResponse } from "next/server";

import { generateCareerDiscovery } from "@/features/pathpilot/career-engine";
import { onboardingProfileSchema, studentAssessmentSubmissionSchema } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import {
  replaceCareerMatches,
  saveOnboardingProfile,
  saveStudentJourneyAssessment,
} from "@/features/pathpilot/server/repository";
import { serviceAvailability } from "@/lib/env";
import { generateStagePlan } from "@/features/student-journey/stage-plan";

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const body = await request.json();
    const parsedSubmission = studentAssessmentSubmissionSchema.safeParse(body);
    const profile = parsedSubmission.success
      ? parsedSubmission.data.profile
      : onboardingProfileSchema.parse(body);
    const output = await generateCareerDiscovery(profile);
    const stagePlan = parsedSubmission.success ? generateStagePlan(parsedSubmission.data) : null;

    if (serviceAvailability.database) {
      if (parsedSubmission.success && stagePlan) {
        await saveStudentJourneyAssessment(userId, parsedSubmission.data, stagePlan);
      } else {
        await saveOnboardingProfile(userId, profile);
      }
      await replaceCareerMatches(userId, output.result);
    }

    return NextResponse.json({ profile, stagePlan, studentJourney: parsedSubmission.success ? parsedSubmission.data.studentJourney : "education-planner", ...output });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
