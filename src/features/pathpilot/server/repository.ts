import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  achievements,
  careerMatches,
  decisions,
  missionMilestones,
  missions,
  roadmapMilestones,
  roadmaps,
  roadmapVersions,
  studentProfiles,
  users,
} from "@/lib/db/schema";
import {
  defaultOnboardingProfile,
  type CareerDiscoveryResult,
  type DecisionRecord,
  type MissionPlan,
  type OnboardingProfile,
  type RoadmapPlan,
} from "../schemas";

export async function saveOnboardingProfile(
  userId: string,
  profile: OnboardingProfile,
) {
  const database = getDb();
  const now = new Date();
  const workStyle = {
    ...profile.workStyle,
    preferredWorkMode: profile.preferredWorkMode,
    preferredEnvironment: profile.preferredEnvironment,
    preferredStructure: profile.preferredStructure,
    studyBudget: profile.studyBudget,
    learningStyle: profile.learningStyle,
  };

  await database.transaction(async (tx) => {
    await tx
      .insert(users)
      .values({
        id: userId,
        name: profile.name,
        email: `${userId}@users.pathpilot.local`,
        city: profile.city,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: { name: profile.name, city: profile.city, updatedAt: now },
      });

    await tx
      .insert(studentProfiles)
      .values({
        id: randomUUID(),
        userId,
        interests: profile.interests,
        favoriteSubjects: profile.favoriteSubjects,
        workStyle,
        hobbies: profile.hobbies,
        salaryExpectation: profile.salaryExpectation,
        locationPref: profile.locationPref,
        studyPref: profile.studyPref,
        higherStudiesLean: profile.higherStudiesLean,
        strengths: profile.strengths,
        weaknesses: profile.weaknesses,
        currentStage: profile.currentStage,
        onboardingDone: true,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: studentProfiles.userId,
        set: {
          interests: profile.interests,
          favoriteSubjects: profile.favoriteSubjects,
          workStyle,
          hobbies: profile.hobbies,
          salaryExpectation: profile.salaryExpectation,
          locationPref: profile.locationPref,
          studyPref: profile.studyPref,
          higherStudiesLean: profile.higherStudiesLean,
          strengths: profile.strengths,
          weaknesses: profile.weaknesses,
          currentStage: profile.currentStage,
          onboardingDone: true,
          updatedAt: now,
        },
      });
  });
}

export async function loadOnboardingProfile(userId: string) {
  const database = getDb();
  const [row] = await database
    .select({ user: users, profile: studentProfiles })
    .from(studentProfiles)
    .innerJoin(users, eq(users.id, studentProfiles.userId))
    .where(eq(studentProfiles.userId, userId))
    .limit(1);
  if (!row) return null;
  const style = row.profile.workStyle as Record<string, unknown>;

  return {
    ...defaultOnboardingProfile,
    name: row.user.name,
    city: row.user.city ?? defaultOnboardingProfile.city,
    currentStage:
      (row.profile.currentStage as OnboardingProfile["currentStage"]) ??
      defaultOnboardingProfile.currentStage,
    interests: row.profile.interests ?? [],
    favoriteSubjects: row.profile.favoriteSubjects ?? [],
    hobbies: row.profile.hobbies ?? [],
    workStyle: {
      ...defaultOnboardingProfile.workStyle,
      ...style,
    },
    preferredWorkMode:
      (style.preferredWorkMode as OnboardingProfile["preferredWorkMode"]) ??
      "balanced",
    preferredEnvironment:
      (style.preferredEnvironment as OnboardingProfile["preferredEnvironment"]) ??
      "hybrid",
    preferredStructure:
      (style.preferredStructure as OnboardingProfile["preferredStructure"]) ??
      "balanced",
    studyBudget:
      (style.studyBudget as OnboardingProfile["studyBudget"]) ?? "medium",
    learningStyle:
      (style.learningStyle as OnboardingProfile["learningStyle"]) ?? "blended",
    salaryExpectation:
      row.profile.salaryExpectation as OnboardingProfile["salaryExpectation"],
    locationPref: row.profile.locationPref as OnboardingProfile["locationPref"],
    studyPref: row.profile.studyPref as OnboardingProfile["studyPref"],
    higherStudiesLean: row.profile.higherStudiesLean,
    strengths: row.profile.strengths ?? [],
    weaknesses: row.profile.weaknesses ?? [],
  } satisfies OnboardingProfile;
}

