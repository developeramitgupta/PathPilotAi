"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  GitBranch,
  RefreshCw,
  Route,
  Sparkles,
  Zap,
} from "lucide-react";

import {
  EmptyState,
  ErrorBanner,
  LoadingSkeleton,
} from "@/components/shared/feedback-states";
import { LearningCoachPanel } from "@/components/learning/learning-coach-panel";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer, Modal } from "@/components/ui/dialog";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import type {
  CareerMatchResult,
  RoadmapMilestone,
  RoadmapPlan,
} from "@/features/pathpilot/schemas";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

function MilestoneNode({
  milestone,
  last,
  onOpen,
}: {
  milestone: RoadmapMilestone;
  last: boolean;
  onOpen: () => void;
}) {
  const Icon = milestone.status === "done" ? CheckCircle2 : milestone.status === "active" ? Zap : Circle;
  return (
    <li className="relative grid grid-cols-[40px_1fr] gap-3 sm:grid-cols-[52px_1fr] sm:gap-4">
      {last ? null : <span className="absolute bottom-[-1rem] left-[19px] top-10 w-px bg-border sm:left-[25px]" />}
      <div className={cn("relative z-10 grid size-10 place-items-center rounded-full border bg-background sm:size-[52px]", milestone.status === "done" && "border-success/35 bg-success/10 text-success", milestone.status === "active" && "border-primary/45 bg-primary/15 text-[#b8adff]", milestone.status === "upcoming" && "border-border text-muted-foreground")}><Icon className="size-4 sm:size-5" /></div>
      <button type="button" onClick={onOpen} className={cn("rounded-xl border border-border bg-card/75 p-4 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-primary/25 sm:p-5", milestone.status === "active" && "border-primary/25 bg-primary/[0.06]")}>
        <div className="flex flex-wrap items-center gap-2"><Badge variant={milestone.status === "done" ? "success" : milestone.status === "active" ? "default" : "demo"}>{milestone.phase}</Badge><span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 className="size-3" /> {milestone.estWeeks} weeks</span></div>
        <h3 className="mt-3 font-semibold tracking-[-0.02em]">{milestone.title}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{milestone.description}</p>
        <p className="mt-3 text-[11px] font-medium text-[#aaa0ef]">Open milestone <ArrowRight className="ml-1 inline size-3" /></p>
      </button>
    </li>
  );
}

