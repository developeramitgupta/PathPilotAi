"use client";

import { useMemo } from "react";

import { usePathPilotStore } from "@/stores/pathpilot-store";
import { calculateCareerHealth } from "./health-engine";
import { buildMissionPlan } from "./mission-engine";
import { buildProgressSnapshot } from "./progress-engine";
import { defaultOnboardingProfile } from "./schemas";

const previewTimestamp = "2026-08-24T09:00:00.000Z";

export function usePathPilotProgressModel() {
  const profileState = usePathPilotStore((state) => state.profile);
  const discovery = usePathPilotStore((state) => state.careerDiscovery);
  const selectedCareerKey = usePathPilotStore((state) => state.selectedCareerKey);
  const roadmap = usePathPilotStore((state) => state.roadmap);
  const missionState = usePathPilotStore((state) => state.mission);
  const decisions = usePathPilotStore((state) => state.decisions);
  const resourceProgress = usePathPilotStore((state) => state.resourceProgress);
  const profile = profileState ?? defaultOnboardingProfile;
  const career =
    discovery?.matches.find((item) => item.careerKey === selectedCareerKey) ??
    discovery?.matches[0];

  const initialHealth = useMemo(
    () =>
      calculateCareerHealth({
        profile,
        roadmap,
        mission: missionState,
        resourceProgress,
        decisionCount: decisions.length,
      }),
    [decisions.length, missionState, profile, resourceProgress, roadmap],
  );
  const mission = useMemo(
    () =>
      missionState ??
      buildMissionPlan(
        {
          goal: career?.careerName ?? "Product Designer",
          targetType: "dream-career",
          healthScore: initialHealth.score,
          roadmap,
          career,
        },
        previewTimestamp,
      ),
    [career, initialHealth.score, missionState, roadmap],
  );
  const health = useMemo(
    () =>
      calculateCareerHealth({
        profile,
        roadmap,
        mission,
        resourceProgress,
        decisionCount: decisions.length,
      }),
    [decisions.length, mission, profile, resourceProgress, roadmap],
  );
  const progress = useMemo(
    () =>
      buildProgressSnapshot({
        profile,
        health,
        roadmap,
        mission,
        resourceProgress,
        decisionCount: decisions.length,
      }),
    [decisions.length, health, mission, profile, resourceProgress, roadmap],
  );

  return {
    profileState,
    profile,
    career,
    roadmap,
    missionState,
    mission,
    health,
    progress,
    resourceProgress,
    decisions,
  };
}
