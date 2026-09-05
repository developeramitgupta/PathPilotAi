import { createHash } from "node:crypto";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required. Run `vercel env pull .env.local` first.");

const sql = postgres(databaseUrl, { max: 1, prepare: false, connect_timeout: 15 });
const now = new Date();
const nirfUrl = "https://www.nirfindia.org/Rankings/2025/OverallRanking.html";
const aicteUrl = "https://internship.aicte-india.org/internships";

const nirfInstitutions = [
  ["nirf-iitm", "Indian Institute of Technology Madras", "Chennai", "Tamil Nadu", 1, "87.31"],
  ["nirf-iisc", "Indian Institute of Science", "Bengaluru", "Karnataka", 2, "85.00"],
  ["nirf-iitb", "Indian Institute of Technology Bombay", "Mumbai", "Maharashtra", 3, "81.62"],
  ["nirf-iitd", "Indian Institute of Technology Delhi", "New Delhi", "Delhi", 4, "80.67"],
  ["nirf-iitk", "Indian Institute of Technology Kanpur", "Kanpur", "Uttar Pradesh", 5, "77.25"],
  ["nirf-iitkgp", "Indian Institute of Technology Kharagpur", "Kharagpur", "West Bengal", 6, "73.99"],
  ["nirf-iitr", "Indian Institute of Technology Roorkee", "Roorkee", "Uttarakhand", 7, "71.73"],
  ["nirf-iitg", "Indian Institute of Technology Guwahati", "Guwahati", "Assam", 11, "67.67"],
  ["nirf-iith", "Indian Institute of Technology Hyderabad", "Hyderabad", "Telangana", 12, "67.04"],
  ["nirf-iitbhu", "Indian Institute of Technology (Banaras Hindu University) Varanasi", "Varanasi", "Uttar Pradesh", 31, "60.03"],
];

const aicteOpportunities = [
  ["aicte-portal", "AICTE National Internship Portal", "All India Council for Technical Education", "India-wide", "The official AICTE portal for students to browse current internships, remote and hybrid openings, and verified government/industry programmes.", ["internships", "government", "career readiness"]],
  ["aicte-tulip", "TULIP Smart Cities Internship", "Ministry of Housing and Urban Affairs via AICTE", "India-wide", "Official Smart Cities internship route listed on the AICTE National Internship Portal. Open the authority portal for current eligibility and vacancies.", ["internship", "smart cities", "public service"]],
  ["aicte-cdac", "C-DAC internship opportunities", "C-DAC / MeitY via AICTE", "India-wide", "Official C-DAC, NIELIT and ERNET internship route listed on the AICTE National Internship Portal. Check the portal for live openings.", ["internship", "technology", "government"]],
];

function digest(payload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function upsertSource({ id, key, name, kind, websiteUrl }) {
  await sql`
    insert into data_sources (id, key, name, kind, website_url, is_active, created_at, updated_at)
    values (${id}, ${key}, ${name}, ${kind}, ${websiteUrl}, true, ${now}, ${now})
    on conflict (key) do update set name = excluded.name, website_url = excluded.website_url, is_active = true, updated_at = excluded.updated_at
  `;
}

async function sourceRecord({ id, sourceId, externalId, entityType, sourceUrl, payload }) {
  await sql`
    insert into source_records (id, source_id, external_id, entity_type, source_url, payload, payload_hash, retrieved_at, review_status, reviewed_at, published_at, created_at, updated_at)
    values (${id}, ${sourceId}, ${externalId}, ${entityType}, ${sourceUrl}, ${JSON.stringify(payload)}::jsonb, ${digest(payload)}, ${now}, 'published', ${now}, ${now}, ${now}, ${now})
    on conflict (id) do update set payload = excluded.payload, payload_hash = excluded.payload_hash, retrieved_at = excluded.retrieved_at, review_status = 'published', reviewed_at = excluded.reviewed_at, published_at = excluded.published_at, updated_at = excluded.updated_at
  `;
}

try {
  await upsertSource({ id: "nirf-rankings", key: "nirf-rankings", name: "National Institutional Ranking Framework", kind: "nirf", websiteUrl: nirfUrl });
  await upsertSource({ id: "aicte-internships", key: "aicte-internships", name: "AICTE National Internship Portal", kind: "official_website", websiteUrl: aicteUrl });

  for (const [id, name, city, state, rank, score] of nirfInstitutions) {
    const recordId = `source-${id}`;
    const payload = { name, city, state, rank, score, rankingYear: 2025, framework: "NIRF Overall" };
    await sourceRecord({ id: recordId, sourceId: "nirf-rankings", externalId: id, entityType: "institution_ranking", sourceUrl: nirfUrl, payload });
    await sql`
      insert into colleges (id, name, city, state, type, annual_cost_inr, branches, hostel_available, culture_tags, source_record_id, source_url, review_status, last_verified_at, is_mock_data)
      values (${id}, ${name}, ${city}, ${state}, 'government', 0, ${[]}::text[], false, ${[]}::text[], ${recordId}, ${nirfUrl}, 'published', ${now}, false)
      on conflict (id) do update set name = excluded.name, city = excluded.city, state = excluded.state, source_record_id = excluded.source_record_id, source_url = excluded.source_url, review_status = 'published', last_verified_at = excluded.last_verified_at, is_mock_data = false
    `;
    await sql`
      insert into institution_rankings (id, institution_id, framework, category, ranking_year, rank, score, source_record_id, source_url, review_status, last_verified_at)
      values (${`ranking-${id}-2025`}, ${id}, 'NIRF', 'Overall', 2025, ${rank}, ${score}, ${recordId}, ${nirfUrl}, 'published', ${now})
      on conflict (id) do update set rank = excluded.rank, score = excluded.score, source_record_id = excluded.source_record_id, source_url = excluded.source_url, review_status = 'published', last_verified_at = excluded.last_verified_at
    `;
  }

  for (const [id, title, org, location, description, tags] of aicteOpportunities) {
    const recordId = `source-${id}`;
    const payload = { title, org, location, description, tags, verifiedPortal: aicteUrl };
    await sourceRecord({ id: recordId, sourceId: "aicte-internships", externalId: id, entityType: "opportunity_portal", sourceUrl: aicteUrl, payload });
    await sql`
      insert into opportunities (id, type, title, org, location, description, tags, source_record_id, source_url, application_url, review_status, last_verified_at, is_mock_data)
      values (${id}, 'internship', ${title}, ${org}, ${location}, ${description}, ${tags}::text[], ${recordId}, ${aicteUrl}, ${aicteUrl}, 'published', ${now}, false)
      on conflict (id) do update set title = excluded.title, org = excluded.org, location = excluded.location, description = excluded.description, tags = excluded.tags, source_record_id = excluded.source_record_id, source_url = excluded.source_url, application_url = excluded.application_url, review_status = 'published', last_verified_at = excluded.last_verified_at, is_mock_data = false
    `;
  }

  console.log(`Published ${nirfInstitutions.length} NIRF institution records and ${aicteOpportunities.length} AICTE opportunity routes.`);
} finally {
  await sql.end({ timeout: 5 });
}
