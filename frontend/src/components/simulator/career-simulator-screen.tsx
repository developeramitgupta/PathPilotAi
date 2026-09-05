"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Clock3, LoaderCircle, Sparkles, Target } from "lucide-react";

import { ErrorBanner } from "@/components/shared/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import { buildMissionPlan } from "@/features/pathpilot/mission-engine";
import type { MissionInput, MissionPlan } from "@/features/pathpilot/schemas";
import { usePathPilotProgressModel } from "@/features/pathpilot/use-progress-model";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const fallbackSkills = ["Core domain concepts", "Practical problem solving", "Portfolio evidence", "Clear communication"];

function clamp(value: number) { return Math.max(0, Math.min(100, Math.round(value))); }

function readinessBand(score: number) {
  if (score >= 75) return { label: "Strong readiness", description: "You have meaningful evidence and a sustainable preparation rhythm." };
  if (score >= 50) return { label: "Building readiness", description: "Your direction is taking shape; focus on closing the visible gaps below." };
  return { label: "Starting readiness", description: "Build a foundation first, then add proof through small, completed work." };
}

export function CareerSimulatorScreen() {
  const router = useRouter();
  const setMission = usePathPilotStore((state) => state.setMission);
  const { career, roadmap, health, progress } = usePathPilotProgressModel();
  const [role, setRole] = useState(career?.careerName ?? "");
  const [hours, setHours] = useState(8);
  const [showScenario, setShowScenario] = useState(false);

  const scenario = useMemo(() => {
    const roleName = role.trim() || "your target role";
    const skills = career?.starterSkills ?? fallbackSkills;
    const completedTags = new Set((roadmap?.milestones ?? []).filter((item) => item.status === "done").map((item) => item.skillTag.toLowerCase()));
    const gaps = skills.filter((skill) => !completedTags.has(skill.toLowerCase()));
    const evidence = roadmap ? roadmap.progressPct : 0;
    const consistency = Math.min(100, progress.completedThisWeek * 25);
    const weeklyCapacity = Math.min(100, (Math.max(1, hours) / 15) * 100);
    const directionSignal = career && roleName.toLowerCase() === career.careerName.toLowerCase() ? 100 : career ? 70 : 45;
    const score = clamp(evidence * 0.4 + consistency * 0.15 + weeklyCapacity * 0.3 + directionSignal * 0.15);
    const estimatedHours = 180 + gaps.length * 45;
    const weeks = Math.max(12, Math.ceil(estimatedHours / Math.max(1, hours)));
    return { roleName, skills, gaps, score, weeks, estimatedHours, band: readinessBand(score) };
  }, [career, hours, progress.completedThisWeek, roadmap, role]);

  const missionInput: MissionInput = {
    goal: scenario.roleName === "your target role" ? "Build career readiness" : scenario.roleName,
    targetType: "dream-career",
    healthScore: health.score,
    roadmap,
    career,
  };
  const missionMutation = useMutation({
    mutationFn: (input: MissionInput) => requestPathPilot<{ result: MissionPlan }>("/api/mission/set-goal", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: ({ result }) => setMission(result),
  });

  function convertToMission() {
    // Persist immediately in the local workspace so the handoff never blocks on an optional cloud connection.
    setMission(buildMissionPlan(missionInput));
    missionMutation.mutate(missionInput);
    router.push("/mission");
  }

  const salaryBands = career && scenario.roleName.toLowerCase() === career.careerName.toLowerCase()
    ? [["Entry", career.salaryBandEntry], ["Mid", career.salaryBandMid], ["Senior", career.salaryBandSenior]]
    : [["Entry", "Unavailable for a custom role"], ["Mid", "Choose a matched career to view"], ["Senior", "static career-band reference"]];

  return <div className="mx-auto max-w-6xl space-y-7 pb-16">
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-9"><div className="flex flex-wrap gap-2"><Badge><Target className="size-3" /> Career Simulator</Badge><Badge variant="success">Transparent estimates</Badge></div><h1 className="mt-5 font-display text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">Turn a role into a plan you can test.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">This tool shows the assumptions behind time, readiness, and salary references. It is planning guidance—not a promise of employment or pay.</p></section>
    <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <Card><CardHeader><CardTitle>Set your scenario</CardTitle><CardDescription>Adjust the target and your real weekly availability.</CardDescription></CardHeader><CardContent className="space-y-4"><label className="grid gap-2 text-sm font-medium">Target role<Input value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Data Analyst" /></label><label className="grid gap-2 text-sm font-medium">Hours available each week<Input type="number" min="1" max="60" value={hours} onChange={(event) => setHours(Math.max(1, Number(event.target.value) || 1))} /></label><Button className="w-full" onClick={() => setShowScenario(true)} disabled={role.trim().length < 2}><Sparkles />Generate scenario</Button></CardContent></Card>
      {showScenario ? <Card className="p-6 sm:p-7"><div className="flex flex-wrap justify-between gap-3"><div><Badge variant="success">Scenario ready</Badge><h2 className="mt-3 text-2xl font-semibold">{scenario.roleName}</h2></div><div className="rounded-lg bg-primary/10 px-3 py-2 text-right"><p className="text-[11px] text-muted-foreground">Estimated preparation</p><p className="font-data text-lg font-semibold text-primary">~{scenario.weeks} weeks</p></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">At {hours} hours/week, this estimate assumes about {scenario.estimatedHours} focused hours across skills, proof, and applications.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["Foundation", `${Math.ceil(scenario.weeks * .35)} weeks`, "Core concepts and guided practice"], ["Evidence", `${Math.ceil(scenario.weeks * .4)} weeks`, "Projects, case studies, feedback"], ["Launch", `${Math.ceil(scenario.weeks * .25)} weeks`, "Applications and interview iteration"]].map(([name, time, detail]) => <div className="rounded-xl border border-border bg-muted/30 p-4" key={name}><p className="font-medium">{name}</p><p className="mt-2 text-primary">{time}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p></div>)}</div></Card> : <Card className="grid min-h-80 place-items-center p-6 text-center"><div><Clock3 className="mx-auto size-8 text-muted-foreground" /><p className="mt-3 font-medium">Build a scenario from your own capacity</p><p className="mt-1 text-sm text-muted-foreground">No generic result is shown until you choose a target role.</p></div></Card>}
    </section>
    {showScenario ? <section className="grid gap-6 lg:grid-cols-2"><Card className="p-6"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Readiness band</p><h2 className="mt-2 text-xl font-semibold">{scenario.band.label}</h2></div><span className="font-data text-3xl font-semibold text-primary">{scenario.score}</span></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{scenario.band.description}</p><div className="mt-5 space-y-2 text-xs text-muted-foreground"><p>Evidence completed: {roadmap?.progressPct ?? 0}% × 40%</p><p>Weekly consistency: {Math.min(100, progress.completedThisWeek * 25)} × 15%</p><p>Available time: {Math.min(100, Math.round(hours / 15 * 100))} × 30%</p><p>Direction signal: {career ? "matched career context" : "custom role context"} × 15%</p></div><p className="mt-5 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">This is a readiness band from visible PathPilot evidence, not a prediction of hiring likelihood.</p></Card>
      <Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Skills to strengthen</p><h2 className="mt-2 text-xl font-semibold">Close the gaps that matter first.</h2><div className="mt-5 space-y-3">{scenario.gaps.length ? scenario.gaps.map((gap) => <div className="flex gap-3 rounded-lg border border-border p-3" key={gap}><Target className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-medium">{gap}</p><p className="mt-1 text-xs text-muted-foreground">Add evidence through one focused milestone or project.</p></div></div>) : <div className="flex gap-3 rounded-lg border border-success/25 bg-success/[.04] p-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /><p className="text-sm">Your tracked roadmap covers the starter skills. Build stronger proof and applications next.</p></div>}</div></Card>
      <Card className="p-6"><p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Static salary reference</p><h2 className="mt-2 text-xl font-semibold">Career-band context</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{salaryBands.map(([label, amount]) => <div className="rounded-lg border border-border bg-muted/30 p-3" key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-sm font-semibold">{amount}</p></div>)}</div><p className="mt-4 text-xs leading-5 text-muted-foreground">Static career-taxonomy reference only. Offers vary by role, location, employer, and verified experience.</p></Card>
      <Card className="flex flex-col justify-between p-6"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">Make it actionable</p><h2 className="mt-2 text-xl font-semibold">Convert this scenario into a mission.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Your target becomes weighted milestones. The mission stays editable and updates your progress view.</p></div><Button className="mt-6 w-full" onClick={convertToMission} disabled={missionMutation.isPending}>{missionMutation.isPending ? <><LoaderCircle className="animate-spin" />Saving…</> : <>Convert to Mission <ArrowRight /></>}</Button></Card>
    </section> : null}
    {missionMutation.isError ? <ErrorBanner message="Your mission was saved on this device. Cloud sync could not finish yet." /> : null}
  </div>;
}
