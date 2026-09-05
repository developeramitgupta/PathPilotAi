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
} from "@/lib/verified-data/local-dataset";

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
        reasoningRefs: ["annualBudget", "state", "programme", ...(rank ? ["officialRanking"] : [])],
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
  if (mode?.toLowerCase() === "online") return "online";
  if (mode?.toLowerCase() === "hybrid") return "hybrid";
  return "in-person";
}

export function getLocalInternships(input: { interests: string[]; skills: string[]; careerName?: string }): RadarResult {
  const terms = new Set([...input.interests, ...input.skills, input.careerName ?? ""]
    .join(" ").toLocaleLowerCase("en-IN").split(/[^a-z0-9]+/).filter((term) => term.length > 2));
  const now = new Date();
  const opportunities = verifiedInternshipRecords
    .filter((record) => !record.application_deadline || new Date(`${record.application_deadline}T23:59:59.999Z`) >= now)
    .map((record, index) => {
      const recordTerms = `${record.internship_title} ${record.eligibility}`.toLocaleLowerCase("en-IN");
      const overlaps = [...terms].filter((term) => recordTerms.includes(term)).length;
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
        relevance: Math.max(55, Math.min(95, 70 + overlaps * 7 - index)),
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

  return {
    opportunities,
    mode: opportunities.length ? "official-live" : "official-empty",
    generatedAt: new Date().toISOString(),
    disclaimer: opportunities.length
      ? "Official internship records with application links. Records with a passed published deadline are automatically excluded; records without a deadline remain visible only as a source to verify."
      : "No internship record currently has an unexpired published deadline. Check the official source portals for new calls.",
  };
}
