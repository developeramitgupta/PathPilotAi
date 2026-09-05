"use client";

import Link from "next/link";
import { ArrowRight, Check, Circle, Clock3, Flag, Map, Route, Sparkles, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStudentJourney, studentJourneyConfig, type StudentJourney } from "@/features/student-journey/config";
import { usePathPilotProgressModel } from "@/features/pathpilot/use-progress-model";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

type TimelineStep = {
  id: string;
  label: string;
  title: string;
  detail: string;
  href: string;
  icon: LucideIcon;
  complete: boolean;
};

function journeySteps(journey: StudentJourney, state: { hasProfile: boolean; hasCareer: boolean; hasRoadmap: boolean; hasMission: boolean; hasEvidence: boolean }) {
  const shared: TimelineStep[] = [
    { id: "profile", label: "Start", title: "Tell us where you are now", detail: "Your profile anchors every recommendation and can be updated as your plans change.", href: "/onboarding", icon: Sparkles, complete: state.hasProfile },
    { id: "direction", label: "Direction", title: "Explore a direction", detail: "Compare career paths using your interests, strengths, and preferences.", href: "/career-discovery", icon: Map, complete: state.hasCareer },
  ];

  const stageSteps: Record<StudentJourney, TimelineStep[]> = {
    "stream-explorer": [
      { id: "pathway", label: "Class 10", title: "Choose a stream pathway", detail: "Turn your subject preferences into a Class 11 stream decision while keeping future options visible.", href: "/roadmap", icon: Route, complete: state.hasRoadmap },
      { id: "activities", label: "Class 11", title: "Build skills and activities", detail: "Use small projects, clubs, and learning activities to test the paths that interest you.", href: "/learning", icon: Sparkles, complete: state.hasEvidence },
    ],
    "education-planner": [
      { id: "degree", label: "Degree", title: "Shortlist degree routes", detail: "Compare duration, cost, outcomes, and fit before committing to one route.", href: "/degrees", icon: Route, complete: state.hasCareer },
      { id: "college", label: "College", title: "Set college and exam priorities", detail: "Use your budget and location constraints to investigate colleges and official entrance exams.", href: "/colleges", icon: Map, complete: state.hasRoadmap },
    ],
    "career-launch": [
      { id: "evidence", label: "Evidence", title: "Build proof of readiness", detail: "Turn skills and projects into visible evidence for internships, jobs, or higher studies.", href: "/resume", icon: Sparkles, complete: state.hasEvidence },
      { id: "launch", label: "Launch", title: "Choose your next career move", detail: "Compare job and higher-studies directions, then prepare a focused action plan.", href: "/roadmap", icon: Route, complete: state.hasRoadmap },
    ],
  };

  return [
    ...shared,
    ...stageSteps[journey],
    { id: "mission", label: "Momentum", title: "Run your mission", detail: "Convert the next decision into weighted milestones and make steady progress visible.", href: "/mission", icon: Flag, complete: state.hasMission },
  ];
}

export function StudentTimelineScreen() {
  const journeyValue = usePathPilotStore((state) => state.studentJourney);
  const { profileState, career, roadmap, missionState, progress } = usePathPilotProgressModel();
  const journey = getStudentJourney(journeyValue);
  const config = studentJourneyConfig[journey];
  const steps = journeySteps(journey, {
    hasProfile: Boolean(profileState),
    hasCareer: Boolean(career),
    hasRoadmap: Boolean(roadmap),
    hasMission: Boolean(missionState),
    hasEvidence: progress.completedThisWeek > 0,
  });
  const nextIndex = Math.max(0, steps.findIndex((step) => !step.complete));
  const completeCount = steps.filter((step) => step.complete).length;

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap gap-2"><Badge><Clock3 className="size-3" /> Student Timeline</Badge><Badge variant="success">{config.label}</Badge></div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">A path that moves with you.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">This is your current journey, not a fixed checklist. Each step opens the right tool for where you are now.</p>
        </div>
        <Card className="min-w-44 p-4"><p className="text-xs font-medium text-muted-foreground">Journey progress</p><p className="mt-1 font-data text-2xl font-semibold">{completeCount}/{steps.length}</p><p className="mt-1 text-xs text-muted-foreground">steps with evidence</p></Card>
      </div>

      <Card className="mt-7 overflow-hidden p-5 sm:p-8">
        <ol className="relative ml-3 border-l border-border sm:ml-5">
          {steps.map((step, index) => {
            const isNext = index === nextIndex && !step.complete;
            const status = step.complete ? "complete" : isNext ? "next" : "future";
            const Icon = step.complete ? Check : step.icon;
            return (
              <li key={step.id} className="relative pb-8 pl-8 last:pb-0 sm:pl-10">
                <span className={cn("absolute -left-3 top-0 grid size-6 place-items-center rounded-full border bg-background", status === "complete" && "border-success/35 bg-success/10 text-success", status === "next" && "border-primary/45 bg-primary/10 text-primary")}>{status === "future" ? <Circle className="size-3" /> : <Icon className="size-3.5" />}</span>
                <div className={cn("rounded-xl border p-4 sm:p-5", status === "next" && "border-primary/35 bg-primary/[0.045]", status === "complete" && "border-success/20 bg-success/[0.025]")}> 
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant={status === "complete" ? "success" : status === "next" ? "default" : "demo"}>{step.label}</Badge><span className="text-xs capitalize text-muted-foreground">{status === "next" ? "Your next action" : status}</span></div><h2 className="mt-3 text-lg font-semibold">{step.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{step.detail}</p></div>
                    <Button className="shrink-0" size="sm" variant={isNext ? "default" : "secondary"} asChild><Link href={step.href}>{step.complete ? "Review" : isNext ? "Continue" : "Open"} <ArrowRight /></Link></Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
