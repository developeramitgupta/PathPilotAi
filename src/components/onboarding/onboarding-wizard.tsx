"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  LoaderCircle,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { ErrorBanner } from "@/components/shared/feedback-states";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import {
  defaultOnboardingProfile,
  onboardingProfileSchema,
  type CareerDiscoveryResult,
  type OnboardingProfile,
} from "@/features/pathpilot/schemas";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const steps = [
  { title: "About you", eyebrow: "Your starting point", description: "A little context keeps every recommendation relevant to where you are now." },
  { title: "Interests", eyebrow: "What pulls you in", description: "Choose the subjects, ideas, and activities you naturally return to." },
  { title: "Work style", eyebrow: "How you do your best work", description: "These are preference sliders, not a clinical personality assessment." },
  { title: "Priorities", eyebrow: "What your path needs to respect", description: "Balance ambition with location, study style, budget, and time horizon." },
  { title: "Strengths", eyebrow: "Your current toolkit", description: "Self-ratings are a starting point. PathPilot will update them as evidence grows." },
  { title: "Review", eyebrow: "Your profile at a glance", description: "Check the signals PathPilot will use to rank your first career matches." },
] as const;

const interestOptions = ["Technology", "Design", "Business", "Healthcare", "Science", "Art", "Finance", "Environment", "Public service", "Psychology", "Travel", "Sports", "Media", "Engineering", "Education", "Space"];
const subjectOptions = ["Mathematics", "Computer Science", "Physics", "Chemistry", "Biology", "English", "Economics", "Accountancy", "Business Studies", "Psychology", "Political Science", "History", "Geography", "Art"];
const hobbyOptions = ["Coding", "Gaming", "Drawing", "Photography", "Writing", "Making videos", "Building things", "Robotics", "Reading", "Sports", "Volunteering", "Organising events", "Cooking", "Trekking", "Investing", "Making music"];
const strengthOptions = ["Problem solving", "Curiosity", "Communication", "Creativity", "Leadership", "Empathy", "Attention to detail", "Consistency", "Research", "Collaboration", "Numerical thinking", "Visual thinking"];
const weaknessOptions = ["Public speaking", "Time management", "Confidence", "Advanced mathematics", "Writing", "Networking", "Staying consistent", "Making decisions", "Asking for help", "Handling pressure"];

const workStyleItems: Array<{
  key: keyof OnboardingProfile["workStyle"];
  label: string;
  low: string;
  high: string;
}> = [
  { key: "collaboration", label: "Collaboration", low: "Mostly solo", high: "Highly social" },
  { key: "structure", label: "Structure", low: "Open-ended", high: "Clear process" },
  { key: "creativity", label: "Creative expression", low: "Proven patterns", high: "Original ideas" },
  { key: "analysis", label: "Analytical depth", low: "Intuitive", high: "Evidence-heavy" },
  { key: "people", label: "People contact", low: "Low contact", high: "People all day" },
  { key: "field", label: "Work environment", low: "Desk / indoor", high: "Field / outdoors" },
  { key: "risk", label: "Risk comfort", low: "Predictable", high: "Experimental" },
  { key: "pace", label: "Work pace", low: "Steady", high: "Fast-changing" },
];

