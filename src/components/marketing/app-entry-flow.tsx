"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Check, GraduationCap, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "student" | "college" | "industry";

const stories: Array<{
  role: Role;
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  imageAlt: string;
  note: string;
}> = [
  {
    role: "student",
    eyebrow: "For students",
    title: "Students see potential — with direction.",
    copy: "Turn interests, strengths, and real work into a path you can understand and act on.",
    image: "/images/onboarding/student-v2.png",
    imageAlt: "Student holding a notebook, surrounded by symbols for skills and goals.",
    note: "Discover a path that begins with you.",
  },
  {
    role: "college",
    eyebrow: "For colleges",
    title: "Colleges turn potential into momentum.",
    copy: "Guide students with a shared view of readiness, evidence, and the support they need next.",
    image: "/images/onboarding/college-v2.png",
    imageAlt: "College mentor with a tablet, surrounded by symbols for mentoring and student growth.",
    note: "Support growth with the right evidence.",
  },
  {
    role: "industry",
    eyebrow: "",
    title: "Industry sees potential — with proof.",
    copy: "Find candidates through verified skills, projects and readiness.",
    image: "/images/onboarding/industry-profile-scene.png",
    imageAlt: "Recruiter viewing a verified candidate profile at a desk.",
    note: "",
  },
];

const roles = [
  {
    key: "student",
    title: "Student",
    copy: "Find your direction, build skill evidence, and access relevant opportunities.",
    icon: GraduationCap,
    href: "/sign-up?role=student",
  },
  {
    key: "college",
    title: "College",
    copy: "Guide student growth, improve readiness, and strengthen industry connections.",
    icon: UserRound,
    href: "/sign-up?role=institution_admin",
  },
  {
    key: "industry",
    title: "Industry",
    copy: "Discover verified talent, post opportunities, and build a stronger pipeline.",
    icon: BriefcaseBusiness,
    href: "/sign-up?role=industry",
  },
] as const;

