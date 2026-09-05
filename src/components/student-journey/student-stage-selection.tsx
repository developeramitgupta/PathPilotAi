"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, GraduationCap, Map, Rocket } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { studentJourneyConfig, studentJourneys } from "@/features/student-journey/config";

const icons = [GraduationCap, Map, Rocket];

export function StudentStageSelection() {
  const searchParams = useSearchParams();
  const switching = searchParams.get("mode") === "switch";
  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 text-[#10284a] sm:px-8 sm:py-9">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4"><Logo className="text-[#10284a]" href="/" /><Link href="/sign-in" className="text-sm font-semibold text-[#526174] hover:text-[#1264c4]">Already have an account? Sign in</Link></header>
        <section className="flex flex-1 flex-col justify-center py-12">
          <p className="text-center text-xs font-bold uppercase tracking-[0.17em] text-[#1264c4]">Student workspace</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-center text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Where are you in your student journey?</h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-7 text-[#526174] sm:text-lg">Your assessment, home screen, and tools will adapt to the decision you need to make now. You can change this later without losing shared profile answers.</p>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {studentJourneys.map((journey, index) => {
              const config = studentJourneyConfig[journey];
              const Icon = icons[index];
              return <Link key={journey} href={switching ? `/onboarding?journey=${journey}&mode=adapt` : `/sign-up?role=student&journey=${journey}`} className="group flex min-h-[330px] flex-col rounded-2xl border border-[#dbe3ed] bg-white p-6 shadow-[0_12px_32px_rgba(16,40,74,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#1264c4]/50 hover:shadow-[0_18px_42px_rgba(18,100,196,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1264c4] focus-visible:ring-offset-4 sm:p-7">
                <span className="grid size-12 place-items-center rounded-xl bg-[#eaf3ff] text-[#1264c4]"><Icon className="size-6" aria-hidden="true" /></span>
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.15em] text-[#1264c4]">{config.label}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{config.cardTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-[#526174]">{config.cardDescription}</p>
                <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#385c82]"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#39a27e]" aria-hidden="true" />{config.eligibility}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-[#1264c4]">{switching ? "Switch to this stage" : "Choose this journey"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
              </Link>;
            })}
          </div>
          <div className="mt-8 text-center"><Button asChild variant="ghost" className="text-[#526174]"><Link href="/">Back to PathPilot</Link></Button></div>
        </section>
      </div>
    </main>
  );
}