function ChoiceGrid({
  options,
  selected,
  onChange,
  label,
}: {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  label: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              type="button"
              aria-pressed={active}
              className={cn(
                "min-h-10 rounded-full border px-3.5 text-xs transition-colors",
                active
                  ? "border-primary/45 bg-primary/14 text-[#c8c0ff]"
                  : "border-border bg-background/45 text-muted-foreground hover:border-primary/25 hover:text-foreground",
              )}
              key={option}
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((item) => item !== option)
                    : [...selected, option],
                )
              }
            >
              {active ? <Check className="mr-1.5 inline size-3.5" aria-hidden="true" /> : null}
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SegmentedChoice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <button
            type="button"
            aria-pressed={value === option.value}
            className={cn(
              "min-h-11 rounded-lg border px-3 text-sm transition-colors",
              value === option.value
                ? "border-primary/45 bg-primary/12 text-foreground"
                : "border-border bg-background/45 text-muted-foreground hover:text-foreground",
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ReviewGroup({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm leading-6">{value}</p>
    </div>
  );
}

function stepIsValid(step: number, profile: OnboardingProfile) {
  if (step === 0) return profile.name.trim().length >= 2 && profile.city.trim().length >= 2;
  if (step === 1) return profile.interests.length >= 2 && profile.favoriteSubjects.length >= 2 && profile.hobbies.length >= 1;
  if (step === 4) return profile.strengths.length >= 2 && profile.weaknesses.length >= 1;
  if (step === 5) return onboardingProfileSchema.safeParse(profile).success;
  return true;
}

export function OnboardingWizard() {
  const router = useRouter();
  const onboardingDraft = usePathPilotStore((state) => state.onboardingDraft);
  const setOnboardingDraft = usePathPilotStore((state) => state.setOnboardingDraft);
  const completeOnboarding = usePathPilotStore((state) => state.completeOnboarding);
  const [profile, setProfileState] = useState<OnboardingProfile>(
    () => onboardingDraft ?? defaultOnboardingProfile,
  );
  const [step, setStep] = useState(0);
  const [showValidation, setShowValidation] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const completeMutation = useMutation({
    mutationFn: () =>
      requestPathPilot<{
        profile: OnboardingProfile;
        result: CareerDiscoveryResult;
      }>("/api/onboarding/complete", {
        method: "POST",
        body: JSON.stringify(profile),
      }),
    onSuccess: (payload) => {
      completeOnboarding(payload.profile, payload.result);
      router.push("/career-discovery");
    },
  });

  function updateProfile(next: OnboardingProfile) {
    setProfileState(next);
    setOnboardingDraft(next);
  }

  function update<K extends keyof OnboardingProfile>(
    key: K,
    value: OnboardingProfile[K],
  ) {
    updateProfile({ ...profile, [key]: value });
  }

  function goNext() {
    if (!stepIsValid(step, profile)) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    } else {
      completeMutation.mutate();
    }
  }

  const current = steps[step];

  return (
    <main className="min-h-screen px-4 py-5 pb-28 sm:px-6 sm:py-8 md:pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Badge variant="success"><Save className="size-3" /> Draft saved</Badge>
            <Button variant="ghost" size="icon" aria-label="Leave onboarding" onClick={() => setExitOpen(true)}><X /></Button>
          </div>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[250px_1fr] lg:gap-10">
          <aside className="lg:sticky lg:top-8 lg:h-fit">
            <div className="flex items-center justify-between lg:block">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Your profile</p>
                <p className="mt-1 font-data text-xs text-[#aaa0ef]">Step {step + 1} of {steps.length}</p>
              </div>
              <div className="font-display text-3xl font-semibold lg:mt-5">{Math.round(((step + 1) / steps.length) * 100)}%</div>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/6" role="progressbar" aria-label="Onboarding progress" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={step + 1}><div className="h-full rounded-full signature-gradient transition-[width] duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>
            <ol className="mt-6 hidden gap-2 lg:grid">
              {steps.map((item, index) => (
                <li key={item.title}>
                  <button
                    type="button"
                    disabled={index > step}
                    aria-current={index === step ? "step" : undefined}
                    onClick={() => setStep(index)}
                    className={cn(
                      "flex min-h-10 w-full items-center gap-3 rounded-lg px-2 text-left text-sm text-muted-foreground disabled:cursor-not-allowed disabled:opacity-55",
                      index === step && "bg-primary/10 text-foreground",
                    )}
                  >
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-full border border-border font-data text-[10px]", index < step && "border-success/30 bg-success/10 text-success", index === step && "border-primary/40 bg-primary text-white")}>{index < step ? <Check className="size-3.5" aria-hidden="true" /> : index + 1}</span>
                    {item.title}
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-6 sm:px-8 sm:py-8">
              <Badge><Sparkles className="size-3" /> {current.eyebrow}</Badge>
              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{current.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{current.description}</p>
            </div>

            <div className="p-5 sm:p-8">
              {step === 0 ? (
                <div className="grid gap-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">What should we call you?<Input autoComplete="name" value={profile.name} onChange={(event) => update("name", event.target.value)} /></label>
                    <label className="grid gap-2 text-sm font-medium">Your city<Input autoComplete="address-level2" value={profile.city} onChange={(event) => update("city", event.target.value)} /></label>
                  </div>
                  <SegmentedChoice label="Where are you right now?" value={profile.currentStage} onChange={(value) => update("currentStage", value)} options={[
                    { value: "class-10", label: "Class 10" },
                    { value: "class-11-12", label: "Class 11-12" },
                    { value: "college", label: "In college" },
                    { value: "graduate", label: "Graduate" },
                    { value: "early-career", label: "Early career" },
                  ]} />
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-8">
                  <ChoiceGrid label="Interests · choose at least 2" options={interestOptions} selected={profile.interests} onChange={(value) => update("interests", value)} />
                  <ChoiceGrid label="Favorite subjects · choose at least 2" options={subjectOptions} selected={profile.favoriteSubjects} onChange={(value) => update("favoriteSubjects", value)} />
                  <ChoiceGrid label="Hobbies · choose at least 1" options={hobbyOptions} selected={profile.hobbies} onChange={(value) => update("hobbies", value)} />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-7">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {workStyleItems.map((item) => (
                      <label htmlFor={`work-style-${item.key}`} className="rounded-lg border border-border bg-background/35 p-4" key={item.key}>
                        <span className="flex items-center justify-between gap-3 text-sm font-medium"><span>{item.label}</span><span className="font-data text-xs text-[#b5aaff]">{profile.workStyle[item.key]}/5</span></span>
                        <input id={`work-style-${item.key}`} className="mt-4 w-full accent-[#7c5cfc]" type="range" min="1" max="5" step="1" value={profile.workStyle[item.key]} aria-valuetext={`${profile.workStyle[item.key]} out of 5; ${item.low} to ${item.high}`} onChange={(event) => update("workStyle", { ...profile.workStyle, [item.key]: Number(event.target.value) })} />
                        <span className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>{item.low}</span><span>{item.high}</span></span>
                      </label>
                    ))}
                  </div>
                  <SegmentedChoice label="Default work mode" value={profile.preferredWorkMode} onChange={(value) => update("preferredWorkMode", value)} options={[{ value: "solo", label: "Mostly solo" }, { value: "balanced", label: "Balanced" }, { value: "team", label: "Team-heavy" }]} />
                  <SegmentedChoice label="Environment" value={profile.preferredEnvironment} onChange={(value) => update("preferredEnvironment", value)} options={[{ value: "indoor", label: "Indoor / desk" }, { value: "hybrid", label: "Hybrid" }, { value: "field", label: "Field / outdoors" }]} />
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-8">
                  <SegmentedChoice label="Study style" value={profile.studyPref} onChange={(value) => update("studyPref", value)} options={[{ value: "theory", label: "Theory-heavy" }, { value: "balanced", label: "Balanced" }, { value: "applied", label: "Hands-on / applied" }]} />
                  <SegmentedChoice label="Learning format" value={profile.learningStyle} onChange={(value) => update("learningStyle", value)} options={[{ value: "video", label: "Video" }, { value: "reading", label: "Reading" }, { value: "hands-on", label: "Hands-on" }, { value: "blended", label: "Blended" }]} />
                  <SegmentedChoice label="Study budget" value={profile.studyBudget} onChange={(value) => update("studyBudget", value)} options={[{ value: "low", label: "Cost-sensitive" }, { value: "medium", label: "Moderate" }, { value: "high", label: "Flexible" }]} />
                  <SegmentedChoice label="Location preference" value={profile.locationPref} onChange={(value) => update("locationPref", value)} options={[{ value: "home-city", label: "Stay near home" }, { value: "anywhere-india", label: "Anywhere in India" }, { value: "remote", label: "Remote-friendly" }, { value: "global", label: "Open to global" }]} />
                  <SegmentedChoice label="Illustrative entry salary goal" value={profile.salaryExpectation} onChange={(value) => update("salaryExpectation", value)} options={[{ value: "3-6L", label: "₹3-6L" }, { value: "6-12L", label: "₹6-12L" }, { value: "12-20L", label: "₹12-20L" }, { value: "20L+", label: "₹20L+" }]} />
                  <label htmlFor="higher-studies-lean" className="rounded-lg border border-border bg-background/35 p-4">
                    <span className="flex items-center justify-between gap-3 text-sm font-medium"><span>Higher studies vs. job</span><span className="font-data text-xs text-[#b5aaff]">{profile.higherStudiesLean}% higher studies</span></span>
                    <input id="higher-studies-lean" className="mt-4 w-full accent-[#7c5cfc]" type="range" min="0" max="100" step="5" value={profile.higherStudiesLean} aria-valuetext={`${profile.higherStudiesLean}% higher studies`} onChange={(event) => update("higherStudiesLean", Number(event.target.value))} />
                    <span className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>Start working sooner</span><span>Study further first</span></span>
                  </label>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="grid gap-8">
                  <ChoiceGrid label="Strengths · choose at least 2" options={strengthOptions} selected={profile.strengths} onChange={(value) => update("strengths", value)} />
                  <ChoiceGrid label="Growth areas · choose at least 1" options={weaknessOptions} selected={profile.weaknesses} onChange={(value) => update("weaknesses", value)} />
                  <p className="rounded-lg border border-primary/15 bg-primary/8 p-4 text-xs leading-5 text-[#c5bcff]">These are self-ratings, not fixed labels. PathPilot will compare them with projects, practice, and progress over time.</p>
                </div>
              ) : null}

              {step === 5 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReviewGroup label="Starting point" value={`${profile.currentStage.replaceAll("-", " ")} · ${profile.city}`} />
                  <ReviewGroup label="Interests" value={profile.interests.join(" · ")} />
                  <ReviewGroup label="Favorite subjects" value={profile.favoriteSubjects.join(" · ")} />
                  <ReviewGroup label="Hobbies" value={profile.hobbies.join(" · ")} />
                  <ReviewGroup label="Learning preferences" value={`${profile.studyPref} study · ${profile.learningStyle} learning · ${profile.preferredWorkMode} work`} />
                  <ReviewGroup label="Constraints" value={`${profile.locationPref.replaceAll("-", " ")} · ${profile.studyBudget} budget · ${profile.salaryExpectation} illustrative entry goal`} />
                  <ReviewGroup label="Strengths" value={profile.strengths.join(" · ")} />
                  <ReviewGroup label="Growth areas" value={profile.weaknesses.join(" · ")} />
                </div>
              ) : null}

              {showValidation ? <p className="mt-6 rounded-lg border border-warning/25 bg-warning/8 p-3 text-sm text-warning" role="alert">Complete the required choices on this step before continuing.</p> : null}
              {completeMutation.isError ? <div className="mt-6"><ErrorBanner message={completeMutation.error.message} onRetry={() => completeMutation.mutate()} /></div> : null}

              <div className="mt-9 hidden items-center justify-between border-t border-border pt-6 md:flex">
                <Button variant="ghost" disabled={step === 0 || completeMutation.isPending} onClick={() => setStep((currentStep) => currentStep - 1)}><ArrowLeft /> Back</Button>
                <Button onClick={goNext} disabled={completeMutation.isPending}>
                  {completeMutation.isPending ? <><LoaderCircle className="animate-spin" /> Ranking your matches…</> : step === steps.length - 1 ? <><Sparkles /> Find my careers</> : <>Next <ArrowRight /></>}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background/94 p-3 backdrop-blur-xl md:hidden">
        <Button variant="ghost" size="icon" disabled={step === 0 || completeMutation.isPending} onClick={() => setStep((currentStep) => currentStep - 1)} aria-label="Previous step"><ChevronLeft /></Button>
        <Button className="flex-1" onClick={goNext} disabled={completeMutation.isPending}>{completeMutation.isPending ? <><LoaderCircle className="animate-spin" /> Ranking…</> : step === steps.length - 1 ? <><Sparkles /> Find my careers</> : <>Next <ArrowRight /></>}</Button>
      </div>

      <Modal open={exitOpen} onOpenChange={setExitOpen} title="Leave onboarding?" description="Your progress is saved on this device, but your profile will stay incomplete until you finish all six steps.">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => router.push("/dashboard")}>Leave anyway</Button>
          <Button onClick={() => setExitOpen(false)}>Continue onboarding</Button>
        </div>
      </Modal>
    </main>
  );
}