function Progress({ activeStep }: { activeStep: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-5" aria-label="Introduction progress">
      {stories.map((story, index) => {
        const completed = index < activeStep;
        const active = index === activeStep;
        return (
          <li className="flex items-center gap-2" key={story.role}>
            {index > 0 ? <span className={cn("hidden h-px w-8 sm:block", completed ? "bg-[#1264c4]" : "bg-[#d3dbe8]")} aria-hidden="true" /> : null}
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#526174] sm:gap-2">
              <span className={cn("grid size-7 place-items-center rounded-full border text-[11px]", completed ? "border-[#1264c4] bg-[#1264c4] text-white" : active ? "border-[#1264c4] bg-[#edf6ff] text-[#1264c4]" : "border-[#cbd5e1] bg-white text-[#64748b]")}>{completed ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}</span>
              <span className="hidden sm:inline">{story.role === "college" ? "College" : story.role[0].toUpperCase() + story.role.slice(1)}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function LaunchScreen() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid min-h-screen place-items-center bg-[#f8fafc] p-6">
      <motion.div initial={{ opacity: 0, scale: 0.85, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-center gap-5">
        <span className="grid size-20 place-items-center" aria-hidden="true">
          <Image src="/images/brand-pathpilot-p.png" alt="" width={82} height={90} className="size-full object-contain" priority />
        </span>
        <div className="text-center">
          <p className="text-2xl font-semibold tracking-[-0.04em] text-[#10284a]">PathPilot</p>
          <p className="mt-1 text-sm text-[#62748b]">Skills. Guidance. Opportunity.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function RoleSelection({ onReplay }: { onReplay: () => void }) {
  return (
    <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }} className="min-h-screen bg-[#f8fafc] px-4 py-6 text-[#10284a] sm:px-8 sm:py-9">
      <header className="mx-auto flex max-w-6xl items-center justify-between"><Logo className="text-[#10284a]" /><Button variant="ghost" className="text-[#526174] hover:bg-[#edf2f7] hover:text-[#10284a]" onClick={onReplay}>Replay intro</Button></header>
      <section className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-6xl flex-col justify-center py-12">
        <p className="text-center text-xs font-bold uppercase tracking-[0.17em] text-[#1264c4]">Welcome to the network</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-semibold tracking-[-0.055em] text-[#10284a] sm:text-6xl">Choose the role that brings you here.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-7 text-[#526174] sm:text-lg">Every workspace is built around one clear outcome. You can invite collaborators after your account is ready.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + index * 0.06, duration: 0.35 }} key={role.key}>
                <Link href={role.href} className="group flex h-full min-h-72 flex-col rounded-2xl border border-[#dbe3ed] bg-white p-7 shadow-[0_12px_32px_rgba(16,40,74,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#1264c4]/50 hover:shadow-[0_18px_42px_rgba(18,100,196,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1264c4] focus-visible:ring-offset-4">
                  <span className="grid size-12 place-items-center rounded-xl bg-[#eaf3ff] text-[#1264c4]"><Icon className="size-6" aria-hidden="true" /></span>
                  <h2 className="mt-10 text-2xl font-semibold tracking-[-0.04em]">{role.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#526174]">{role.copy}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-[#1264c4]">Continue as {role.title} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <p className="mt-7 text-center text-sm text-[#6b7b8f]">Already have an account? <Link href="/sign-in" className="font-semibold text-[#1264c4] hover:underline">Sign in</Link></p>
      </section>
    </motion.main>
  );
}

export function AppEntryFlow() {
  const reduceMotion = useReducedMotion();
  const [screen, setScreen] = useState<"launch" | "story" | "roles">("launch");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen("story"), reduceMotion ? 100 : 1150);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  const current = stories[step];
  const next = () => {
    if (step === stories.length - 1) setScreen("roles");
    else setStep((currentStep) => currentStep + 1);
  };

  const replay = () => {
    setStep(0);
    setScreen("story");
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {screen === "launch" ? <LaunchScreen key="launch" /> : null}
        {screen === "roles" ? <RoleSelection key="roles" onReplay={replay} /> : null}
        {screen === "story" ? (
          <motion.main key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[100dvh] overflow-hidden bg-[#f8fafc] px-5 py-6 text-[#10284a] sm:px-8 sm:py-9">
            <header className="relative mx-auto flex max-w-7xl items-center"><Logo className="text-[#10284a] [&_span:last-child]:text-lg" /><div className="absolute left-1/2 -translate-x-1/2"><Progress activeStep={step} /></div></header>
            <section className="mx-auto grid h-[calc(100dvh-6.5rem)] max-w-7xl items-center gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-14">
              <AnimatePresence mode="wait">
                <motion.div key={current.role} initial={{ opacity: 0, x: reduceMotion ? 0 : -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduceMotion ? 0 : 18 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className={cn("max-w-[34rem]", current.role === "industry" && "max-w-[29rem] lg:translate-y-6")}>
                  {current.eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1264c4]">{current.eyebrow}</p> : null}
                  <h1 className="mt-5 text-[clamp(2.75rem,5.6vw,5.4rem)] font-semibold leading-[0.96] tracking-[-0.07em] text-[#10284a]">{current.title}</h1>
                  <p className={cn("mt-6 max-w-md text-base leading-7 text-[#526174] sm:text-lg sm:leading-8", current.role === "industry" && "max-w-[24rem]")}>{current.copy}</p>
                  {current.note ? <p className="mt-5 flex items-center gap-2 text-sm font-medium text-[#385c82]"><span className="size-2 rounded-full bg-[#69b99d]" aria-hidden="true" /> {current.note}</p> : null}
                  <div className="mt-9 flex flex-wrap items-center gap-3"><Button size="lg" className="bg-[#1264c4] px-7 shadow-[0_12px_28px_rgba(18,100,196,0.24)] hover:bg-[#0d55aa]" onClick={next}>Continue <ArrowRight aria-hidden="true" /></Button><Button variant="ghost" className="text-[#526174] hover:bg-[#edf2f7] hover:text-[#10284a]" onClick={() => setScreen("roles")}>Skip intro</Button></div>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div key={current.image} initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97, y: reduceMotion ? 0 : 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.02 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto hidden h-[min(66vh,620px)] w-full max-w-[680px] lg:block">
                  <div className="absolute inset-x-[14%] bottom-[10%] top-[16%] -z-10 rounded-full bg-[#dcebfc] blur-3xl" />
                  <Image
                    src={current.image}
                    alt={current.imageAlt}
                    width={1100}
                    height={900}
                    priority
                    className={cn(
                      "absolute inset-0 z-10 h-full w-full object-contain",
                      current.role === "industry" ? "scale-[1.2] -translate-x-[18%] translate-y-[8%]" : "mix-blend-multiply",
                    )}
                  />
                </motion.div>
              </AnimatePresence>
            </section>
          </motion.main>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
