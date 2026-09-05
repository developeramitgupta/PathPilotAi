"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Flag,
  FolderGit2,
  Radar,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  AnimatedProgressBar,
  CategoryDonut,
  dashboardEntrance,
  LevelBadge,
  TrendSparkline,
} from "@/components/shared/dashboard-visuals";
import { ErrorBanner } from "@/components/shared/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import type { ProgressDimension, RadarResult } from "@/features/pathpilot/schemas";
import { usePathPilotProgressModel } from "@/features/pathpilot/use-progress-model";

const statIcons = {
  skills: BookOpenCheck,
  projects: FolderGit2,
  resume: FileCheck2,
  github: TrendingUp,
} as const;

const journey = [
  "Class 10",
  "Stream",
  "Class 12",
  "Exams",
  "College",
  "Degree",
  "Skills",
  "Projects",
  "Placement",
];

function StatCard({ dimension, index }: { dimension: ProgressDimension; index: number }) {
  const Icon = statIcons[dimension.key as keyof typeof statIcons];
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={dashboardEntrance}>
      <Card className="h-full p-5 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/20">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-white/[0.04] text-muted-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <TrendSparkline values={dimension.trend} label={`${dimension.label} seven-day trend`} className="w-20" />
        </div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{dimension.label}</p>
            <p className="font-data mt-1 text-2xl font-semibold">{dimension.value}</p>
          </div>
          <span className="text-[10px] text-success">+{dimension.delta} this week</span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{dimension.detail}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Badge variant={dimension.evidenceMode === "demo" ? "demo" : "success"}>
            {dimension.evidenceMode === "demo" ? "Demo signal" : "Live activity"}
          </Badge>
          <Link href={dimension.href} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
            Detail <ArrowRight className="size-3" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

export function ProgressDashboardScreen() {
  const { profileState, profile, career, roadmap, mission, health, progress } =
    usePathPilotProgressModel();
  const featuredDimensions = progress.dimensions.filter((dimension) =>
    ["skills", "projects", "resume", "github"].includes(dimension.key),
  );
  const radarParams = new URLSearchParams({
    career: career?.careerName ?? "",
    interests: profile.interests.join(","),
    skills: career?.starterSkills.join(",") ?? "",
  });
  const radarQuery = useQuery({
    queryKey: ["opportunity-radar", career?.careerKey, profile.interests.join("|")],
    queryFn: () => requestPathPilot<{ result: RadarResult }>(`/api/radar?${radarParams.toString()}`),
    staleTime: 1000 * 60 * 10,
  });
  const radarPreview = radarQuery.data?.result.opportunities.slice(0, 3) ?? [];
  const nextRoadmap = roadmap?.milestones.find((item) => item.status === "active") ?? roadmap?.milestones[0];

  return (
    <MotionConfig reducedMotion="user">
      <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={profileState ? "success" : "demo"}>{profileState ? "Live student workspace" : "Preview workspace"}</Badge>
            <span className="text-xs text-muted-foreground">{progress.activeDays}/7 active days</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Welcome back, {profile.name.split(" ")[0]}.</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">One focused step today keeps the whole plan moving.</p>
        </div>
        <Button asChild variant="secondary"><Link href="/career-discovery"><Sparkles /> Explore careers</Link></Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <Card className="relative overflow-hidden p-5 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[250px_1fr_0.85fr]">
            <div className="mx-auto"><CategoryDonut score={health.score} categories={health.categories} size="md" /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2"><Badge variant="success">+{health.weeklyDelta} this week</Badge><LevelBadge level={health.level} /></div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">You&apos;re building visible momentum.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{health.narration}</p>
              <Button asChild variant="ghost" className="mt-3 -ml-4 text-[#a998ff]"><Link href="/health-score">See the transparent formula <ArrowRight /></Link></Button>
            </div>
            <div className="rounded-xl border border-border bg-black/10 p-5">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Current mission</p><LevelBadge level={health.level} /></div>
              <p className="mt-4 text-lg font-semibold">{mission.goal}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{mission.milestones.find((item) => item.id === mission.nextMilestoneId)?.title ?? "Mission complete"}</p>
              <AnimatedProgressBar value={mission.progressPct} label="Mission progress" className="mt-5" />
              <Button asChild size="sm" className="mt-5 w-full"><Link href="/mission">Open Mission Mode <Flag /></Link></Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featuredDimensions.map((dimension, index) => <StatCard key={dimension.key} dimension={dimension} index={index} />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="min-w-0 p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Next roadmap milestone</p><h2 className="mt-2 text-lg font-semibold">{nextRoadmap?.title ?? "Choose a career direction"}</h2></div>
            <span className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-[#a998ff]"><Flag className="size-5" /></span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{nextRoadmap?.description ?? "Career Discovery will turn your profile into an explained starting point."}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" /> {nextRoadmap?.estWeeks ?? 1} weeks</span><span>{nextRoadmap?.phase ?? "Orientation"}</span></div>
          <Button asChild variant="secondary" className="mt-6"><Link href="/roadmap">Open roadmap <ArrowRight /></Link></Button>
        </Card>

        <Card className="min-w-0 p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Opportunity Radar</p><h2 className="mt-2 text-lg font-semibold">Patterns worth watching</h2></div><Radar className="size-5 text-[#a998ff]" /></div>
          <div className="mt-5 divide-y divide-border">
            {radarQuery.isPending ? Array.from({ length: 3 }, (_, index) => <div key={index} className="flex min-h-16 items-center gap-3 py-3" aria-hidden="true"><span className="skeleton-shimmer size-7 rounded-full" /><span className="flex-1"><span className="skeleton-shimmer block h-3 w-3/4 rounded" /><span className="skeleton-shimmer mt-2 block h-2 w-1/2 rounded" /></span></div>) : null}
            {radarQuery.isError ? <div className="py-3"><ErrorBanner message="Opportunity preview is temporarily unavailable." onRetry={() => radarQuery.refetch()} /></div> : null}
            {radarQuery.isSuccess && radarPreview.length === 0 ? <p className="py-6 text-center text-xs text-muted-foreground">No opportunity patterns are available for this profile yet.</p> : null}
            {radarPreview.map((item, index) => (
              <Link href="/radar" className="flex min-h-16 items-center gap-3 py-3" key={item.id}>
                <span className="grid size-7 place-items-center rounded-full border border-border font-data text-[10px] text-muted-foreground">0{index + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{item.category} · {item.typicalTiming}</p></div>
                <span className="font-data text-xs text-[#a998ff]">{item.relevance}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3"><Badge variant="demo">Demo patterns</Badge><Button asChild variant="ghost" size="sm"><Link href="/radar">View radar <ArrowRight /></Link></Button></div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Student timeline</p><h2 className="mt-2 text-lg font-semibold">Your journey at a glance</h2></div><div className="flex gap-5 text-xs text-muted-foreground"><span><strong className="font-data text-foreground">{progress.completedThisWeek}</strong> completed</span><span><strong className="font-data text-foreground">{progress.focusMinutes}</strong> focus min</span></div></div>
        <div className="mt-8 overflow-x-auto pb-2" tabIndex={0} role="region" aria-label="Student journey timeline; scroll horizontally for later stages">
          <div className="flex min-w-[780px] items-start">
            {journey.map((stage, index) => {
              const stageIndex = profile.currentStage === "class-10" ? 0 : profile.currentStage === "class-11-12" ? 2 : profile.currentStage === "college" ? 5 : 8;
              const complete = index < stageIndex;
              const active = index === stageIndex;
              return (
                <div className="relative flex flex-1 flex-col items-center text-center" key={stage}>
                  {index > 0 ? <span className={complete || active ? "absolute right-1/2 top-3 h-px w-full bg-primary/60" : "absolute right-1/2 top-3 h-px w-full bg-border"} /> : null}
                  <span className={complete ? "relative z-10 grid size-6 place-items-center rounded-full bg-success text-background" : active ? "relative z-10 grid size-6 place-items-center rounded-full bg-primary text-white ring-4 ring-primary/15" : "relative z-10 grid size-6 place-items-center rounded-full border border-border bg-card"}>{complete ? <CheckCircle2 className="size-3.5" /> : <span className="size-1.5 rounded-full bg-muted-foreground/50" />}</span>
                  <span className={active ? "mt-3 text-xs font-medium text-foreground" : "mt-3 text-xs text-muted-foreground"}>{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      </div>
    </MotionConfig>
  );
}
