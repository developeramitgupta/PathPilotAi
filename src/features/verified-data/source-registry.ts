import "server-only";

export type OfficialSourceDefinition = {
  key: string;
  name: string;
  kind: "data_gov" | "ugc" | "nirf" | "josaa" | "nta" | "github" | "official_website";
  websiteUrl: string;
  apiBaseUrl?: string;
};

/**
 * The only sources PathPilot will ingest automatically. Every resulting record
 * starts in pending review and is never student-visible until an admin approves it.
 */
export const OFFICIAL_SOURCE_REGISTRY: readonly OfficialSourceDefinition[] = [
  {
    key: "data-gov-aishe",
    name: "data.gov.in / AISHE",
    kind: "data_gov",
    websiteUrl: "https://www.data.gov.in/",
    apiBaseUrl: "https://api.data.gov.in/resource",
  },
  {
    key: "ugc-universities",
    name: "UGC University Directory",
    kind: "ugc",
    websiteUrl: "https://www.ugc.gov.in/universitydetails/university",
  },
  {
    key: "nirf-rankings",
    name: "National Institutional Ranking Framework",
    kind: "nirf",
    websiteUrl: "https://www.nirfindia.org/",
  },
  {
    key: "josaa-cutoffs",
    name: "JoSAA Opening and Closing Ranks",
    kind: "josaa",
    websiteUrl: "https://josaa.nic.in/document/opening-and-closing-ranks-2026/",
  },
  {
    key: "nta-notices",
    name: "National Testing Agency Notices",
    kind: "nta",
    websiteUrl: "https://www.nta.ac.in/",
  },
  {
    key: "github-public-api",
    name: "GitHub REST API",
    kind: "github",
    websiteUrl: "https://docs.github.com/en/rest/users/users",
    apiBaseUrl: "https://api.github.com",
  },
] as const;

export function getOfficialSource(key: string) {
  return OFFICIAL_SOURCE_REGISTRY.find((source) => source.key === key) ?? null;
}
