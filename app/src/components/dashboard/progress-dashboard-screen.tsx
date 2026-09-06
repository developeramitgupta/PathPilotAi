"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { ArrowRight, Check, Compass, FileCheck2, Flag, GraduationCap, Map, Rocket, Route, Sparkles, Target } from "lucide-react";

import { StudentStageSwitcher } from "@/components/student-journey/student-stage-switcher";
import { Button } from "@/components/ui/button";
import { usePathPilotProgressModel } from "@/features/pathpilot/use-progress-model";
import { getStudentJourney, studentJourneyConfig } from "@/features/student-journey/config";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

type PathStep = {
  label: string;
  detail: string;
  href: string;
  done: boolean;
  action: string;
  icon: typeof Compass;
};

type JourneySnapshot = {
  hasProfile: boolean;
  hasCareer: boolean;
  hasRoadmap: boolean;
  hasStagePlan: boolean;
  hasDegree: boolean;
  hasCollegeOrExam: boolean;
  hasEvidence: boolean;
  hasApplication: boolean;
  hasMission: boolean;
};

function getJourneyPathway(journey: ReturnType<typeof getStudentJourney>, state: JourneySnapshot): PathStep[] {
  if (journey === "stream-explorer") {
    return [
      { label: "Know yourself", detail: "Start with an assessment", href: "/onboarding", done: state.hasProfile, action: "Begin assessment", icon: Compass },
      { label: "Explore careers", detail: "See career families", href: "/career-discovery", done: state.hasCareer, action: "Explore careers", icon: Sparkles },
      { label: "Choose a stream", detail: "Build your stream pathway", href: "/roadmap", done: state.hasRoadmap, action: "Explore stream pathways", icon: Route },
      { label: "Build confidence", detail: "Skills and activities", href: "/learning", done: state.hasEvidence, action: "Choose an activity", icon: Target },
      { label: "Keep momentum", detail: "A simple mission", href: "/mission", done: state.hasMission, action: "Open Mission Mode", icon: Flag },
    ];
  }

  if (journey === "career-launch") {
    return [
      { label: "Know your direction", detail: "Career assessment", href: "/onboarding", done: state.hasProfile, action: "Begin assessment", icon: Compass },
      { label: "Choose a direction", detail: "Career matches", href: "/career-discovery", done: state.hasCareer, action: "Review my direction", icon: Sparkles },
      { label: "Compare your options", detail: "Job or higher studies", href: "/degrees", done: state.hasStagePlan, action: "Compare directions", icon: Map },
      { label: "Build your proof", detail: "Resume, projects, and skills", href: "/resume", done: state.hasEvidence, action: "Strengthen my evidence", icon: FileCheck2 },
      { label: "Launch", detail: "Relevant opportunities", href: "/opportunities", done: state.hasApplication, action: "Find opportunities", icon: Rocket },
    ];
  }

  return [
    { label: "Know yourself", detail: "Start with an assessment", href: "/onboarding", done: state.hasProfile, action: "Begin assessment", icon: Compass },
    { label: "Choose direction", detail: "Career discovery", href: "/career-discovery", done: state.hasCareer, action: "See career matches", icon: Sparkles },
    { label: "Choose a degree", detail: "Compare degree routes", href: "/degrees", done: state.hasDegree, action: "Compare degrees", icon: GraduationCap },
    { label: "Plan admission", detail: "College and entrance exams", href: "/colleges", done: state.hasCollegeOrExam, action: "Find colleges", icon: Map },
    { label: "Make it actionable", detail: "Roadmap and mission", href: "/roadmap", done: state.hasRoadmap && state.hasMission, action: "Build my roadmap", icon: Route },
  ];
}

