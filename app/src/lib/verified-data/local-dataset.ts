import collegeDataset from "../../../../database/data/verified_indian_colleges.json";
import internshipDataset from "../../../../database/data/official_indian_internships.json";

export const verifiedCollegeRecords = collegeDataset.records;
export const verifiedInternshipRecords = internshipDataset.records;

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
