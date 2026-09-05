"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Flag,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import {
  AchievementChip,
  AnimatedProgressBar,
  dashboardEntrance,
  LevelBadge,
} from "@/components/shared/dashboard-visuals";
import { ErrorBanner } from "@/components/shared/feedback-states";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  recalculateMission,
  toggleMissionMilestone,
} from "@/features/pathpilot/mission-engine";
import { calculateCareerHealth } from "@/features/pathpilot/health-engine";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import {
  type MissionInput,
  type MissionPlan,
} from "@/features/pathpilot/schemas";
import { usePathPilotProgressModel } from "@/features/pathpilot/use-progress-model";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const confetti = [
  [-34, -32, "bg-primary"],
  [34, -28, "bg-success"],
  [-40, 8, "bg-warning"],
  [40, 10, "bg-[#3e8bff]"],
  [-18, 38, "bg-[#fb7185]"],
  [22, 40, "bg-[#a78bfa]"],
] as const;

export function MissionModeScreen() {
  const setMission = usePathPilotStore((state) => state.setMission);
  const {
    profile,
    career,
    roadmap,
    missionState,
    mission,
    health,
    resourceProgress,
    decisions,
  } = usePathPilotProgressModel();
  const [goal, setGoal] = useState(mission.goal);
  const [targetType, setTargetType] = useState<MissionInput["targetType"]>(mission.targetType);
  const [editingGoal, setEditingGoal] = useState(false);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const missionMutation = useMutation({
    mutationFn: (input: MissionInput) =>
      requestPathPilot<{ result: MissionPlan }>("/api/mission/set-goal", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: ({ result }) => {
      setMission(result);
      setEditingGoal(false);
    },
  });
  const syncMutation = useMutation({
    mutationFn: (updated: MissionPlan) =>
      requestPathPilot<{ result: MissionPlan }>("/api/mission/set-goal", {
        method: "PUT",
        body: JSON.stringify(updated),
      }),
  });

  function saveGoal() {
    missionMutation.mutate({
      goal,
      targetType,
      healthScore: health.score,
      roadmap,
      career,
    });
  }

  function handleMilestone(milestoneId: string) {
    const wasDone = mission.milestones.find((item) => item.id === milestoneId)?.status === "done";
    const toggled = toggleMissionMilestone(mission, milestoneId, health.score);
    const nextHealth = calculateCareerHealth({
      profile,
      roadmap,
      mission: toggled,
      resourceProgress,
      decisionCount: decisions.length,
    });
    const updated = recalculateMission(toggled, nextHealth.score);
    setMission(updated);
    syncMutation.mutate(updated);
    setCelebratingId(wasDone ? null : milestoneId);
  }

  const nextMilestone = mission.milestones.find((item) => item.id === mission.nextMilestoneId);
  const completedWeight = mission.milestones
    .filter((item) => item.status === "done")
    .reduce((total, item) => total + item.weight, 0);

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Badge><Flag className="size-3" /> Mission Mode</Badge><Badge variant="success">Deterministic progress</Badge>{missionState ? null : <Badge variant="demo">Preview mission</Badge>}</div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">Make the dream feel close.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">A focused mission is separate from your general roadmap. Every completion has a visible weight and a direct effect on progress.</p>
        </div>
        <div className="flex flex-wrap gap-3"><Button variant="secondary" onClick={() => setEditingGoal((value) => !value)}><RotateCcw /> Change goal</Button><Button asChild><Link href="/roadmap">Open career roadmap <ArrowRight /></Link></Button></div>
      </div>

      <AnimatePresence initial={false}>
        {editingGoal ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <Card className="mt-6 grid gap-4 p-5 sm:grid-cols-[1fr_220px_auto] sm:items-end">
              <div><label htmlFor="mission-goal" className="mb-2 block text-xs font-medium text-muted-foreground">Dream company or career</label><Input id="mission-goal" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="AI Engineer at a product company" /></div>
              <div><label htmlFor="mission-target-type" className="mb-2 block text-xs font-medium text-muted-foreground">Goal type</label><Select id="mission-target-type" value={targetType} onChange={(event) => setTargetType(event.target.value as MissionInput["targetType"])}><option value="dream-career">Dream career</option><option value="dream-company">Dream company</option></Select></div>
              <Button onClick={saveGoal} disabled={goal.trim().length < 2 || missionMutation.isPending}>{missionMutation.isPending ? <><LoaderCircle className="animate-spin" /> Building…</> : <><Sparkles /> Build mission</>}</Button>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {missionMutation.isError ? <div className="mt-5"><ErrorBanner message={missionMutation.error.message} onRetry={saveGoal} /></div> : null}

      <motion.div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -left-24 -top-20 size-72 rounded-full bg-primary/12 blur-3xl" />
          <div className="relative flex flex-col items-center gap-7 sm:flex-row">
            <ProgressRing value={mission.progressPct} label="mission" size="lg" />
            <div className="w-full min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start"><LevelBadge level={health.level} /><Badge variant="demo">{mission.targetType === "dream-company" ? "Dream company" : "Dream career"}</Badge></div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{mission.goal}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{nextMilestone ? `Next: ${nextMilestone.title}` : "Every mission milestone is complete."}</p>
              <AnimatedProgressBar value={mission.progressPct} label={`${completedWeight} of 100 weighted points`} className="mt-6" />
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center sm:text-left"><div><p className="font-data text-xl font-semibold">{mission.milestones.filter((item) => item.status === "done").length}</p><p className="mt-1 text-[10px] text-muted-foreground">Completed</p></div><div><p className="font-data text-xl font-semibold">{mission.milestones.length}</p><p className="mt-1 text-[10px] text-muted-foreground">Milestones</p></div><div><p className="font-data text-xl font-semibold">{health.score}</p><p className="mt-1 text-[10px] text-muted-foreground">Health score</p></div></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Next milestone</p><h2 className="mt-2 text-xl font-semibold">{nextMilestone?.title ?? "Mission complete"}</h2></div><span className="grid size-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-[#a998ff]"><Target className="size-5" /></span></div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{nextMilestone?.description ?? "Choose a new goal when you are ready for the next mission."}</p>
          {nextMilestone ? <><div className="mt-5 flex items-center justify-between text-xs"><span className="text-muted-foreground">Mission impact</span><span className="font-data text-foreground">{nextMilestone.weight} points</span></div><Button className="mt-5 w-full" onClick={() => handleMilestone(nextMilestone.id)}><Check /> Complete next milestone</Button></> : <Button className="mt-6 w-full" variant="secondary" onClick={() => setEditingGoal(true)}><Sparkles /> Set a new goal</Button>}
          <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground"><Zap className="mt-0.5 size-3.5 shrink-0 text-warning" /> Next is always the highest-weight incomplete gap, selected by deterministic logic.</p>
        </Card>
      </motion.div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Mission milestones</p><h2 className="mt-2 text-xl font-semibold">Your weighted route</h2></div><span className="text-xs text-muted-foreground">Tap to update</span></div>
          <ol className="grid gap-3">
            {mission.milestones.map((milestone, index) => {
              const Icon = milestone.status === "done" ? CheckCircle2 : milestone.status === "active" ? Zap : Circle;
              return (
                <motion.li key={milestone.id} custom={index} initial="hidden" animate="visible" variants={dashboardEntrance} className="relative">
                  <button type="button" onClick={() => handleMilestone(milestone.id)} className={cn("relative flex min-h-24 w-full items-start gap-4 rounded-xl border bg-card/75 p-4 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-primary/25 sm:p-5", milestone.status === "active" && "border-primary/30 bg-primary/[0.06]", milestone.status === "done" && "border-success/20 bg-success/[0.04]")}>
                    <span className={cn("relative grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background", milestone.status === "done" && "border-success/30 bg-success/10 text-success", milestone.status === "active" && "border-primary/40 bg-primary/12 text-[#b8adff]")}>
                      <Icon className="size-4" />
                      <AnimatePresence>{celebratingId === milestone.id ? confetti.map(([x, y, color], dotIndex) => <motion.span key={dotIndex} className={cn("absolute size-1.5 rounded-full", color)} initial={{ opacity: 1, x: 0, y: 0, scale: 1 }} animate={{ opacity: 0, x, y, scale: 0.4 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, delay: dotIndex * 0.025 }} />) : null}</AnimatePresence>
                    </span>
                    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><strong className="text-sm font-semibold">{milestone.title}</strong><Badge variant={milestone.status === "done" ? "success" : milestone.status === "active" ? "default" : "demo"}>{milestone.status}</Badge></span><span className="mt-2 block text-xs leading-5 text-muted-foreground">{milestone.description}</span><span className="mt-3 inline-flex items-center gap-2 font-data text-[10px] text-[#aaa0ef]">{milestone.weight} weighted points · {milestone.kind}</span></span>
                  </button>
                </motion.li>
              );
            })}
          </ol>
        </div>

        <div>
          <div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Achievement shelf</p><h2 className="mt-2 text-xl font-semibold">Evidence worth celebrating</h2></div>
          <Card className="p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {mission.achievements.map((achievement) => (
                <AchievementChip
                  key={achievement.key}
                  title={achievement.title}
                  description={achievement.description}
                  unlocked={achievement.unlocked}
                />
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-white/[0.025] p-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-warning/10 text-warning">{mission.achievements.some((item) => item.unlocked) ? <Trophy className="size-4" /> : <LockKeyhole className="size-4" />}</span><div><p className="text-xs font-semibold">Achievements follow evidence</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Badges unlock only from completed milestones or visible score thresholds—never from an AI judgment.</p></div></div>
          </Card>
        </div>
      </div>
      {syncMutation.isError ? <p className="mt-5 text-xs text-warning" role="status">Saved on this device. Cloud sync will retry when the database connection is available.</p> : null}
      </div>
    </MotionConfig>
  );
}