export function ProgressDashboardScreen() {
  const { profileState, career, roadmap, mission, missionState, health, progress, resourceProgress } = usePathPilotProgressModel();
  const journey = usePathPilotStore((state) => state.studentJourney);
  const stagePlan = usePathPilotStore((state) => state.stagePlan);
  const selectedDegreeKey = usePathPilotStore((state) => state.selectedDegreeKey);
  const selectedCollegeId = usePathPilotStore((state) => state.selectedCollegeId);
  const selectedExamId = usePathPilotStore((state) => state.selectedExamId);
  const opportunityActions = usePathPilotStore((state) => state.opportunityActions);
  const currentJourney = getStudentJourney(journey);
  const journeyConfig = studentJourneyConfig[currentJourney];
  const activeMilestone = roadmap?.milestones.find((milestone) => milestone.status === "active") ?? roadmap?.milestones[0];
  const hasEvidence = Object.values(resourceProgress).some((status) => status === "done") || progress.completedThisWeek > 0;
  const hasApplication = Object.values(opportunityActions).some((action) => action === "saved" || action === "joined");
  const pathway = getJourneyPathway(currentJourney, {
    hasProfile: Boolean(profileState),
    hasCareer: Boolean(career),
    hasRoadmap: Boolean(roadmap),
    hasStagePlan: Boolean(stagePlan),
    hasDegree: Boolean(selectedDegreeKey),
    hasCollegeOrExam: Boolean(selectedCollegeId || selectedExamId),
    hasEvidence,
    hasApplication,
    hasMission: Boolean(missionState),
  });
  const nextStep = pathway.find((step) => !step.done);
  const nextAction = activeMilestone && pathway.every((step) => step.done)
    ? { title: activeMilestone.title, detail: activeMilestone.description, href: "/roadmap", action: "Open roadmap", icon: Flag }
    : nextStep
      ? { title: nextStep.label, detail: nextStep.detail, href: nextStep.href, action: nextStep.action, icon: nextStep.icon }
      : { title: journeyConfig.nextAction.title, detail: journeyConfig.nextAction.detail, href: journeyConfig.nextAction.href, action: journeyConfig.nextAction.action, icon: journeyConfig.nextAction.icon };
  const NextIcon = nextAction.icon;

  return (
    <MotionConfig reducedMotion="user">
      <div className="student-dashboard text-[#10284a]">
        <header className="border-b border-[#dbe3ed] pb-7">
          <p className="text-sm font-semibold text-[#1264c4]">{journeyConfig.dashboardEyebrow}</p>
          <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.055em] sm:text-5xl">{journeyConfig.dashboardTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#526174] sm:text-base">{journeyConfig.dashboardDescription}</p>
            </div>
            <StudentStageSwitcher />
          </div>
        </header>

        <motion.section className="student-surface mt-8 grid overflow-hidden border border-[#cfdcea] bg-white lg:grid-cols-[1fr_300px]" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <div className="p-6 sm:p-8">
            <span className="grid size-11 place-items-center rounded-xl bg-[#eaf3ff] text-[#1264c4]"><NextIcon className="size-5" aria-hidden="true" /></span>
            <p className="mt-6 text-sm font-semibold text-[#1264c4]">Your next action</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">{nextAction.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#526174]">{nextAction.detail}</p>
            <Button asChild className="mt-6 bg-[#1264c4] hover:bg-[#0d55aa]"><Link href={nextAction.href}>{nextAction.action} <ArrowRight /></Link></Button>
          </div>
          <aside className="student-soft-surface border-t border-[#dbe3ed] bg-[#f3f8ff] p-6 lg:border-l lg:border-t-0 sm:p-8">
            <p className="text-sm font-semibold text-[#385c82]">Career Health</p>
            <p className="mt-3 text-5xl font-semibold tracking-[-0.07em] text-[#10284a]">{health.score}</p>
            <p className="mt-1 text-sm text-[#526174]">out of 100 readiness signals</p>
            <div className="mt-6 h-2 overflow-hidden bg-[#d7e9ff]" role="progressbar" aria-label="Career Health score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={health.score}><motion.div className="h-full bg-[#1264c4]" initial={{ width: 0 }} animate={{ width: `${health.score}%` }} transition={{ duration: 0.45 }} /></div>
            <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1264c4] hover:underline" href="/health-score">See what affects this <ArrowRight className="size-4" /></Link>
          </aside>
        </motion.section>

        <section className="mt-10">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-[#1264c4]">Your pathway</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em]">{stagePlan?.title ?? "From direction to opportunity"}</h2></div><p className="text-sm text-[#62748b]">Built for your {journeyConfig.label.toLowerCase()} stage</p></div>
          <ol className="mt-6 grid border-y border-[#dbe3ed] sm:grid-cols-5">
            {pathway.map((step, index) => <li className={cn("relative min-h-36 border-b border-[#dbe3ed] p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0", step.done && "bg-[#f8fcfa]")} key={step.label}><span className={cn("grid size-7 place-items-center rounded-full border text-xs font-bold", step.done ? "border-[#69b99d] bg-[#eaf8f1] text-[#18865a]" : "border-[#cbd5e1] bg-white text-[#62748b]")}>{step.done ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}</span><h3 className="mt-5 text-sm font-semibold">{step.label}</h3><Link className="mt-1 block text-xs leading-5 text-[#62748b] hover:text-[#1264c4]" href={step.href}>{step.detail}</Link></li>)}
          </ol>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.78fr]">
          <div>
            <p className="text-sm font-semibold text-[#1264c4]">This week</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em]">Build evidence that travels with you.</h2>
            <div className="mt-5 divide-y divide-[#dbe3ed] border-y border-[#dbe3ed]">
              {(stagePlan?.priorities ?? [{ title: career ? `Explore the path to ${career.careerName}` : "Review your career matches", detail: "Career discovery", href: "/career-discovery" }, { title: activeMilestone?.title ?? "Create your first roadmap", detail: "Roadmap", href: "/roadmap" }, { title: "Find a relevant opportunity", detail: "Opportunity Radar", href: "/radar" }]).map(({ title, href }) => <Link className="flex min-h-16 items-center gap-4 py-4 transition-colors hover:bg-[#f4f8fc]" href={href} key={title}><span className="grid size-9 place-items-center rounded-lg bg-[#eaf3ff] text-[#1264c4]"><Compass className="size-4" /></span><span className="flex-1 text-sm font-medium">{title}</span><ArrowRight className="size-4 text-[#62748b]" /></Link>)}
            </div>
          </div>
          <aside className="student-soft-surface border-l-2 border-[#1264c4] bg-[#f4f8fc] p-6"><p className="text-sm font-semibold text-[#385c82]">Your focus</p><p className="mt-4 text-xl font-semibold tracking-[-0.04em]">{mission.goal}</p><p className="mt-3 text-sm leading-6 text-[#526174]">{mission.milestones.find((milestone) => milestone.id === mission.nextMilestoneId)?.description ?? "Choose one small step that creates meaningful proof."}</p><div className="mt-6 flex items-center justify-between text-sm"><span className="text-[#62748b]">Mission progress</span><strong className="text-[#1264c4]">{mission.progressPct}%</strong></div><div className="mt-2 h-1.5 bg-[#d7e9ff]"><div className="h-full bg-[#1264c4]" style={{ width: `${mission.progressPct}%` }} /></div><Button asChild variant="ghost" className="mt-5 -ml-4 text-[#1264c4]"><Link href="/mission">Open Mission Mode <ArrowRight /></Link></Button></aside>
        </section>
      </div>
    </MotionConfig>
  );
}
