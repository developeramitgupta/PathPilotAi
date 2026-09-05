import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { getDb } from "@/lib/db";
import { resumes, studentProfiles } from "@/lib/db/schema";

const bodySchema = z.object({ resumeId: z.string().uuid(), skills: z.array(z.string().trim().min(1).max(80)).min(1).max(6) });

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const input = bodySchema.parse(await request.json());
    const database = getDb();
    const [ownedResume] = await database.select({ id: resumes.id }).from(resumes).where(and(eq(resumes.id, input.resumeId), eq(resumes.userId, userId))).limit(1);
    if (!ownedResume) throw new Error("FORBIDDEN");
    const [profile] = await database.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
    if (!profile) throw new Error("PROFILE_REQUIRED");
    const strengths = Array.from(new Set([...(profile.strengths ?? []), ...input.skills])).slice(0, 20);
    await database.update(studentProfiles).set({ strengths, updatedAt: new Date() }).where(eq(studentProfiles.userId, userId));
    return NextResponse.json({ strengths });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
