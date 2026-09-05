import type { LucideIcon } from "lucide-react";
import { BrainCircuit, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function EducationHero({ icon: Icon, eyebrow, title, description, mode }: { icon: LucideIcon; eyebrow: string; title: string; description: string; mode?: string }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge><Icon className="size-3" /> {eyebrow}</Badge>
          {mode ? <Badge variant={mode.includes("ai") || mode.includes("AI") ? "success" : "demo"}>{mode}</Badge> : null}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
export function FieldLabel({ htmlFor, label, hint, children }: { htmlFor?: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm" htmlFor={htmlFor}>
      <span className="flex items-baseline justify-between gap-3 font-medium">
        {label}
        {hint ? <span className="text-[11px] font-normal text-muted-foreground">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function ChoiceChips<T extends string>({ label, values, selected, onChange, multiple = false }: { label: string; values: ReadonlyArray<{ value: T; label: string }>; selected: T | T[]; onChange: (value: T | T[]) => void; multiple?: boolean }) {
  const current = Array.isArray(selected) ? selected : [selected];
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((item) => {
          const active = current.includes(item.value);
          return (
            <button
              type="button"
              aria-pressed={active}
              key={item.value}
              onClick={() => {
                if (!multiple) return onChange(item.value);
                onChange(active ? current.filter((value) => value !== item.value) : [...current, item.value]);
              }}
              className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors", active ? "border-primary/45 bg-primary/14 text-[#c4bbff]" : "border-border bg-background/40 text-muted-foreground hover:text-foreground")}
            >
              {active ? <Check className="size-3" /> : null}{item.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

const refLabels: Record<string, string> = {
  annualBudget: "Annual budget", state: "Preferred state", branch: "Chosen branch",
  placementPriority: "Placement priority", hostel: "Hostel preference", scholarshipNeed: "Scholarship need",
  cultureTags: "Campus culture", careerGoal: "Career goal", location: "Location",
  collegePreference: "College preference", difficultyTolerance: "Difficulty tolerance",
  shortlistedCareers: "Shortlisted careers", totalBudget: "Total budget", timeHorizon: "Time horizon",
};

export function ReasoningRefs({ refs, compact = false }: { refs: string[]; compact?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-primary/15 bg-primary/6", compact ? "p-3" : "p-4")}>
      <p className="flex items-center gap-2 text-xs font-semibold text-[#c4bbff]"><BrainCircuit className="size-4" /> Why this?</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {refs.map((ref) => <Badge variant="outline" key={ref}>{refLabels[ref] ?? ref.replaceAll(".", " · ")}</Badge>)}
      </div>
    </div>
  );
}

export function DifficultyMeter({ value }: { value: number }) {
  return (
    <div aria-label={`Difficulty ${value} out of 5`} role="img" className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => <span key={index} className={cn("h-2.5 w-5 rounded-full", index < value ? "bg-gradient-to-r from-primary to-[#3e8bff]" : "bg-white/8")} />)}
    </div>
  );
}
