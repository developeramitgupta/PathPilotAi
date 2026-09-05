import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

const globalForDatabase = globalThis as unknown as {
  pathPilotDb: Database | undefined;
  pathPilotSql: Sql | undefined;
};

export function getDb(): Database {
  if (globalForDatabase.pathPilotDb) {
    return globalForDatabase.pathPilotDb;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for database access.");
  }

  const client = postgres(connectionString, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 5,
    prepare: false,
  });
  const database = drizzle({ client, schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDatabase.pathPilotSql = client;
    globalForDatabase.pathPilotDb = database;
  }

  return database;
}
