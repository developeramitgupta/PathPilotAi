import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type { StudentJourney } from "@/features/student-journey/config";

type CsvRow = Record<string, string>;

export type EducationCatalogueKind = "degrees" | "courses";

export type EducationCatalogueItem = {
  id: string;
  name: string;
  level: string;
  stream: string;
  scope: string;
  source: string;
  sourceUrl: string;
  verificationNote: string;
  relevance: number;
  matchedSignals: string[];
};

export type ScholarshipCatalogueItem = {
  id: string;
  name: string;
  provider: string;
  category: string;
  scope: string;
  academicYear: string;
  source: string;
  sourceUrl: string;
  verificationStatus: string;
  notes: string;
};

type CatalogueQuery = {
  kind: EducationCatalogueKind;
  query?: string;
  level?: string;
  stream?: string;
  interests?: string[];
  favoriteSubjects?: string[];
  strengths?: string[];
  careerName?: string;
  journey?: StudentJourney | null;
  limit?: number;
};

function parseCsv(value: string): CsvRow[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === '"') {
      if (quoted && value[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && value[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field);
  if (row.some(Boolean)) rows.push(row);

  const [headers = [], ...records] = rows;
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header.trim(), (record[index] ?? "").trim()])));
}

function readDataset(filename: string) {
  return parseCsv(readFileSync(path.join(process.cwd(), "src", "data", filename), "utf8"));
}

const degreeRows = readDataset("india_300_plus_degrees_programmes.csv");
const courseRows = readDataset("india_180_plus_courses.csv");
const scholarshipRows = readDataset("india_100_plus_scholarships.csv");

const streamSignals: Array<{ stream: string; terms: string[] }> = [
  { stream: "Engineering", terms: ["technology", "engineering", "computer", "mathematics", "physics", "problem", "analysis"] },
  { stream: "Computer Science", terms: ["technology", "computer", "coding", "data", "mathematics", "analysis"] },
  { stream: "Data Science", terms: ["data", "technology", "computer", "mathematics", "analysis"] },
  { stream: "Management", terms: ["business", "finance", "economics", "leadership", "communication"] },
  { stream: "Commerce", terms: ["business", "finance", "economics", "accountancy", "leadership"] },
  { stream: "Medicine", terms: ["healthcare", "biology", "medicine", "research", "empathy"] },
  { stream: "Allied Health", terms: ["healthcare", "biology", "medicine", "empathy"] },
  { stream: "Design", terms: ["design", "art", "creativity", "visual"] },
  { stream: "Fine Arts", terms: ["design", "art", "creativity", "visual"] },
  { stream: "Arts & Humanities", terms: ["art", "history", "english", "psychology", "communication", "creativity"] },
  { stream: "Social Sciences", terms: ["psychology", "public", "communication", "research", "society"] },
  { stream: "Law", terms: ["public", "communication", "research", "analysis"] },
  { stream: "Agriculture", terms: ["environment", "biology", "science", "research"] },
  { stream: "Environmental Science", terms: ["environment", "science", "biology", "research"] },
];

function tokenize(...values: Array<string | string[] | null | undefined>) {
  return new Set(values.flatMap((value) => Array.isArray(value) ? value : [value ?? ""])
    .join(" ")
    .toLocaleLowerCase("en-IN")
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2));
}

function scoreRecord(record: CsvRow, query: CatalogueQuery, index: number) {
  const signals = tokenize(query.interests, query.favoriteSubjects, query.strengths, query.careerName);
  const searchable = `${record.degree_name ?? record.course_name ?? ""} ${record.stream ?? ""} ${record.level ?? ""}`.toLocaleLowerCase("en-IN");
  const directMatches = [...signals].filter((term) => searchable.includes(term));
  const streamEntry = streamSignals.find((entry) => entry.stream.toLocaleLowerCase("en-IN") === (record.stream ?? "").toLocaleLowerCase("en-IN"));
  const streamMatches = streamEntry?.terms.filter((term) => signals.has(term)) ?? [];
  const matchedSignals = Array.from(new Set([...directMatches, ...streamMatches])).slice(0, 4);
  const journeyBoost = query.journey === "stream-explorer" && record.level === "UG"
    ? 3
    : query.journey === "career-launch" && /PG|Certificate|Diploma/i.test(record.level)
      ? 3
      : 0;
  return {
    relevance: Math.max(42, Math.min(98, 54 + directMatches.length * 9 + streamMatches.length * 6 + journeyBoost - (index % 7))),
    matchedSignals,
  };
}

export function getEducationCatalogue(query: CatalogueQuery) {
  const records = (query.kind === "degrees" ? degreeRows : courseRows)
    .filter((record) => Boolean(record.degree_name || record.course_name));
  const search = query.query?.trim().toLocaleLowerCase("en-IN") ?? "";
  const selectedLevel = query.level && query.level !== "all" ? query.level : null;
  const selectedStream = query.stream && query.stream !== "all" ? query.stream : null;
  const filtered = records
    .filter((record) => !selectedLevel || record.level === selectedLevel)
    .filter((record) => !selectedStream || record.stream === selectedStream)
    .filter((record) => !search || `${record.degree_name || record.course_name || ""} ${record.stream ?? ""} ${record.level ?? ""}`.toLocaleLowerCase("en-IN").includes(search))
    .map((record, index) => {
      const score = scoreRecord(record, query, index);
      return {
        id: record.degree_id ?? record.course_id,
        name: record.degree_name || record.course_name || "Untitled programme",
        level: record.level ?? "Not specified",
        stream: record.stream ?? "Not specified",
        scope: record.state_relevance ?? record.scope ?? "All India",
        source: record.source,
        sourceUrl: record.source_url,
        verificationNote: record.verification_note ?? record.verification_status,
        ...score,
      } satisfies EducationCatalogueItem;
    })
    .sort((left, right) => right.relevance - left.relevance || left.name.localeCompare(right.name))
    .slice(0, Math.min(Math.max(query.limit ?? 12, 1), 30));

  return {
    items: filtered,
    filters: {
      levels: Array.from(new Set(records.map((record) => record.level).filter(Boolean))).sort(),
      streams: Array.from(new Set(records.map((record) => record.stream).filter(Boolean))).sort(),
    },
    total: records.filter((record) => (!selectedLevel || record.level === selectedLevel) && (!selectedStream || record.stream === selectedStream) && (!search || `${record.degree_name || record.course_name || ""} ${record.stream ?? ""} ${record.level ?? ""}`.toLocaleLowerCase("en-IN").includes(search))).length,
  };
}

export function getScholarshipCatalogue(): ScholarshipCatalogueItem[] {
  return scholarshipRows.map((record) => ({
    id: record.scholarship_id,
    name: record.scholarship_name,
    provider: record.provider,
    category: record.category,
    scope: record.scope_type,
    academicYear: record.academic_year,
    source: record.source,
    sourceUrl: record.source_url,
    verificationStatus: record.verification_status,
    notes: record.notes,
  }));
}
