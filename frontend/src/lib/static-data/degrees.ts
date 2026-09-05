export interface DegreePathEntry {
  key: string;
  degreeType: string;
  durationYears: number;
  averageTotalCost: number;
  typicalEntrySalary: string;
  topCareerOutcomes: string[];
  flexibilityScore: number;
  depthScore: number;
  speedScore: number;
  careerTerms: string[];
  pros: string[];
  cons: string[];
}

export const degreePaths: DegreePathEntry[] = [
  { key: "btech", degreeType: "BTech / BE", durationYears: 4, averageTotalCost: 900_000, typicalEntrySalary: "₹4-12L", topCareerOutcomes: ["Software Engineer", "Core Engineer", "Data Analyst"], flexibilityScore: 3, depthScore: 5, speedScore: 2, careerTerms: ["software", "engineering", "data", "technology", "electronics", "mechanical"], pros: ["Strong technical depth and campus-placement access", "Broad recognition across engineering roles"], cons: ["Higher time and cost commitment", "Entrance competition can be intense"] },
  { key: "bca", degreeType: "BCA", durationYears: 3, averageTotalCost: 360_000, typicalEntrySalary: "₹3-8L", topCareerOutcomes: ["Web Developer", "Software Support", "Data Operations"], flexibilityScore: 4, depthScore: 3, speedScore: 4, careerTerms: ["software", "web", "data", "technology", "it"], pros: ["Lower typical cost than BTech", "Leaves room for MCA, certifications, or early projects"], cons: ["Some employers prefer a four-year technical degree", "Strong portfolio building is usually essential"] },
  { key: "bsc", degreeType: "BSc", durationYears: 3, averageTotalCost: 300_000, typicalEntrySalary: "₹3-7L", topCareerOutcomes: ["Research Assistant", "Data Analyst", "Lab or Domain Specialist"], flexibilityScore: 4, depthScore: 4, speedScore: 4, careerTerms: ["science", "research", "data", "mathematics", "biology", "psychology"], pros: ["Strong conceptual foundation", "Wide choice of science specializations"], cons: ["Postgraduate study is common for specialist roles", "Placement access varies widely by institution"] },
  { key: "diploma", degreeType: "Diploma", durationYears: 3, averageTotalCost: 180_000, typicalEntrySalary: "₹2.5-6L", topCareerOutcomes: ["Junior Engineer", "Technician", "CAD or Operations Associate"], flexibilityScore: 3, depthScore: 3, speedScore: 5, careerTerms: ["engineering", "technical", "operations", "design", "manufacturing"], pros: ["Practical and cost-conscious route", "Can support lateral entry into some degree programs"], cons: ["Lower starting ceiling in some graduate-only roles", "Lateral-entry rules differ by institution"] },
  { key: "integrated", degreeType: "Integrated Program", durationYears: 5, averageTotalCost: 1_250_000, typicalEntrySalary: "₹5-14L", topCareerOutcomes: ["Research Engineer", "Specialist Analyst", "Product or Domain Specialist"], flexibilityScore: 2, depthScore: 5, speedScore: 1, careerTerms: ["research", "science", "engineering", "law", "management", "specialist"], pros: ["Coherent undergraduate-to-postgraduate depth", "Can reduce repeated admission transitions"], cons: ["Largest time commitment", "Switching direction midway can be harder"] },
  { key: "online", degreeType: "Online Degree", durationYears: 3, averageTotalCost: 210_000, typicalEntrySalary: "₹3-8L", topCareerOutcomes: ["Digital Operations", "Junior Developer", "Business Analyst"], flexibilityScore: 5, depthScore: 2, speedScore: 4, careerTerms: ["software", "data", "business", "digital", "technology"], pros: ["Flexible around work or caregiving", "Usually lower relocation and living costs"], cons: ["Requires high self-discipline", "Campus networking and placement access may be limited"] },
];