export function RoadmapScreen() {
  const profile = usePathPilotStore((state) => state.profile);
  const discovery = usePathPilotStore((state) => state.careerDiscovery);
  const decisions = usePathPilotStore((state) => state.decisions);
  const selectedCareerKey = usePathPilotStore((state) => state.selectedCareerKey);
  const roadmap = usePathPilotStore((state) => state.roadmap);
  const setRoadmap = usePathPilotStore((state) => state.setRoadmap);
  const toggleMilestone = usePathPilotStore((state) => state.toggleMilestone);
  const [selectedMilestone, setSelectedMilestone] = useState<RoadmapMilestone | null>(null);
  const [refreshOpen, setRefreshOpen] = useState(false);
  const startedInitialGeneration = useRef(false);

  const career: CareerMatchResult | undefined =
    discovery?.matches.find((match) => match.careerKey === selectedCareerKey) ??
    discovery?.matches[0];

  const generateMutation = useMutation({
    mutationFn: (previous?: RoadmapPlan) => {
      if (!career || !profile) throw new Error("Choose a career before generating a roadmap.");
      const endpoint = previous ? "/api/roadmap/refresh" : "/api/roadmap/generate";
      return requestPathPilot<{ result: RoadmapPlan }>(endpoint, {
        method: "POST",
        body: JSON.stringify({ career, profile, decisions, previous }),
      });
    },
    onSuccess: ({ result }) => {
      setRoadmap(result);
      setRefreshOpen(false);
    },
  });

  useEffect(() => {
    if (
      !roadmap &&
      profile &&
      career &&
      !startedInitialGeneration.current
    ) {
      startedInitialGeneration.current = true;
      generateMutation.mutate(undefined);
    }
  }, [career, generateMutation, profile, roadmap]);

  if (!profile || !discovery || !career) {
    return <EmptyState title="Pick a career from Discovery to generate your roadmap" description="Your roadmap is built from a chosen career, your current stage, learning style, strengths, and visible Decision Memory." href={profile ? "/career-discovery" : "/onboarding"} action={profile ? "Choose a career" : "Complete onboarding"} />;
  }

  if (generateMutation.isPending && !roadmap) {
    return <div className="mx-auto max-w-5xl"><div className="mb-5"><Badge><Sparkles className="size-3" /> Roadmap Generator</Badge><h1 className="mt-4 text-3xl font-semibold">Building your {career.careerName} roadmap</h1><p className="mt-2 text-sm text-[#b8adff]" role="status">Reading your profile… sequencing milestones… matching resources…</p></div><LoadingSkeleton variant="timeline" /></div>;
  }

  if (!roadmap) {
    return <div className="mx-auto max-w-5xl"><ErrorBanner message={generateMutation.error?.message ?? "Your roadmap could not be generated."} onRetry={() => generateMutation.mutate(undefined)} /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div><div className="flex flex-wrap items-center gap-2"><Badge><Route className="size-3" /> Career Roadmap</Badge><Badge variant={roadmap.mode === "ai" ? "success" : "demo"}>{roadmap.mode === "ai" ? "AI-generated" : "Deterministic fallback"}</Badge><Badge variant="demo">Version {roadmap.version}</Badge></div><h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your path to {roadmap.careerName}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">A living plan that preserves completed work and explains every refresh.</p></div>
        <div className="flex flex-wrap gap-3"><Button variant="secondary" disabled={generateMutation.isPending} onClick={() => setRefreshOpen(true)}><RefreshCw className={generateMutation.isPending ? "animate-spin" : ""} /> Refresh Roadmap</Button><Button asChild><Link href="/mission"><Flag /> Continue to Mission Mode</Link></Button></div>
      </div>

      {roadmap.version > 1 ? <div className="mt-6 flex gap-3 rounded-lg border border-primary/20 bg-primary/8 p-4"><GitBranch className="mt-0.5 size-4 shrink-0 text-[#b3a8ff]" /><div><p className="text-xs font-semibold text-[#c6beff]">What changed in version {roadmap.version}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{roadmap.changelog}</p></div></div> : null}
      {generateMutation.isError && roadmap ? <div className="mt-5"><ErrorBanner message="Refresh failed, so your last-known-good roadmap is still shown." onRetry={() => generateMutation.mutate(roadmap)} /></div> : null}

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="p-5 sm:p-7">
          <ol className="grid gap-4">
            {roadmap.milestones.map((milestone, index) => <MilestoneNode key={milestone.id} milestone={milestone} last={index === roadmap.milestones.length - 1} onOpen={() => setSelectedMilestone(milestone)} />)}
          </ol>
        </Card>
        <div className="grid h-fit gap-4 xl:sticky xl:top-24">
          <Card className="flex items-center gap-5 p-5"><ProgressRing value={roadmap.progressPct} label="complete" size="sm" /><div><p className="text-xs text-muted-foreground">Overall progress</p><p className="mt-1 text-xl font-semibold">{roadmap.milestones.filter((milestone) => milestone.status === "done").length} of {roadmap.milestones.length}</p><p className="mt-1 text-[11px] text-muted-foreground">milestones complete</p></div></Card>
          <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Roadmap principles</p><div className="mt-4 grid gap-3 text-xs leading-5 text-muted-foreground">{["Completed work stays complete across versions.", "Rejected paths inform every refresh.", "Resource ranking follows the active milestone."].map((item) => <p className="flex gap-2" key={item}><Check className="mt-0.5 size-3.5 shrink-0 text-success" />{item}</p>)}</div></Card>
        </div>
      </div>

      <Drawer open={Boolean(selectedMilestone)} onOpenChange={(open) => { if (!open) setSelectedMilestone(null); }} title={selectedMilestone?.title ?? "Milestone"} description={selectedMilestone?.description}>
        {selectedMilestone ? (
          <div>
            <div className="flex flex-wrap gap-2"><Badge>{selectedMilestone.phase}</Badge><Badge variant={selectedMilestone.status === "done" ? "success" : "demo"}>{selectedMilestone.status}</Badge><Badge variant="demo">{selectedMilestone.estWeeks} weeks</Badge></div>
            <div className="mt-6"><LearningCoachPanel compact milestone={selectedMilestone.title} skillTag={selectedMilestone.skillTag} learningStyle={profile.learningStyle} /></div>
            <div className="sticky bottom-0 mt-7 border-t border-border bg-popover/95 py-4 backdrop-blur-xl"><Button className="w-full" onClick={() => toggleMilestone(selectedMilestone.id)}>{selectedMilestone.status === "done" ? <><RefreshCw /> Mark active again</> : <><CheckCircle2 /> Mark milestone complete</>}</Button></div>
          </div>
        ) : null}
      </Drawer>

      <Modal open={refreshOpen} onOpenChange={setRefreshOpen} title="Refresh this roadmap?" description="Remaining milestones may shift. Completed work stays preserved, and version history will record what changed.">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => setRefreshOpen(false)}>Cancel</Button><Button onClick={() => generateMutation.mutate(roadmap)} disabled={generateMutation.isPending}>{generateMutation.isPending ? <><RefreshCw className="animate-spin" /> Refreshing…</> : <><Sparkles /> Confirm refresh</>}</Button></div>
      </Modal>
    </div>
  );
}
