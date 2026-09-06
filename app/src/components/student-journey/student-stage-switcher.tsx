"use client";

import Link from "next/link";
import { Check, ChevronDown, GraduationCap, Map, Rocket, Sparkles } from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getStudentJourney, studentJourneyConfig, studentJourneys } from "@/features/student-journey/config";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const stageIcons = {
  "stream-explorer": GraduationCap,
  "education-planner": Map,
  "career-launch": Rocket,
};

export function StudentStageSwitcher() {
  const [open, setOpen] = useState(false);
  const journeyValue = usePathPilotStore((state) => state.studentJourney);
  const currentJourney = getStudentJourney(journeyValue);
  const currentConfig = studentJourneyConfig[currentJourney];

  return (
    <>
      <button
        className="group flex min-h-12 items-center gap-3 border border-[#cfdcea] bg-white px-3.5 py-2 text-left shadow-[0_6px_20px_rgba(16,40,74,0.05)] transition-colors hover:border-[#1264c4]/45 hover:bg-[#f6faff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1264c4] focus-visible:ring-offset-2"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="grid size-8 place-items-center rounded-lg bg-[#eaf3ff] text-[#1264c4]"><Sparkles className="size-4" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#62748b]">Your current stage</span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-[#10284a]">{currentConfig.label}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-[#526174] transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
      </button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Update your student stage"
        description="Choose the decision you need help with now. Your shared profile stays with you, and PathPilot will only ask the stage questions needed to refresh your plan."
        titleIcon={<Sparkles className="size-5 text-primary" aria-hidden="true" />}
        className="max-w-4xl"
      >
        <div className="grid gap-3 md:grid-cols-3">
          {studentJourneys.map((journey) => {
            const config = studentJourneyConfig[journey];
            const Icon = stageIcons[journey];
            const active = journey === currentJourney;
            return (
              <article className={cn("flex min-h-[270px] flex-col border p-5", active ? "border-[#1264c4] bg-[#f5f9ff]" : "border-border bg-background")} key={journey}>
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#eaf3ff] text-[#1264c4]"><Icon className="size-5" aria-hidden="true" /></span>
                  {active ? <span className="inline-flex items-center gap-1 rounded-full bg-[#1264c4] px-2 py-1 text-[11px] font-semibold text-white"><Check className="size-3" /> Current</span> : null}
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.03em] text-[#10284a]">{config.label}</h3>
                <p className="mt-2 text-sm leading-6 text-[#526174]">{config.cardDescription}</p>
                <p className="mt-4 text-xs leading-5 text-[#385c82]">{config.eligibility}</p>
                <Button asChild className="mt-auto w-full" variant={active ? "secondary" : "default"}>
                  <Link href={`/onboarding?journey=${journey}&mode=adapt`} onClick={() => setOpen(false)}>
                    {active ? "Review this stage" : "Switch to this stage"}
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">For example: after Class 10, choose Education Planner for Class 11–12 decisions. You will not need to sign in again.</p>
      </Modal>
    </>
  );
}
