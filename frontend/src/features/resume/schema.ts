import { z } from "zod";

const score = z.number().int().min(0).max(100);

export const resumeAnalysisSchema = z.object({
  headline: z.string().min(1).max(140),
  summary: z.string().min(1).max(600),
  overallScore: score,
  formattingScore: score,
  keywordScore: score,
  grammarScore: score,
  impactScore: score,
  strengths: z.array(z.string().min(1).max(180)).min(1).max(5),
  missingSkills: z.array(z.string().min(1).max(80)).max(8),
  topFixes: z.array(z.string().min(1).max(220)).min(3).max(5),
  suggestedProfileSkills: z.array(z.string().min(1).max(80)).max(6),
  careerDirections: z.array(z.object({
    role: z.string().min(1).max(100),
    fit: score,
    why: z.string().min(1).max(220),
    nextAction: z.string().min(1).max(180),
  })).min(1).max(3),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
