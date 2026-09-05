"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  CircleGauge,
  Info,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePathPilotProgressModel } from "@/features/pathpilot/use-progress-model";

export function HealthScoreScreen() {
  const { health } = usePathPilotProgressModel();
  const weakest = health.categories.find((category) => category.key === health.weakestCategoryKey)!;
  const demoCount = health.categories.filter((category) => category.evidenceMode === "demo").length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Badge><CircleGauge className="size-3" /> Career Health Score</Badge><Badge variant="success">Formula-driven</Badge><Badge variant="demo">{demoCount} demo evidence sources</Badge></div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">One number. Every input visible.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">The score recomputes from fixed weights whenever tracked work changes. AI can frame the next action, but it never decides the number.</p>
        </div>
        <Button asChild variant="secondary"><Link href="/dashboard">Back to progress dashboard <ArrowRight /></Link></Button>
      </div>

      <motion.div className="mt-7 grid gap-6 xl:grid-cols-[1fr_0.75fr]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <Card className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col items-center gap-8 md:flex-row">
            <CategoryDonut score={health.score} categories={health.categories} />
            <div className="min-w-0 flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start"><LevelBadge level={health.level} /><Badge variant="success"><TrendingUp className="size-3" /> +{health.weeklyDelta} this week</Badge></div>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your readiness is becoming measurable.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{health.narration}</p>
              <div className="mt-6 flex flex-col items-center gap-4 rounded-xl border border-border bg-black/10 p-4 sm:flex-row md:items-start">
                <TrendSparkline values={health.history} label="Seven-day Career Health Score trend" />
                <div><p className="text-xs font-semibold">Seven-day direction</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">Your visible activity moved the score from {health.history[0]} to {health.score}. Demo baselines remain labeled until their analyzers ship.</p></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Highest-leverage action</p><h2 className="mt-2 text-xl font-semibold">Improve {weakest.label}</h2></div><span className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-[#a998ff]"><Sparkles className="size-5" /></span></div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{weakest.evidence}. A single completed task here affects {weakest.weight}% of the total score.</p>
          <AnimatedProgressBar value={weakest.score} label={`${weakest.label} readiness`} className="mt-6" />
          <Button asChild className="mt-6 w-full"><Link href={weakest.href}>Take the next action <ArrowRight /></Link></Button>
          <div className="mt-5 flex gap-3 rounded-lg border border-border bg-white/[0.025] p-4"><BrainCircuit className="mt-0.5 size-4 shrink-0 text-[#a998ff]" /><div><p className="text-xs font-semibold">Coach note · fallback</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">This realistic guidance sentence is deterministic while a live model is unavailable. The score formula is unchanged either way.</p></div></div>
        </Card>
      </motion.div>

      <div className="mt-8 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Category breakdown</p><h2 className="mt-2 text-xl font-semibold">Seven weighted signals</h2></div><span className="hidden text-xs text-muted-foreground sm:block">Weights total 100%</span></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {health.categories.map((category, index) => (
          <motion.div key={category.key} custom={index} initial="hidden" animate="visible" variants={dashboardEntrance} className={index === health.categories.length - 1 ? "md:col-span-2 xl:col-span-1" : undefined}>
            <Card className="h-full p-5 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/20">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold">{category.label}</p><p className="mt-1 font-data text-2xl font-semibold">{category.score}<span className="text-sm text-muted-foreground">/100</span></p></div><Badge variant={category.evidenceMode === "demo" ? "demo" : category.evidenceMode === "mixed" ? "warning" : "success"}>{category.weight}% weight</Badge></div>
              <AnimatedProgressBar value={category.score} label={category.label} showValue={false} className="mt-5" />
              <p className="mt-4 min-h-10 text-[11px] leading-5 text-muted-foreground">{category.evidence}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4"><span className="font-data text-[11px] text-[#aaa0ef]">+{category.weightedPoints.toFixed(1)} points</span><Link href={category.href} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">Open <ArrowRight className="size-3" /></Link></div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mt-8 p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div><span className="grid size-11 place-items-center rounded-xl border border-border bg-white/[0.035] text-muted-foreground"><Calculator className="size-5" /></span><h2 className="mt-5 text-xl font-semibold">How the score is calculated</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Each category score is multiplied by its published weight. Those weighted points are added and rounded to the nearest whole number.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {health.categories.map((category) => <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-black/10 px-4 py-3" key={category.key}><span className="flex items-center gap-2 text-xs"><CheckCircle2 className="size-3.5 text-success" /> {category.label}</span><span className="font-data text-xs text-muted-foreground">{category.score} × {category.weight}%</span></div>)}
            <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/[0.06] px-4 py-3 sm:col-span-2"><span className="flex items-center gap-2 text-xs font-semibold"><Info className="size-3.5 text-[#a998ff]" /> Weighted total</span><span className="font-data text-sm font-semibold">{health.score}/100</span></div>
          </div>
        </div>
      </Card>
      </div>
    </MotionConfig>
  );
}
