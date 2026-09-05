import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, desc, eq, gt } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { parentalConsents, studentProfiles } from "@/lib/db/schema";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createParentalConsentRequest(
  studentUserId: string,
  parentEmail: string,
) {
  const database = getDb();
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await database.insert(parentalConsents).values({
    id: randomUUID(),
    studentUserId,
    parentEmail: normaliseEmail(parentEmail),
    consentTokenHash: tokenHash(token),
    status: "pending",
    requestedAt: now,
    expiresAt,
  });

  // Mail delivery is intentionally decoupled. A configured transactional-email
  // adapter will deliver this one-time URL; the raw token is never persisted.
  return { token, expiresAt };
}

export async function grantParentalConsent(
  token: string,
  authenticatedParentEmail: string,
) {
  const database = getDb();
  const [request] = await database
    .select()
    .from(parentalConsents)
    .where(
      and(
        eq(parentalConsents.consentTokenHash, tokenHash(token)),
        eq(parentalConsents.status, "pending"),
        gt(parentalConsents.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!request || request.parentEmail !== normaliseEmail(authenticatedParentEmail)) {
    throw new Error("INVALID_CONSENT_INVITE");
  }

  await database
    .update(parentalConsents)
    .set({ status: "granted", grantedAt: new Date() })
    .where(eq(parentalConsents.id, request.id));

  return { studentUserId: request.studentUserId };
}

export async function hasActiveParentalConsent(studentUserId: string) {
  const [request] = await getDb()
    .select({ id: parentalConsents.id })
    .from(parentalConsents)
    .where(
      and(
        eq(parentalConsents.studentUserId, studentUserId),
        eq(parentalConsents.status, "granted"),
        gt(parentalConsents.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(parentalConsents.grantedAt))
    .limit(1);
  return Boolean(request);
}

/** Enforced by all upcoming sensitive-data writers (uploads, AI persistence, sharing). */
export async function assertPersonalDataConsent(studentUserId: string) {
  const [profile] = await getDb()
    .select({ ageBand: studentProfiles.ageBand })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, studentUserId))
    .limit(1);
  if (profile && profile.ageBand !== "adult" && !(await hasActiveParentalConsent(studentUserId))) {
    throw new Error("PARENTAL_CONSENT_REQUIRED");
  }
}
