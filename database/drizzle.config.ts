import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadDatabaseEnvironment() {
  for (const filename of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(resolve(projectRoot, filename));
      return;
    } catch {
      // A local environment file is optional when the platform injects variables.
    }
  }
}

loadDatabaseEnvironment();

const migrationUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "../database/drizzle",
  dbCredentials: {
    url: migrationUrl,
  },
  migrations: {
    prefix: "timestamp",
  },
  strict: true,
  verbose: true,
});
