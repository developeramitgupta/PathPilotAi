import "server-only";

import type {
  CollegeFinderInput,
  CollegeFinderResult,
  RadarOpportunity,
  RadarResult,
} from "@/features/pathpilot/schemas";
import {
  verifiedCollegeRecords,
  verifiedInternshipRecords,
  syntheticInternshipRecords,
} from "@/lib/verified-data/local-dataset";
import { getScholarshipCatalogue } from "@/features/verified-data/server/education-catalogue";

function ownership(value: string): "government" | "private" {
  return value.toLowerCase().includes("private") || value.toLowerCase().includes("deemed")
    ? "private"
    : "government";
}

function rankFrom(value: string | null) {
  const match = value?.match(/NIRF Engineering 2025:\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function courseMatches(courses: string[], query: string) {
  if (query === "Any programme") return true;
  const normalized = query.toLocaleLowerCase("en-IN");
  return courses.some((course) => course.toLocaleLowerCase("en-IN").includes(normalized));
}

/** Uses the reviewed JSON catalogue before a Supabase import has published it. */
export function getLocalCollegeMatches(input: CollegeFinderInput): CollegeFinderResult {
  const city = input.city.trim().toLocaleLowerCase("en-IN");
  const matches = verifiedCollegeRecords
    .filter((college) => input.state === "All India" || college.state === input.state)
    .filter((college) => !city || college.city.toLocaleLowerCase("en-IN").includes(city))
    .filter((college) => input.ownership === "any" || ownership(college.college_type) === input.ownership)
    // A budget is a hard filter: unknown fees never masquerade as affordable.
    .filter((college) => college.annual_fees !== null && college.annual_fees <= input.annualBudget)
    .filter((college) => input.hostel !== "required" || college.hostel_fees !== null)
    // Placement is also a hard filter when the student chooses a minimum.
    // A missing disclosure must not be treated as a qualifying percentage.
    .filter((college) => input.minPlacementRate === 0 || (college.placement_percentage !== null && college.placement_percentage >= input.minPlacementRate))
    .filter((college) => courseMatches(college.available_branches_courses, input.branch))
    .map((college) => {
      const annualFee = college.annual_fees ?? Number.POSITIVE_INFINITY;
      const rank = rankFrom(college.ranking);
      const placementScore = college.placement_percentage
        ? Math.round((college.placement_percentage / 100) * input.placementPriority * 4)
        : 0;
      const rankScore = rank ? Math.max(8, 42 - rank * 2) : 12;
      const budgetHeadroom = input.annualBudget - annualFee;
      const budgetScore = Math.max(4, Math.min(20, 20 - Math.floor(budgetHeadroom / 50_000)));
      const compatibility = Math.max(45, Math.min(97, 32 + rankScore + placementScore + budgetScore));
      const placementNote = college.placement_percentage === null
        ? "No comparable placement percentage was published in the reviewed official source."
        : `${college.placement_percentage}% placement disclosure is available for ${college.placement_reference_year}.`;

      return {
        collegeId: college.college_id,
        name: college.college_name,
        city: college.city,
        state: college.state,
        ownership: ownership(college.college_type),
        tier: rank && rank <= 20 ? "1" as const : rank && rank <= 75 ? "2" as const : "3" as const,
        compatibility,
        why: `${college.college_name} has a published annual tuition of ₹${annualFee.toLocaleString("en-IN")}. ${placementNote}`,
        reasoningRefs: ["annualBudget", "minPlacementRate", "state", "programme", ...(rank ? ["officialRanking"] : [])],
        estimatedAnnualCost: annualFee,
        hostelAvailable: college.hostel_fees !== null,
        scholarshipAvailable: null,
        branches: college.available_branches_courses,
        boardCutoffDemo: null,
        placementRateDemo: college.placement_percentage === null ? null : Math.round(college.placement_percentage),
        medianPackageDemo: college.median_package === null ? null : `₹${college.median_package.toLocaleString("en-IN")} median package`,
        cultureTags: [],
        overview: `${college.affiliation}. Admission: ${college.cutoff_admission_criteria}`,
        sourceUrl: college.official_source[0] ?? college.college_website,
        lastVerifiedAt: new Date(`${college.last_verified_date}T00:00:00.000Z`).toISOString(),
        officialRank: rank,
        rankingYear: rank ? 2025 : null,
        dataMode: "official" as const,
      };
    })
    .sort((left, right) => right.compatibility - left.compatibility || left.estimatedAnnualCost! - right.estimatedAnnualCost!)
    .slice(0, 8);

  return {
    matches,
    mode: "official",
    candidateCount: matches.length,
    generatedAt: new Date().toISOString(),
    disclaimer: "Verified local catalogue: annual-fee filtering excludes records whose official fee is unavailable. Placement, cut-offs, hostel fees, and rankings are shown only where a reviewed official source published them. Open the source before applying.",
  };
}

function formatFor(mode: string | null): RadarOpportunity["format"] {
  if (["online", "remote"].includes(mode?.toLowerCase() ?? "")) return "online";
  if (mode?.toLowerCase() === "hybrid") return "hybrid";
  return "in-person";
}

function formatSyntheticDeadline(value: string) {
  const [day, month, year] = value.split("-").map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function stipendFrom(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
}

function scoreInternship(input: { terms: Set<string>; searchableText: string; index: number }) {
  const overlaps = [...input.terms].filter((term) => input.searchableText.includes(term)).length;
  return {
    overlaps,
    relevance: Math.max(55, Math.min(95, 70 + overlaps * 7 - (input.index % 8))),
  };
}

export function getLocalInternships(input: { interests: string[]; skills: string[]; careerName?: string }): RadarResult {
  const terms = new Set([...input.interests, ...input.skills, input.careerName ?? ""]
    .join(" ").toLocaleLowerCase("en-IN").split(/[^a-z0-9]+/).filter((term) => term.length > 2));
  const now = new Date();
  const officialOpportunities = verifiedInternshipRecords
    .filter((record) => !record.application_deadline || new Date(`${record.application_deadline}T23:59:59.999Z`) >= now)
    .map((record, index) => {
      const recordTerms = `${record.internship_title} ${record.eligibility}`.toLocaleLowerCase("en-IN");
      const { overlaps, relevance } = scoreInternship({ terms, searchableText: recordTerms, index });
      const deadline = record.application_deadline
        ? `Deadline: ${new Date(`${record.application_deadline}T00:00:00.000Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
        : "Check the official portal for the current application window.";
      return {
        id: record.internship_id,
        title: record.internship_title,
        category: "internship" as const,
        organizerLabel: record.organization_name,
        format: formatFor(record.mode),
        location: record.mode ?? "Mode not published",
        skillLevel: "all-levels" as const,
        typicalTiming: deadline,
        description: record.eligibility,
        tags: ["official internship", record.mode ?? "mode not published", record.duration],
        relevance,
        whyRelevant: overlaps
          ? `Matches ${overlaps} profile signal${overlaps === 1 ? "" : "s"}; verify the official eligibility before applying.`
          : "A verified government internship record with an official application path.",
        reasoningRefs: overlaps ? ["profile.interests", "selectedCareer"] : ["officialSource"],
        isDemo: false,
        sourceUrl: record.official_source,
        applicationUrl: record.application_link,
        deadlineAt: record.application_deadline ? new Date(`${record.application_deadline}T00:00:00.000Z`).toISOString() : null,
        lastVerifiedAt: new Date(`${record.last_verified_date}T00:00:00.000Z`).toISOString(),
        stipendInr: record.stipend,
        duration: record.duration,
      };
    })
    .sort((left, right) => right.relevance - left.relevance || left.title.localeCompare(right.title));

  const syntheticOpportunities = syntheticInternshipRecords
    .map((record, index) => ({ record, deadline: formatSyntheticDeadline(record.application_deadline), index }))
    .filter((entry): entry is { record: (typeof syntheticInternshipRecords)[number]; deadline: Date; index: number } => entry.deadline !== null && entry.deadline.getTime() >= now.getTime())
    .map(({ record, deadline, index }) => {
      const searchableText = [record.role, record.domain, record.industry, record.eligibility, record.experience, ...record.required_skills].join(" ").toLocaleLowerCase("en-IN");
      const { overlaps, relevance } = scoreInternship({ terms, searchableText, index });
      return {
        id: record.internship_id,
        title: record.role,
        category: "internship" as const,
        organizerLabel: record.company,
        format: formatFor(record.work_mode === "On-site" ? "Offline" : record.work_mode),
        location: record.location,
        skillLevel: "all-levels" as const,
        typicalTiming: `Demo deadline: ${deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`,
        description: `${record.domain} · ${record.eligibility}`,
        tags: [record.domain, record.industry, ...record.required_skills.slice(0, 3)],
        relevance,
        whyRelevant: overlaps
          ? `Matches ${overlaps} profile signal${overlaps === 1 ? "" : "s"}. This is synthetic demo data, so verify a real opening before acting.`
          : "Synthetic demo listing for exploring internship filters. Verify a real opening before acting.",
        reasoningRefs: overlaps ? ["profile.interests", "selectedCareer"] : ["demoDataset"],
        isDemo: true,
        sourceUrl: null,
        applicationUrl: null,
        deadlineAt: deadline.toISOString(),
        lastVerifiedAt: null,
        stipendInr: stipendFrom(record.stipend),
        duration: record.duration,
      } satisfies RadarOpportunity;
    })
    .sort((left, right) => right.relevance - left.relevance || left.title.localeCompare(right.title));

  const scholarshipOpportunities = getScholarshipCatalogue()
    .map((record, index) => {
      const searchableText = `${record.name} ${record.provider} ${record.category} ${record.scope}`.toLocaleLowerCase("en-IN");
      const { overlaps, relevance } = scoreInternship({ terms, searchableText, index });
      return {
        id: record.id,
        title: record.name,
        category: "scholarship" as const,
        organizerLabel: record.provider,
        format: "online" as const,
        location: `${record.scope} · India`,
        skillLevel: "all-levels" as const,
        typicalTiming: `${record.academicYear} cycle · verify the current deadline on the official portal.`,
        description: `${record.category} scholarship. ${record.notes}`,
        tags: [record.category, record.scope, "2026–27"],
        relevance: Math.max(50, relevance),
        whyRelevant: overlaps
          ? `Matches ${overlaps} profile signal${overlaps === 1 ? "" : "s"}. Check the official scheme page for current eligibility, amount, participating institutions, and deadline.`
          : "A supplied scholarship catalogue record linked to its official portal. Confirm current eligibility, amount, and deadline before applying.",
        reasoningRefs: overlaps ? ["profile.interests", "selectedCareer", "officialSource"] : ["officialSource"],
        isDemo: false,
        sourceUrl: record.sourceUrl,
        applicationUrl: record.sourceUrl,
        deadlineAt: null,
        lastVerifiedAt: null,
        stipendInr: null,
        duration: null,
      } satisfies RadarOpportunity;
    })
    .sort((left, right) => right.relevance - left.relevance || left.title.localeCompare(right.title));

  const opportunities = [...officialOpportunities, ...scholarshipOpportunities, ...syntheticOpportunities]
    .sort((left, right) => right.relevance - left.relevance || Number(left.isDemo) - Number(right.isDemo) || left.title.localeCompare(right.title));

  return {
    opportunities,
    mode: officialOpportunities.length && syntheticOpportunities.length
      ? "mixed-catalogue"
      : officialOpportunities.length
        ? "official-live"
        : opportunities.length
          ? "static-ranked-demo"
          : "official-empty",
    generatedAt: new Date().toISOString(),
    disclaimer: opportunities.length
      ? "Official internship and scholarship records retain their published source links. Scholarship catalogue entries require you to confirm live eligibility, value, deadlines, and participating institutions on the official portal. Synthetic listings are clearly marked, have no application link, and are for filter and matching demonstrations only. Records with passed published internship deadlines are automatically excluded."
      : "No internship record currently has an unexpired published deadline. Check the official source portals for new calls.",
  };
}
