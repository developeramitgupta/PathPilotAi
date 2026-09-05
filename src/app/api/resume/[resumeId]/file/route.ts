import { and, eq } from "drizzle-orm";

import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { getDb } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ resumeId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const userId = await getPathPilotUserId();
    const { resumeId } = await params;
    const [resume] = await getDb()
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
      .limit(1);
    if (!resume) throw new Error("FORBIDDEN");

    let bytes = resume.fileBytes;
    if (!bytes) {
      const objectPath = resume.fileUrl.replace("storage://resumes/", "");
      const storage = createSupabaseAdminClient();
      if (!storage || objectPath === resume.fileUrl) throw new Error("RESUME_STORAGE_UNAVAILABLE");
      const { data, error } = await storage.storage.from("resumes").download(objectPath);
      if (error || !data) throw new Error("RESUME_STORAGE_UNAVAILABLE");
      bytes = Buffer.from(await data.arrayBuffer());
    }

    const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    return new Response(body, {
      headers: {
        "content-type": resume.mimeType || "application/octet-stream",
        "content-disposition": `attachment; filename="${(resume.fileName || "resume").replaceAll('"', "")}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
