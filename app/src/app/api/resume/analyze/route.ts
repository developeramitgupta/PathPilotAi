import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { analyzeResume } from "@/features/resume/server/analyzer";
import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { getPathPilotUserId } from "@/features/pathpilot/server/auth";
import { getDb } from "@/lib/db";
import { resumeAnalyses, resumes } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resumeAnalysisSchema } from "@/features/resume/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

const supportedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const mimeTypeByExtension: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function normaliseMimeType(file: File) {
  if (supportedMimeTypes.has(file.type)) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return mimeTypeByExtension[extension] ?? file.type;
}

function extension(filename: string, mimeType: string) {
  const candidate = filename.split(".").pop()?.toLowerCase();
  if (candidate && /^[a-z0-9]{1,6}$/.test(candidate)) return candidate;
  return mimeType === "application/pdf" ? "pdf" : mimeType === "image/png" ? "png" : "jpg";
}

export async function POST(request: Request) {
  try {
    const userId = await getPathPilotUserId();
    const form = await request.formData();
    const file = form.get("file");
    const targetRole = String(form.get("targetRole") ?? "").trim().slice(0, 120);
    if (!(file instanceof File)) throw new Error("RESUME_FILE_REQUIRED");
    const mimeType = normaliseMimeType(file);
    if (!supportedMimeTypes.has(mimeType)) throw new Error("RESUME_FILE_TYPE_INVALID");
    if (file.size < 100 || file.size > 5 * 1024 * 1024) throw new Error("RESUME_FILE_SIZE_INVALID");

    const bytes = Buffer.from(await file.arrayBuffer());
    const resumeId = crypto.randomUUID();
    const objectPath = `${userId}/${resumeId}.${extension(file.name, mimeType)}`;
    const storage = createSupabaseAdminClient();
    let storedInSupabase = false;
    if (storage) {
      const { error: uploadError } = await storage.storage.from("resumes").upload(objectPath, bytes, {
        contentType: mimeType,
        upsert: false,
      });
      storedInSupabase = !uploadError;
    }

    try {
      const outcome = await analyzeResume({ bytes, filename: file.name, mimeType }, targetRole || undefined);
      const database = getDb();
      await database.transaction(async (transaction) => {
        await transaction.insert(resumes).values({
          id: resumeId,
          userId,
          fileUrl: storedInSupabase ? `storage://resumes/${objectPath}` : `database://resumes/${resumeId}`,
          fileName: file.name,
          mimeType,
          fileBytes: storedInSupabase ? null : bytes,
        });
        await transaction.insert(resumeAnalyses).values({
          id: crypto.randomUUID(),
          resumeId,
          score: outcome.analysis.overallScore,
          formattingScore: outcome.analysis.formattingScore,
          keywordScore: outcome.analysis.keywordScore,
          grammarScore: outcome.analysis.grammarScore,
          impactScore: outcome.analysis.impactScore,
          missingSkills: outcome.analysis.missingSkills,
          topFixes: outcome.analysis.topFixes,
          analysisReport: outcome.analysis,
          analysisMode: outcome.mode,
        });
      });
      return NextResponse.json({ resumeId, filename: file.name, mode: outcome.mode, analysis: outcome.analysis });
    } catch (analysisError) {
      if (storedInSupabase) await storage?.storage.from("resumes").remove([objectPath]);
      throw analysisError;
    }
  } catch (error) {
    return pathPilotApiError(error);
  }
}

export async function GET() {
  try {
    const userId = await getPathPilotUserId();
    const database = getDb();
    const [resume] = await database.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.createdAt)).limit(1);
    if (!resume) return NextResponse.json({ resume: null });
    const [analysis] = await database.select().from(resumeAnalyses).where(eq(resumeAnalyses.resumeId, resume.id)).limit(1);
    const report = analysis?.analysisReport ? resumeAnalysisSchema.safeParse(analysis.analysisReport) : null;
    return NextResponse.json({
      resume: {
        id: resume.id,
        createdAt: resume.createdAt,
        analysis: report?.success ? report.data : null,
        mode: analysis?.analysisMode === "needs-ai-key" ? "needs-ai-key" : "ai",
      },
    });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
