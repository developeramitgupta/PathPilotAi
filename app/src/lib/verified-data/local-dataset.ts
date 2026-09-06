import collegeDataset from "@/data/verified_indian_colleges.json";
import internshipDataset from "@/data/official_indian_internships.json";
import syntheticInternshipDataset from "@/data/pathpilot_120_synthetic_internships.json";

export type SyntheticInternshipRecord = {
  internship_id: string;
  company: string;
  role: string;
  domain: string;
  location: string;
  work_mode: "Remote" | "Hybrid" | "On-site";
  duration: string;
  stipend: string;
  eligibility: string;
  experience: string;
  required_skills: string[];
  responsibilities: string[];
  start_date: string;
  application_deadline: string;
  industry: string;
  source_type: "Synthetic demo data";
  verification_status: "Demo record — verify before publishing";
};

export const verifiedCollegeRecords = collegeDataset.records;
export const verifiedInternshipRecords = internshipDataset.records;
// User-supplied records intentionally remain separate from official sources.
// The opportunity UI renders them as demo listings and does not offer a fake
// application destination when the source data has no application link.
export const syntheticInternshipRecords = syntheticInternshipDataset as SyntheticInternshipRecord[];

export const verifiedCollegeStates = [
  "All India",
  ...Array.from(new Set(verifiedCollegeRecords.map((college) => college.state))).sort(),
];

export const verifiedCollegeCourses = [
  "Any programme",
  ...Array.from(
    new Set(
      verifiedCollegeRecords.flatMap((college) => college.available_branches_courses),
    ),
  ).sort(),
];