export async function replaceCareerMatches(
  userId: string,
  discovery: CareerDiscoveryResult,
) {
  const database = getDb();
  await database.transaction(async (tx) => {
    await tx.delete(careerMatches).where(eq(careerMatches.userId, userId));
    await tx.insert(careerMatches).values(
      discovery.matches.map((match) => ({
        id: randomUUID(),
        userId,
        careerKey: match.careerKey,
        careerName: match.careerName,
        compatibility: match.compatibility,
        why: match.why,
        reasoningRefs: match.reasoningRefs,
        salaryBandEntry: match.salaryBandEntry,
        salaryBandMid: match.salaryBandMid,
        salaryBandSenior: match.salaryBandSenior,
        demandTrend: match.demandTrend,
      })),
    );
  });
}

export async function listDecisionMemory(userId: string) {
  const database = getDb();
  const rows = await database
    .select()
    .from(decisions)
    .where(eq(decisions.userId, userId))
    .orderBy(desc(decisions.createdAt));

  return rows.map(
    (row) =>
      ({
        id: row.id,
        targetType: row.targetType,
        targetId: row.targetId,
        targetLabel: row.targetId,
        action: row.action,
        reason: row.reason ?? undefined,
        snoozedUntil: row.snoozedUntil?.toISOString(),
        createdAt: row.createdAt.toISOString(),
      }) satisfies DecisionRecord,
  );
}

export async function saveDecision(userId: string, decision: DecisionRecord) {
  const database = getDb();
  await database.insert(decisions).values({
    id: decision.id,
    userId,
    targetType: decision.targetType,
    targetId: decision.targetId,
    action: decision.action,
    reason: decision.reason,
    snoozedUntil: decision.snoozedUntil
      ? new Date(decision.snoozedUntil)
      : undefined,
    createdAt: new Date(decision.createdAt),
  });
}

export async function removeDecision(userId: string, decisionId: string) {
  const database = getDb();
  await database
    .delete(decisions)
    .where(and(eq(decisions.userId, userId), eq(decisions.id, decisionId)));
}

export async function saveRoadmapPlan(userId: string, plan: RoadmapPlan) {
  const database = getDb();
  await database.transaction(async (tx) => {
    await tx
      .insert(roadmaps)
      .values({
        id: plan.id,
        userId,
        careerKey: plan.careerKey,
        careerName: plan.careerName,
        activeVersion: plan.version,
        createdAt: new Date(plan.createdAt),
        updatedAt: new Date(plan.updatedAt),
      })
      .onConflictDoUpdate({
        target: roadmaps.id,
        set: {
          careerKey: plan.careerKey,
          careerName: plan.careerName,
          activeVersion: plan.version,
          updatedAt: new Date(plan.updatedAt),
        },
      });

    const versionId = randomUUID();
    await tx.insert(roadmapVersions).values({
      id: versionId,
      roadmapId: plan.id,
      version: plan.version,
      changelog: plan.changelog,
      createdAt: new Date(plan.updatedAt),
    });
    await tx.insert(roadmapMilestones).values(
      plan.milestones.map((milestone) => ({
        id: milestone.id,
        roadmapVersionId: versionId,
        title: milestone.title,
        description: milestone.description,
        phase: milestone.phase,
        status: milestone.status,
        estWeeks: milestone.estWeeks,
        orderIndex: milestone.orderIndex,
      })),
    );
  });
}

export async function saveMissionPlan(userId: string, plan: MissionPlan) {
  const database = getDb();
  await database.transaction(async (tx) => {
    await tx.delete(missions).where(eq(missions.userId, userId));
    await tx.insert(missions).values({
      id: plan.id,
      userId,
      goal: plan.goal,
      level: plan.level,
      progressPct: plan.progressPct,
      createdAt: new Date(plan.createdAt),
      updatedAt: new Date(plan.updatedAt),
    });
    await tx.insert(missionMilestones).values(
      plan.milestones.map((milestone) => ({
        id: milestone.id,
        missionId: plan.id,
        title: milestone.title,
        weight: milestone.weight,
        status: milestone.status,
        completedAt:
          milestone.status === "done" ? new Date(plan.updatedAt) : undefined,
      })),
    );

    const unlocked = plan.achievements.filter((achievement) => achievement.unlocked);
    if (unlocked.length) {
      await tx
        .insert(achievements)
        .values(
          unlocked.map((achievement) => ({
            id: randomUUID(),
            userId,
            badgeKey: achievement.key,
            unlockedAt: new Date(plan.updatedAt),
          })),
        )
        .onConflictDoNothing();
    }
  });
}
