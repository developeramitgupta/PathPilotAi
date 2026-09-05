export type ReadinessBand = "ready" | "building" | "needs-support";
export type PipelineStage = "New" | "Shortlisted" | "Interview" | "Selected";

export type WorkspaceStudent = {
  id: string;
  name: string;
  programme: string;
  cohort: string;
  location: string;
  readiness: number;
  evidence: string[];
  nextAction: string;
  band: ReadinessBand;
};

export type Cohort = {
  id: string;
  name: string;
  programme: string;
  term: string;
  learners: number;
  readiness: number;
  needsAttention: number;
  focus: string;
};

export type WorkspaceOpportunity = {
  id: string;
  title: string;
  organization: string;
  type: "Internship" | "Project brief" | "Graduate role";
  location: string;
  deadline: string;
  skills: string[];
  status: "Open" | "Draft" | "Closed";
  applicants: number;
};

export type Partner = {
  id: string;
  name: string;
  sector: string;
  relationship: string;
  activeBriefs: number;
  nextTouchpoint: string;
};

export type PipelineCandidate = WorkspaceStudent & {
  pipelineStage: PipelineStage;
  appliedTo: string;
};

export const seedInstitutionCohorts: Cohort[] = [
  { id: "cohort-data-ai", name: "Data & AI readiness", programme: "B.Tech · CSE", term: "Semester 5", learners: 42, readiness: 74, needsAttention: 6, focus: "Portfolio evidence" },
  { id: "cohort-design", name: "Human-centred design", programme: "B.Des", term: "Semester 3", learners: 31, readiness: 68, needsAttention: 8, focus: "Industry research brief" },
  { id: "cohort-foundation", name: "Career foundation", programme: "First-year cross-disciplinary", term: "Semester 2", learners: 56, readiness: 61, needsAttention: 14, focus: "Career exploration" },
];

export const seedStudents: WorkspaceStudent[] = [
  { id: "aanya", name: "Aanya Sharma", programme: "B.Tech · Computer Science", cohort: "Data & AI readiness", location: "Bengaluru", readiness: 92, evidence: ["Python", "SQL", "2 verified projects"], nextAction: "Nominate for data internship", band: "ready" },
  { id: "kabir", name: "Kabir Mehta", programme: "B.Des · Interaction Design", cohort: "Human-centred design", location: "Pune", readiness: 87, evidence: ["User research", "Figma", "Portfolio review"], nextAction: "Review case-study narrative", band: "ready" },
  { id: "nisha", name: "Nisha Iyer", programme: "B.Sc · Data Science", cohort: "Data & AI readiness", location: "Chennai", readiness: 83, evidence: ["Statistics", "Python", "Capstone"], nextAction: "Complete interview practice", band: "building" },
  { id: "rohan", name: "Rohan Verma", programme: "BBA · Analytics", cohort: "Career foundation", location: "Bengaluru", readiness: 71, evidence: ["Excel", "Market research", "Coursework"], nextAction: "Choose a project brief", band: "building" },
  { id: "meera", name: "Meera Nair", programme: "B.Tech · Electronics", cohort: "Career foundation", location: "Kochi", readiness: 58, evidence: ["Circuit lab", "Teamwork"], nextAction: "Schedule mentor check-in", band: "needs-support" },
];

export const seedInstitutionOpportunities: WorkspaceOpportunity[] = [
  { id: "opp-product", title: "Product discovery sprint", organization: "Nexa Labs", type: "Project brief", location: "Remote / India", deadline: "Closes in 8 days", skills: ["Research", "Figma", "Storytelling"], status: "Open", applicants: 18 },
  { id: "opp-data", title: "Data analyst internship", organization: "Aster Analytics", type: "Internship", location: "Bengaluru", deadline: "Closes in 14 days", skills: ["Python", "SQL", "Statistics"], status: "Open", applicants: 12 },
  { id: "opp-ops", title: "Operations graduate role", organization: "UrbanGrid", type: "Graduate role", location: "Hyderabad", deadline: "Closes in 21 days", skills: ["Excel", "Communication", "Analysis"], status: "Open", applicants: 9 },
];

export const seedPartners: Partner[] = [
  { id: "nexa", name: "Nexa Labs", sector: "Product & design", relationship: "Project partner", activeBriefs: 2, nextTouchpoint: "Review showcase · Friday" },
  { id: "aster", name: "Aster Analytics", sector: "Data & analytics", relationship: "Hiring partner", activeBriefs: 1, nextTouchpoint: "Candidate shortlist · Tuesday" },
  { id: "urbangrid", name: "UrbanGrid", sector: "Operations technology", relationship: "Industry mentor", activeBriefs: 1, nextTouchpoint: "Mentor session · 18 Sep" },
];

export const seedIndustryOpportunities: WorkspaceOpportunity[] = [
  { id: "ind-data-intern", title: "Data analyst intern", organization: "Your company", type: "Internship", location: "Bengaluru / hybrid", deadline: "Closes in 14 days", skills: ["Python", "SQL", "Data storytelling"], status: "Open", applicants: 24 },
  { id: "ind-product-brief", title: "Customer research project", organization: "Your company", type: "Project brief", location: "Remote / India", deadline: "Closes in 10 days", skills: ["Research", "Synthesis", "Presentation"], status: "Open", applicants: 16 },
];

export const seedPipeline: PipelineCandidate[] = [
  { ...seedStudents[0], pipelineStage: "Interview", appliedTo: "Data analyst intern" },
  { ...seedStudents[1], pipelineStage: "Shortlisted", appliedTo: "Customer research project" },
  { ...seedStudents[2], pipelineStage: "New", appliedTo: "Data analyst intern" },
  { ...seedStudents[3], pipelineStage: "New", appliedTo: "Customer research project" },
];

export const readinessCopy: Record<ReadinessBand, { label: string; className: string }> = {
  ready: { label: "Ready to match", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  building: { label: "Building evidence", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  "needs-support": { label: "Needs support", className: "bg-rose-50 text-rose-700 ring-rose-200" },
};

export const pipelineStages: PipelineStage[] = ["New", "Shortlisted", "Interview", "Selected"];
