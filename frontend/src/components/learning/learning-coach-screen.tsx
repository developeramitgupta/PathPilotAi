"use client";

import { BookOpenCheck } from "lucide-react";

import { EmptyState } from "@/components/shared/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LearningCoachPanel } from "@/components/learning/learning-coach-panel";
import { usePathPilotStore } from "@/stores/pathpilot-store";

export function LearningCoachScreen() {
  const profile = usePathPilotStore((state) => state.profile);
  const roadmap = usePathPilotStore((state) => state.roadmap);
  if (!profile || !roadmap) {
    return <EmptyState title="Build a roadmap before browsing resources" description="Learning Coach ranks resources against a specific milestone, skill level, and learning style instead of showing a generic course catalogue." href="/roadmap" action="Open Career Roadmap" />;
  }
  const active = roadmap.milestones.find((milestone) => milestone.status === "active") ?? roadmap.milestones[0];
  if (!active) return null;

  return (
    <div className="mx-auto max-w-6xl">
      <div><Badge><BookOpenCheck className="size-3" /> Resource workspace</Badge><h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Learning Coach</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Resources are retrieved and ranked for your active milestone: <span className="text-foreground">{active.title}</span>.</p></div>
      <Card className="mt-7 p-5 sm:p-7"><LearningCoachPanel milestone={active.title} skillTag={active.skillTag} learningStyle={profile.learningStyle} /></Card>
    </div>
  );
}
