import "server-only";

import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  academicProgrammes,
  colleges,
  cutoffRecords,
  degreeOptions,
  examEvents,
  exams,
  institutionRankings,
  opportunities,
  resources,
  scholarships,
} from "@/lib/db/schema";

const catalogueNames = [
  "colleges",
  "programmes",
  "rankings",
  "exams",
  "exam-events",
  "cutoffs",
  "degrees",
  "scholarships",
  "resources",
  "opportunities",
] as const;

export type CatalogueName = (typeof catalogueNames)[number];

export function isCatalogueName(value: string): value is CatalogueName {
  return catalogueNames.some((name) => name === value);
}

/** Public read model. It only queries published records, even when using the direct server connection. */
export async function listVerifiedCatalogue(name: CatalogueName, limit = 24) {
  const database = getDb();
  const take = Math.min(Math.max(limit, 1), 100);
  switch (name) {
    case "colleges":
      return database
        .select({
          id: colleges.id,
          name: colleges.name,
          city: colleges.city,
          state: colleges.state,
          type: colleges.type,
          sourceUrl: colleges.sourceUrl,
          lastVerifiedAt: colleges.lastVerifiedAt,
        })
        .from(colleges)
        .where(eq(colleges.reviewStatus, "published"))
        .orderBy(desc(colleges.lastVerifiedAt), colleges.name)
        .limit(take);
    case "programmes":
      return database
        .select({
          id: academicProgrammes.id,
          institutionId: academicProgrammes.institutionId,
          name: academicProgrammes.name,
          field: academicProgrammes.field,
          degree: academicProgrammes.degree,
          sourceUrl: academicProgrammes.sourceUrl,
          lastVerifiedAt: academicProgrammes.lastVerifiedAt,
        })
        .from(academicProgrammes)
        .where(eq(academicProgrammes.reviewStatus, "published"))
        .orderBy(desc(academicProgrammes.lastVerifiedAt), academicProgrammes.name)
        .limit(take);
    case "rankings":
      return database
        .select()
        .from(institutionRankings)
        .where(eq(institutionRankings.reviewStatus, "published"))
        .orderBy(desc(institutionRankings.rankingYear), institutionRankings.rank)
        .limit(take);
    case "exams":
      return database
        .select({
          id: exams.id,
          name: exams.name,
          eligibility: exams.eligibility,
          sourceUrl: exams.sourceUrl,
          lastVerifiedAt: exams.lastVerifiedAt,
        })
        .from(exams)
        .where(eq(exams.reviewStatus, "published"))
        .orderBy(desc(exams.lastVerifiedAt), exams.name)
        .limit(take);
    case "exam-events":
      return database
        .select()
        .from(examEvents)
        .where(eq(examEvents.reviewStatus, "published"))
        .orderBy(desc(examEvents.cycleYear), desc(examEvents.lastVerifiedAt))
        .limit(take);
    case "cutoffs":
      return database
        .select()
        .from(cutoffRecords)
        .where(eq(cutoffRecords.reviewStatus, "published"))
        .orderBy(desc(cutoffRecords.cycleYear), desc(cutoffRecords.lastVerifiedAt))
        .limit(take);
    case "degrees":
      return database
        .select({
          id: degreeOptions.id,
          key: degreeOptions.key,
          name: degreeOptions.name,
          sourceUrl: degreeOptions.sourceUrl,
          lastVerifiedAt: degreeOptions.lastVerifiedAt,
        })
        .from(degreeOptions)
        .where(eq(degreeOptions.reviewStatus, "published"))
        .orderBy(desc(degreeOptions.lastVerifiedAt), degreeOptions.name)
        .limit(take);
    case "scholarships":
      return database
        .select()
        .from(scholarships)
        .where(eq(scholarships.reviewStatus, "published"))
        .orderBy(desc(scholarships.lastVerifiedAt), scholarships.title)
        .limit(take);
    case "resources":
      return database
        .select({
          id: resources.id,
          title: resources.title,
          type: resources.type,
          url: resources.url,
          skillTag: resources.skillTag,
          lastVerifiedAt: resources.lastVerifiedAt,
        })
        .from(resources)
        .where(eq(resources.reviewStatus, "published"))
        .orderBy(desc(resources.lastVerifiedAt), resources.title)
        .limit(take);
    case "opportunities":
      return database
        .select({
          id: opportunities.id,
          type: opportunities.type,
          title: opportunities.title,
          org: opportunities.org,
          location: opportunities.location,
          sourceUrl: opportunities.sourceUrl,
          applicationUrl: opportunities.applicationUrl,
          deadlineAt: opportunities.deadlineAt,
          lastVerifiedAt: opportunities.lastVerifiedAt,
        })
        .from(opportunities)
        .where(eq(opportunities.reviewStatus, "published"))
        .orderBy(desc(opportunities.lastVerifiedAt), opportunities.title)
        .limit(take);
  }
}
