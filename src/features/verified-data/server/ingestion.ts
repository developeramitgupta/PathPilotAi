import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  adminAuditEvents,
  dataSources,
  ingestionRuns,
  sourceRecords,
} from "@/lib/db/schema";

import { getOfficialSource, OFFICIAL_SOURCE_REGISTRY } from "../source-registry";

type JsonRecord = Record<string, unknown>;

function payloadHash(payload: JsonRecord) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function requireConfiguredDataGov() {
  const apiKey = process.env.DATA_GOV_API_KEY;
  const resourceId = process.env.DATA_GOV_AISHE_RESOURCE_ID;
  if (!apiKey || !resourceId) {
    throw new Error("DATA_SOURCE_NOT_CONFIGURED");
  }
  return { apiKey, resourceId };
}

export async function ensureOfficialSources() {
  const database = getDb();
  const now = new Date();
  for (const source of OFFICIAL_SOURCE_REGISTRY) {
    await database
      .insert(dataSources)
      .values({
        id: source.key,
        key: source.key,
        name: source.name,
        kind: source.kind,
        websiteUrl: source.websiteUrl,
        apiBaseUrl: source.apiBaseUrl,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: dataSources.key,
        set: {
          name: source.name,
          kind: source.kind,
          websiteUrl: source.websiteUrl,
          apiBaseUrl: source.apiBaseUrl,
          isActive: true,
          updatedAt: now,
        },
      });
  }
}

async function createRun(sourceId: string, actorUserId: string) {
  const database = getDb();
  const id = randomUUID();
  const now = new Date();
  await database.insert(ingestionRuns).values({
    id,
    sourceId,
    requestedByUserId: actorUserId,
    status: "running",
    startedAt: now,
    createdAt: now,
  });
  return id;
}

async function completeRun(
  runId: string,
  status: "succeeded" | "failed",
  summary: JsonRecord,
  errorMessage?: string,
) {
  await getDb()
    .update(ingestionRuns)
    .set({ status, summary, errorMessage, completedAt: new Date() })
    .where(eq(ingestionRuns.id, runId));
}

async function stageRecords({
  sourceKey,
  runId,
  entityType,
  records,
  actorUserId,
}: {
  sourceKey: string;
  runId: string;
  entityType: string;
  records: Array<{ externalId: string; sourceUrl: string; payload: JsonRecord }>;
  actorUserId: string;
}) {
  const source = getOfficialSource(sourceKey);
  if (!source) throw new Error("UNKNOWN_SOURCE");
  const database = getDb();
  const now = new Date();

  for (const record of records) {
    const sourceUrl = new URL(record.sourceUrl);
    const approvedOrigin = new URL(source.websiteUrl).origin;
    if (sourceUrl.origin !== approvedOrigin && source.kind !== "data_gov") {
      throw new Error("UNTRUSTED_SOURCE_URL");
    }
    const hash = payloadHash(record.payload);
    const [existing] = await database
      .select({ id: sourceRecords.id })
      .from(sourceRecords)
      .where(
        and(
          eq(sourceRecords.sourceId, sourceKey),
          eq(sourceRecords.externalId, record.externalId),
          eq(sourceRecords.payloadHash, hash),
        ),
      )
      .limit(1);

    if (!existing) {
      await database.insert(sourceRecords).values({
        id: randomUUID(),
        sourceId: sourceKey,
        ingestionRunId: runId,
        externalId: record.externalId,
        entityType,
        sourceUrl: record.sourceUrl,
        payload: record.payload,
        payloadHash: hash,
        retrievedAt: now,
        reviewStatus: "pending_review",
        updatedAt: now,
      });
    }
  }

  await database.insert(adminAuditEvents).values({
    id: randomUUID(),
    actorUserId,
    action: "ingestion.staged",
    subjectType: "ingestion_run",
    subjectId: runId,
    metadata: { sourceKey, entityType, count: records.length },
  });
}

/**
 * Ingests the configured AISHE resource through the documented OGD API. This
 * intentionally stages raw records only: normalisation and publication require
 * a human reviewer in the admin console.
 */
export async function importAishePage({
  actorUserId,
  offset = 0,
  limit = 100,
}: {
  actorUserId: string;
  offset?: number;
  limit?: number;
}) {
  const { apiKey, resourceId } = requireConfiguredDataGov();
  await ensureOfficialSources();
  const runId = await createRun("data-gov-aishe", actorUserId);

  try {
    const endpoint = new URL(`https://api.data.gov.in/resource/${resourceId}`);
    endpoint.searchParams.set("api-key", apiKey);
    endpoint.searchParams.set("format", "json");
    endpoint.searchParams.set("offset", String(Math.max(0, offset)));
    endpoint.searchParams.set("limit", String(Math.min(Math.max(1, limit), 500)));
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`DATA_GOV_HTTP_${response.status}`);
    const body = (await response.json()) as { records?: JsonRecord[] };
    const records = (body.records ?? []).map((payload, index) => ({
      externalId: String(payload._id ?? payload.id ?? `${offset + index}`),
      sourceUrl: endpoint.toString(),
      payload,
    }));
    await stageRecords({
      sourceKey: "data-gov-aishe",
      runId,
      entityType: "aishe_institution",
      records,
      actorUserId,
    });
    await completeRun(runId, "succeeded", { received: records.length, offset, limit });
    return { runId, received: records.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import failure";
    await completeRun(runId, "failed", { offset, limit }, message);
    throw error;
  }
}

export async function listAdminIngestionOverview() {
  await ensureOfficialSources();
  const database = getDb();
  const [sources, runs, pendingRecords] = await Promise.all([
    database.select().from(dataSources).orderBy(dataSources.name),
    database.select().from(ingestionRuns).orderBy(desc(ingestionRuns.createdAt)).limit(20),
    database
      .select({
        id: sourceRecords.id,
        sourceId: sourceRecords.sourceId,
        entityType: sourceRecords.entityType,
        sourceUrl: sourceRecords.sourceUrl,
        retrievedAt: sourceRecords.retrievedAt,
        reviewStatus: sourceRecords.reviewStatus,
        payload: sourceRecords.payload,
      })
      .from(sourceRecords)
      .where(eq(sourceRecords.reviewStatus, "pending_review"))
      .orderBy(desc(sourceRecords.retrievedAt))
      .limit(30),
  ]);
  return { sources, runs, pendingRecords };
}

export async function reviewSourceRecord({
  recordId,
  actorUserId,
  decision,
}: {
  recordId: string;
  actorUserId: string;
  decision: "published" | "rejected";
}) {
  const database = getDb();
  const now = new Date();
  const [record] = await database
    .select({ id: sourceRecords.id })
    .from(sourceRecords)
    .where(eq(sourceRecords.id, recordId))
    .limit(1);
  if (!record) throw new Error("SOURCE_RECORD_NOT_FOUND");

  await database.transaction(async (tx) => {
    await tx
      .update(sourceRecords)
      .set({
        reviewStatus: decision,
        reviewedByUserId: actorUserId,
        reviewedAt: now,
        publishedAt: decision === "published" ? now : null,
        updatedAt: now,
      })
      .where(eq(sourceRecords.id, recordId));
    await tx.insert(adminAuditEvents).values({
      id: randomUUID(),
      actorUserId,
      action: `source_record.${decision}`,
      subjectType: "source_record",
      subjectId: recordId,
      metadata: { decision },
    });
  });
}
