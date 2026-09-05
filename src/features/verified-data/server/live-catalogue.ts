import "server-only";

import { desc, eq } from "drizzle-orm";

import type {
  CollegeFinderInput,
  CollegeFinderResult,
  CollegeMatchResult,
  RadarOpportunity,
  RadarResult,
} from "@/features/pathpilot/schemas";
import { getDb } from "@/lib/db";
import { colleges, institutionRankings, opportunities } from "@/lib/db/schema";
import { serviceAvailability } from "@/lib/env";

function words(values: string[]) {
  return new Set(
    values
      .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/))
      .filter((value) => value.length > 2),
  );
}

function scoreOverlap(left: Set<string>, right: Set<string>) {
  let total = 0;
  for (const value of left) if (right.has(value)) total += 1;
  return total;
}

function ownership(value: string): "government" | "private" {
  return value.toLowerCase().includes("private") ? "private" : "government";
}

/**
 * Matches only institution records that a reviewer has published. Missing fee,
 * placement, and programme data stays visibly unknown rather than being guessed.
 */
export async function getVerifiedCollegeMatches(
  input: CollegeFinderInput,
): Promise<CollegeFinderResult | null> {
  if (!serviceAvailability.database) return null;

  const database = getDb();
  const [collegeRows, rankingRows] = await Promise.all([
    database
      .select()
      .from(colleges)
      .where(eq(colleges.reviewStatus, "published"))
      .limit(120),
    database
      .select()
      .from(institutionRankings)
      .where(eq(institutionRankings.reviewStatus, "published"))
      .orderBy(desc(institutionRankings.rankingYear), institutionRankings.rank)
      .limit(240),
  ]);

  if (!collegeRows.length) return null;

  const rankByCollege = new Map<string, (typeof rankingRows)[number]>();
  for (const rank of rankingRows) {
    if (!rankByCollege.has(rank.institutionId)) rankByCollege.set(rank.institutionId, rank);
  }
  const cityQuery = input.city.trim().toLowerCase();
  const matches = collegeRows
    .filter((college) => input.state === "All India" || college.state === input.state)
    .filter((college) => !cityQuery || college.city.toLowerCase().includes(cityQuery))
    .filter((college) => input.ownership === "any" || ownership(college.type) === input.ownership)
    .filter((college) => input.hostel !== "required" || college.hostelAvailable)
    .filter((college) => college.annualCostInr <= 0 || college.annualCostInr <= input.annualBudget)
    .map((college): CollegeMatchResult => {
      const ranking = rankByCollege.get(college.id);
      const rankScore = ranking ? Math.max(10, 80 - ranking.rank) : 22;
      const locationScore = input.state === "All India" || college.state === input.state ? 12 : 0;
      const branchEvidence = college.branches?.length
        ? college.branches.some((branch) => branch.toLowerCase() === input.branch.toLowerCase())
        : false;
      const programmeScore = branchEvidence ? 8 : 0;
      const compatibility = Math.max(45, Math.min(97, rankScore + locationScore + programmeScore));
      const feeKnown = college.annualCostInr > 0;
      const rankDescription = ranking
        ? `NIRF ${ranking.category} ${ranking.rankingYear} rank #${ranking.rank}`
        : "published official institution record";
      const programmeNote = branchEvidence
        ? `${input.branch} is present in the verified programme evidence.`
        : "Programme availability for your selected branch has not been verified in this record yet.";

      return {
        collegeId: college.id,
        name: college.name,
        city: college.city,
        state: college.state,
        ownership: ownership(college.type),
        tier: ranking && ranking.rank <= 20 ? "1" : ranking && ranking.rank <= 75 ? "2" : "3",
        compatibility,
        why: `${college.name} is a ${rankDescription}. ${programmeNote} ${feeKnown ? "Its published fee field fits your selected budget." : "Fee data is not published here; check the institution before deciding."}`,
        reasoningRefs: ["state", "branch", "annualBudget", ...(ranking ? ["officialRanking"] : [])],
        estimatedAnnualCost: feeKnown ? college.annualCostInr : null,
        // A false legacy value means hostel evidence was not imported; it is
        // not a claim that an institution has no hostel.
        hostelAvailable: college.hostelAvailable ? true : null,
        scholarshipAvailable: null,
        branches: college.branches ?? [],
        boardCutoffDemo: null,
        placementRateDemo: null,
        medianPackageDemo: null,
        cultureTags: college.cultureTags ?? [],
        overview: `Official record published by PathPilot from ${rankDescription}. It does not make an admission, fee, placement, or programme-availability claim beyond the linked source evidence.`,
        sourceUrl: college.sourceUrl,
        lastVerifiedAt: college.lastVerifiedAt?.toISOString() ?? null,
        officialRank: ranking?.rank ?? null,
        rankingYear: ranking?.rankingYear ?? null,
        dataMode: "official",
      };
    })
    .sort((left, right) => right.compatibility - left.compatibility || left.name.localeCompare(right.name))
    .slice(0, 8);

  return {
    matches,
    mode: "official",
    candidateCount: collegeRows.length,
    generatedAt: new Date().toISOString(),
    disclaimer:
      "Officially sourced institution and ranking records. Fees, programmes, cut-offs, placements, and hostel details are shown only when published in a verified record; follow the source link before acting.",
  };
}

