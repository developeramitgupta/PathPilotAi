import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { serviceAvailability } from "@/lib/env";

export type PathPilotActor = {
  userId: string;
  isPreview: boolean;
};

/**
 * Resolves the authenticated Clerk subject without ever trusting client-supplied
 * identity data. A deterministic preview actor keeps the credentials-free demo
 * runnable locally; production never takes this branch.
 */
export async function getPathPilotActor(): Promise<PathPilotActor> {
  if (!serviceAvailability.clerk) {
    return { userId: "preview-user", isPreview: true };
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return { userId, isPreview: false };
}

export async function getPathPilotUserId() {
  const actor = await getPathPilotActor();
  if (serviceAvailability.database) {
    if (actor.isPreview) {
      await ensurePreviewUser(actor);
    } else {
      await ensurePathPilotUser(actor);
    }
  }
  return actor.userId;
}

/** Allows the credentials-free local preview to exercise database-backed flows. */
async function ensurePreviewUser(actor: PathPilotActor) {
  const now = new Date();
  await getDb()
    .insert(users)
    .values({ id: actor.userId, name: "PathPilot preview", email: "preview-user@users.pathpilot.local", updatedAt: now })
    .onConflictDoUpdate({ target: users.id, set: { updatedAt: now } });
}

/** Returns the verified primary Clerk email for consent/invite verification. */
export async function getAuthenticatedEmail() {
  const actor = await getPathPilotActor();
  if (actor.isPreview) {
    return "preview-user@users.pathpilot.local";
  }
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) throw new Error("EMAIL_REQUIRED");
  return email;
}

/** Creates/refreshes the server-owned user row from verified Clerk identity data. */
async function ensurePathPilotUser(actor: PathPilotActor) {
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  if (!email) throw new Error("EMAIL_REQUIRED");
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "PathPilot student";
  const now = new Date();
  await getDb()
    .insert(users)
    .values({ id: actor.userId, name, email: email.toLowerCase(), updatedAt: now })
    .onConflictDoUpdate({
      target: users.id,
      set: { name, email: email.toLowerCase(), updatedAt: now },
    });
}

/** Server-side role check. Roles are stored in Postgres, never in editable client metadata. */
export async function requirePathPilotAdmin() {
  const actor = await getPathPilotActor();
  if (actor.isPreview || !serviceAvailability.database) {
    throw new Error("FORBIDDEN");
  }

  const [user] = await getDb()
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, actor.userId))
    .limit(1);

  if (user?.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return actor;
}
