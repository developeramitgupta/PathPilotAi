"use client";

import Link from "next/link";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Compass,
  FileCheck2,
  Flag,
  GraduationCap,
  Menu,
  Route,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { ProgressRing } from "@/components/shared/progress-ring";

const modules = [
  {
    title: "Career Discovery",
    description: "Five matches ranked against your actual interests, constraints, and work style.",
    icon: Compass,
    tag: "Explained matches",
  },
  {
    title: "Career Roadmap",
    description: "A living milestone plan that changes when your skills and decisions change.",
    icon: Route,
    tag: "Your next step",
  },
  {
    title: "Smart College Finder",
    description: "Colleges filtered for your budget first, then ranked for fit.",
    icon: GraduationCap,
    tag: "India-relevant",
  },
  {
    title: "Resume Analyzer",
    description: "Know the three fixes that matter most before placement season starts.",
    icon: FileCheck2,
    tag: "Prioritized fixes",
  },
  {
    title: "Interview Coach",
    description: "Practice real follow-up questions with feedback after every answer.",
    icon: BrainCircuit,
    tag: "Adaptive practice",
  },
  {
    title: "Mission Mode",
    description: "Turn a dream career or company into a goal you can see moving closer.",
    icon: Flag,
    tag: "Progress that sticks",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us about you",
    description: "A focused six-step profile — not a clinical personality test.",
  },
  {
    number: "02",
    title: "Get an explained plan",
    description: "See which answers drove every recommendation, score, and tradeoff.",
  },
  {
    number: "03",
    title: "Track it as you grow",
    description: "Your roadmap and mission update as your skills and decisions change.",
  },
];

export function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <MotionConfig reducedMotion="user">
      <main className="overflow-hidden">
      <a href="#landing-content" className="skip-link">Skip to main content</a>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] grid-fade" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="Primary">
            <Link className="transition-colors hover:text-foreground" href="#product">
              Product
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#how-it-works">
              How it works
            </Link>
            <Link className="transition-colors hover:text-foreground" href="#trust">
              Our approach
            </Link>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/sign-up">
                Get started <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {mobileNavOpen ? (
          <nav className="border-t border-border bg-background px-4 py-4 md:hidden" aria-label="Mobile primary">
            <div className="mx-auto grid max-w-7xl gap-2">
              {[
                ["Product", "#product"],
                ["How it works", "#how-it-works"],
                ["Our approach", "#trust"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setMobileNavOpen(false)}
                >
                  {label}
                </Link>
              ))}
              <Button asChild className="mt-2">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </div>
          </nav>
        ) : null}
      </header>

      <section id="landing-content" tabIndex={-1} className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-14 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="max-w-3xl"
        >
          <Badge className="mb-6">
            <Sparkles className="size-3" aria-hidden="true" /> Built for the decisions that shape your future
          </Badge>
          <h1 className="font-display text-[clamp(3rem,8vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
            A career plan that <span className="signature-text">grows with you.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            PathPilot remembers what you&apos;ve decided, explains why every option fits, and turns your next six years into one clear, trackable path.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Build my path <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">
                View product preview <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted-foreground">
            {["Built for Indian students", "Every match explained", "Guidance, never guarantees"].map((item) => (
              <span className="inline-flex items-center gap-2" key={item}>
                <span className="grid size-4 place-items-center rounded-full bg-success/10 text-success">
                  <Check className="size-2.5" aria-hidden="true" />
                </span>
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.12 }}
          className="relative mx-auto w-full max-w-[520px]"
        >
          <div className="absolute -inset-10 -z-10 rounded-full bg-primary/10 blur-3xl" />
          <Card className="overflow-hidden border-white/10 bg-card/85 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="success" className="mb-3">This week +4</Badge>
                <p className="text-sm text-muted-foreground">Career Health Score</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">You&apos;re building momentum</h2>
              </div>
              <Badge variant="demo">Product preview</Badge>
            </div>
            <div className="my-9 flex justify-center">
              <ProgressRing value={72} label="Overall" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Next milestone", "Ship your first case study", Target],
                ["Mission", "Product Designer · Level 3", BriefcaseBusiness],
              ].map(([label, value, Icon]) => {
                const ModuleIcon = Icon as typeof Target;
                return (
                  <div className="rounded-lg border border-border bg-white/[0.025] p-4" key={label as string}>
                    <ModuleIcon className="mb-3 size-5 text-[#9d8bff]" aria-hidden="true" />
                    <p className="text-[11px] uppercase tracking-[0.13em] text-muted-foreground">{label as string}</p>
                    <p className="mt-1.5 text-sm font-medium leading-5">{value as string}</p>
                  </div>
                );
              })}
            </div>
          </Card>
          <motion.div
            className="absolute -bottom-5 -left-4 hidden rounded-lg border border-white/10 bg-popover/95 px-4 py-3 shadow-2xl backdrop-blur-xl sm:block"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-[11px] text-muted-foreground">Recommendation updated</p>
            <p className="mt-0.5 text-sm font-medium">Because your interests changed</p>
          </motion.div>
        </motion.div>
      </section>

      <section id="trust" className="border-y border-border bg-white/[0.018]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9d8bff]">The problem</p>
            <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              A one-time counselling session cannot guide a six-year journey.
            </h2>
          </div>
          <div className="grid gap-4 text-sm leading-7 text-muted-foreground sm:grid-cols-2">
            <p>Most tools produce a list and forget the student. PathPilot keeps a living profile, decision history, and progress model.</p>
            <p>Every recommendation names the exact inputs behind it, so a student, parent, or counselor can inspect the reasoning.</p>
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9d8bff]">One connected system</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">From uncertainty to your next move.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Each module reads the same student context, so moving from discovery to action never means starting over.</p>
        </div>
        <div
          className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          role="region"
          aria-label="Flagship module previews; scroll horizontally for more"
        >
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              className="min-w-[280px] snap-start sm:min-w-[340px]"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.04 }}
            >
              <Card className="h-full p-6 transition-transform duration-150 hover:-translate-y-0.5">
                <div className="grid size-11 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-[#9d8bff]">
                  <module.icon className="size-5" aria-hidden="true" />
                </div>
                <Badge variant="outline" className="mt-8">{module.tag}</Badge>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{module.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border bg-white/[0.018]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9d8bff]">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">One profile. One plan. Always current.</h2>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
            {steps.map((step) => (
              <div className="bg-card p-7 sm:p-8" key={step.number}>
                <span className="font-data text-xs text-[#9d8bff]">{step.number}</span>
                <h3 className="mt-14 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 grid-fade opacity-70" />
          <div className="relative mx-auto max-w-2xl">
            <Badge className="mb-5"><BadgeCheck className="size-3" /> Hackathon MVP · Built transparently</Badge>
            <h2 className="font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Your next decision deserves a plan.</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">Start with five minutes about who you are. Leave with one clear action and the reasoning behind it.</p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/sign-up">Get started <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Logo />
          <p className="max-w-xl text-xs leading-5 text-muted-foreground">PathPilot uses AI to provide guidance, not guarantees. Important education and career decisions should also involve a trusted parent, counselor, or qualified professional.</p>
        </div>
      </footer>
      </main>
    </MotionConfig>
  );
}