/** Ranks current, published opportunities and sends applications to the source authority. */
export async function getVerifiedOpportunities(input: {
  interests: string[];
  skills: string[];
  careerName?: string;
}): Promise<RadarResult | null> {
  if (!serviceAvailability.database) return null;
  const database = getDb();
  const rows = await database
    .select()
    .from(opportunities)
    .where(eq(opportunities.reviewStatus, "published"))
    .orderBy(desc(opportunities.lastVerifiedAt), opportunities.title)
    .limit(80);
  if (!rows.length) return null;

  const profileTerms = words([...input.interests, ...input.skills, input.careerName ?? ""]);
  const now = new Date();
  const mapped = rows
    .filter((item) => !item.effectiveTo || item.effectiveTo >= now)
    .map((item, index) => {
      const itemTerms = words([item.title, item.org, item.description ?? "", ...(item.tags ?? [])]);
      const overlap = scoreOverlap(profileTerms, itemTerms);
      const category: RadarOpportunity["category"] = item.type === "internship" ? "internship" : "event";
      const format: RadarOpportunity["format"] = item.location.toLowerCase().includes("remote") ? "online" : "hybrid";
      const skillLevel: RadarOpportunity["skillLevel"] = "all-levels";
      return {
        id: item.id,
        title: item.title,
        category,
        organizerLabel: item.org,
        format,
        location: item.location,
        skillLevel,
        typicalTiming: item.deadlineAt
          ? `Deadline: ${item.deadlineAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
          : "Check the official portal for current openings and deadlines.",
        description: item.description ?? "Official opportunity record. Open the source for the current eligibility and application details.",
        tags: item.tags?.length ? item.tags : ["official source", "student opportunity"],
        relevance: Math.max(50, Math.min(96, 62 + overlap * 8 - (index % 5))),
        whyRelevant: overlap
          ? `Matches ${overlap} signal${overlap === 1 ? "" : "s"} from your stated interests and skills.`
          : "A current, published opportunity from an official source that you can verify before applying.",
        reasoningRefs: overlap ? ["profile.interests", "selectedCareer"] : ["officialSource"],
        isDemo: false,
        sourceUrl: item.sourceUrl,
        applicationUrl: item.applicationUrl,
        deadlineAt: item.deadlineAt?.toISOString() ?? null,
        lastVerifiedAt: item.lastVerifiedAt?.toISOString() ?? null,
      };
    })
    .sort((left, right) => right.relevance - left.relevance || left.title.localeCompare(right.title));

  return {
    opportunities: mapped,
    mode: mapped.length ? "official-live" : "official-empty",
    generatedAt: new Date().toISOString(),
    disclaimer: mapped.length
      ? "Published official opportunities. PathPilot links you to the authority for eligibility, live vacancies, and applications."
      : "No current, published official opportunities match this view. Browse the linked official portal for live openings.",
  };
}
