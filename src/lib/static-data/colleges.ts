export interface CollegeCatalogEntry {
  id: string;
  name: string;
  city: string;
  state: string;
  ownership: "government" | "private";
  tier: "1" | "2" | "3";
  estimatedAnnualCost: number;
  hostelAvailable: boolean;
  scholarshipAvailable: boolean;
  branches: string[];
  boardCutoffDemo: number;
  placementRateDemo: number;
  medianPackageDemo: string;
  cultureTags: Array<"sports" | "tech-clubs" | "quiet-academic" | "cultural">;
  overview: string;
}

const locations = [
  ["Mumbai", "Maharashtra"], ["Pune", "Maharashtra"], ["Delhi", "Delhi"],
  ["Bengaluru", "Karnataka"], ["Surathkal", "Karnataka"], ["Chennai", "Tamil Nadu"],
  ["Coimbatore", "Tamil Nadu"], ["Hyderabad", "Telangana"], ["Pilani", "Rajasthan"],
  ["Jaipur", "Rajasthan"], ["Kanpur", "Uttar Pradesh"], ["Lucknow", "Uttar Pradesh"],
  ["Kharagpur", "West Bengal"], ["Kolkata", "West Bengal"], ["Roorkee", "Uttarakhand"],
  ["Vellore", "Tamil Nadu"], ["Ahmedabad", "Gujarat"], ["Chandigarh", "Chandigarh"],
  ["Bhopal", "Madhya Pradesh"], ["Patna", "Bihar"], ["Guwahati", "Assam"],
  ["Bhubaneswar", "Odisha"], ["Manipal", "Karnataka"], ["Noida", "Uttar Pradesh"],
  ["Thiruvananthapuram", "Kerala"],
] as const;

const institutionTemplates = [
  "Institute of Technology", "College of Engineering", "University School of Computing",
  "Institute of Design and Innovation", "School of Business and Economics", "College of Applied Sciences",
  "Institute of Health Sciences", "School of Law and Public Policy", "Polytechnic and Skills University",
  "Institute of Data and Digital Systems", "College of Liberal Arts", "Technical University",
] as const;

const featuredNames: Record<string, string> = {
  Mumbai: "Indian Institute of Technology Bombay",
  Pune: "COEP Technological University",
  Delhi: "Indian Institute of Technology Delhi",
  Bengaluru: "Indian Institute of Science Bengaluru",
  Surathkal: "National Institute of Technology Karnataka",
  Chennai: "Indian Institute of Technology Madras",
  Coimbatore: "PSG College of Technology",
  Hyderabad: "International Institute of Information Technology Hyderabad",
  Pilani: "BITS Pilani",
  Jaipur: "Malaviya National Institute of Technology Jaipur",
  Kanpur: "Indian Institute of Technology Kanpur",
  Lucknow: "Indian Institute of Information Technology Lucknow",
  Kharagpur: "Indian Institute of Technology Kharagpur",
  Kolkata: "Jadavpur University",
  Roorkee: "Indian Institute of Technology Roorkee",
  Vellore: "Vellore Institute of Technology",
  Ahmedabad: "Nirma University",
  Chandigarh: "Punjab Engineering College",
  Bhopal: "Maulana Azad National Institute of Technology",
  Patna: "National Institute of Technology Patna",
  Guwahati: "Indian Institute of Technology Guwahati",
  Bhubaneswar: "Kalinga Institute of Industrial Technology",
  Manipal: "Manipal Institute of Technology",
  Noida: "Amity University Noida",
  Thiruvananthapuram: "College of Engineering Trivandrum",
};

const branchGroups = [
  ["Computer Science", "Electronics", "Mechanical Engineering", "Civil Engineering"],
  ["Computer Science", "Electronics", "Mechanical Engineering", "Civil Engineering"],
  ["Computer Science", "Data Science", "Artificial Intelligence"],
  ["Design", "Architecture", "Media and Communication"],
  ["Business", "Economics", "Commerce"],
  ["Life Sciences", "Data Science", "Economics"],
  ["Medicine", "Life Sciences", "Pharmacy"],
  ["Law", "Public Policy", "Liberal Arts"],
  ["Mechanical Engineering", "Civil Engineering", "Electronics"],
  ["Computer Science", "Data Science", "Artificial Intelligence"],
  ["Liberal Arts", "Economics", "Media and Communication"],
  ["Computer Science", "Electronics", "Mechanical Engineering", "Civil Engineering"],
] as const;

function slug(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const collegeCatalog: CollegeCatalogEntry[] = locations.flatMap(
  ([city, state], locationIndex) =>
    institutionTemplates.map((template, templateIndex) => {
      const featured = templateIndex === 0;
      const ownership: CollegeCatalogEntry["ownership"] =
        featured || (locationIndex + templateIndex) % 3 === 0 ? "government" : "private";
      const tier: CollegeCatalogEntry["tier"] =
        featured ? "1" : (locationIndex + templateIndex) % 3 === 0 ? "2" : "3";
      const group = branchGroups[templateIndex];
      const costBase = ownership === "government" ? 75_000 : 185_000;
      const tierPremium = tier === "1" ? 85_000 : tier === "2" ? 40_000 : 10_000;
      const estimatedAnnualCost = costBase + tierPremium + (locationIndex % 5) * 15_000;
      const placementRateDemo = Math.min(96, 58 + (tier === "1" ? 28 : tier === "2" ? 16 : 6) + (templateIndex % 5));
      const packageLpa = Math.round((tier === "1" ? 12.5 : tier === "2" ? 7.2 : 4.6) + (locationIndex % 4) * 0.8);
      const name = featured ? featuredNames[city] : `${city} ${template}`;
      const cultureTags: CollegeCatalogEntry["cultureTags"] = [
        templateIndex % 2 === 0 ? "tech-clubs" : "cultural",
        locationIndex % 2 === 0 ? "sports" : "quiet-academic",
      ];

      return {
        id: slug(name), name, city, state, ownership, tier, estimatedAnnualCost,
        hostelAvailable: (locationIndex + templateIndex) % 5 !== 0,
        scholarshipAvailable: ownership === "government" || templateIndex % 2 === 0,
        branches: [...group],
        boardCutoffDemo: Math.min(98, 58 + (tier === "1" ? 28 : tier === "2" ? 17 : 8) + (templateIndex % 4)),
        placementRateDemo,
        medianPackageDemo: `₹${packageLpa}L demo median`,
        cultureTags,
        overview: `${name} is included in PathPilot's realistic India-wide demo dataset to compare ${group.slice(0, 2).join(" and ")} pathways against cost, location, campus, and outcome preferences.`,
      };
    }),
);

export const collegeStates = ["All India", ...Array.from(new Set(locations.map(([, state]) => state))).sort()];
export const collegeBranches = Array.from(new Set(branchGroups.flat())).sort();
