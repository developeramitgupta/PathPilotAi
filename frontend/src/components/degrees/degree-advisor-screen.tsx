"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { ArrowRight, Check, Clock3, GraduationCap, IndianRupee, Sparkles, TrendingUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { ComparisonTable, type ComparisonColumn } from "@/components/shared/comparison-table";
import { ChoiceChips, EducationHero, FieldLabel, ReasoningRefs } from "@/components/shared/education-primitives";
import { ErrorBanner, LoadingSkeleton } from "@/components/shared/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import { createAcceptedDecision } from "@/features/pathpilot/decision-helpers";
import type { DecisionRecord, DegreeAdvisorInput, DegreeAdvisorResult, DegreeComparison } from "@/features/pathpilot/schemas";
import { usePathPilotStore } from "@/stores/pathpilot-store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0, notation: "compact" }).format(value);
}
export function DegreeAdvisorScreen() {
  const discovery = usePathPilotStore((state) => state.careerDiscovery);
  const selectedCareerKey = usePathPilotStore((state) => state.selectedCareerKey);
  const selectedDegreeKey = usePathPilotStore((state) => state.selectedDegreeKey);
  const setEducationTarget = usePathPilotStore((state) => state.setEducationTarget);
  const recordDecision = usePathPilotStore((state) => state.recordDecision);
  const initialCareers = discovery?.matches.filter((match) => match.careerKey === selectedCareerKey || match.compatibility >= 80).slice(0, 3).map((match) => match.careerName) ?? ["Software Engineer", "Data Analyst"];
  const [careerText, setCareerText] = useState(initialCareers.join(", "));
  const [input, setInput] = useState<DegreeAdvisorInput>({ shortlistedCareers: initialCareers, totalBudget: 1_000_000, timeHorizon: "balanced" });
  const [result, setResult] = useState<DegreeAdvisorResult | null>(null);
  const compare = useMutation({ mutationFn: () => requestPathPilot<{ result: DegreeAdvisorResult }>("/api/degrees/compare", { method: "POST", body: JSON.stringify(input) }), onSuccess: ({ result: next }) => setResult(next) });
  const syncDecision = useMutation({ mutationFn: (decision: DecisionRecord) => requestPathPilot("/api/decisions", { method: "POST", body: JSON.stringify({ operation: "record", decision }) }) });

  function updateCareers(value: string) {
    setCareerText(value);
    const shortlistedCareers = value.split(",").map((career) => career.trim()).filter(Boolean).slice(0, 5);
    setInput((current) => ({ ...current, shortlistedCareers: shortlistedCareers.length ? shortlistedCareers : ["Undecided career"] }));
  }

  function selectDegree(degree: DegreeComparison) {
    const decision = createAcceptedDecision("degree", degree.degreeKey, degree.degreeType);
    setEducationTarget("degree", degree.degreeKey); recordDecision(decision); syncDecision.mutate(decision);
  }

  const columns: Array<ComparisonColumn<DegreeComparison>> = [
    { key: "duration", label: "Duration", render: (degree) => <span className="font-data text-foreground">{degree.durationYears} years</span> },
    { key: "cost", label: "Average total cost · demo", render: (degree) => <span className="font-data text-foreground">{formatCurrency(degree.averageTotalCost)}</span> },
    { key: "salary", label: "Entry salary · illustrative", render: (degree) => <span className="font-data text-foreground">{degree.typicalEntrySalary}</span> },
    { key: "outcomes", label: "Typical outcomes", render: (degree) => <div className="flex max-w-56 flex-wrap gap-1">{degree.topCareerOutcomes.map((outcome) => <Badge variant="outline" key={outcome}>{outcome}</Badge>)}</div> },
    { key: "fit", label: "Fit", render: (degree) => <span className="font-data text-xl font-semibold text-foreground">{degree.fitScore}%</span> },
    { key: "action", label: "Choose", render: (degree) => <Button size="sm" variant={selectedDegreeKey === degree.degreeKey ? "secondary" : "outline"} onClick={() => selectDegree(degree)}>{selectedDegreeKey === degree.degreeKey ? <Check /> : null}{selectedDegreeKey === degree.degreeKey ? "Selected" : "Select"}</Button> },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl">
      <EducationHero icon={GraduationCap} eyebrow="Education Advisor" title="Compare degree paths on the same evidence" description="See cost, time, flexibility, outcomes, and career alignment together—then get a recommendation grounded in the shortlist you actually care about." mode={result ? (result.mode === "ai" ? "AI-personalized" : "Deterministic fallback") : undefined} />
      <Card className="mt-7 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <FieldLabel htmlFor="degree-careers" label="Shortlisted careers" hint="comma separated"><Input id="degree-careers" value={careerText} onChange={(event) => updateCareers(event.target.value)} placeholder="Software Engineer, Data Analyst" /></FieldLabel>
          <FieldLabel htmlFor="degree-budget" label="Total study budget" hint={formatCurrency(input.totalBudget)}><input id="degree-budget" type="range" min="100000" max="3000000" step="50000" value={input.totalBudget} onChange={(event) => setInput({ ...input, totalBudget: Number(event.target.value) })} className="accent-[#7c5cfc]" /></FieldLabel>
        </div>
        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <ChoiceChips label="Time-horizon preference" values={[{ value: "fast", label: "Enter sooner" }, { value: "balanced", label: "Balanced" }, { value: "deep", label: "Build deeper" }]} selected={input.timeHorizon} onChange={(value) => setInput({ ...input, timeHorizon: value as DegreeAdvisorInput["timeHorizon"] })} />
          <Button onClick={() => compare.mutate()} disabled={compare.isPending}><Sparkles className={compare.isPending ? "animate-spin" : ""} /> Compare degree paths</Button>
        </div>
      </Card>
      <div className="mt-5 rounded-lg border border-warning/20 bg-warning/6 p-3 text-xs leading-5 text-[#ead58f]">Costs and salary bands are illustrative planning data—not quotes, guarantees, or live institution figures. Verify actual fees and outcomes before deciding.</div>
      {compare.isError ? <div className="mt-5"><ErrorBanner message={compare.error.message} onRetry={() => compare.mutate()} /></div> : null}
      {syncDecision.isError ? <div className="mt-5"><ErrorBanner message="Your selected path is saved locally but could not sync yet." /></div> : null}

      <section className="mt-7" aria-live="polite">
        {compare.isPending ? <LoadingSkeleton variant="list" /> : result ? <div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/14 to-[#3e8bff]/7 p-5 sm:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"><div className="max-w-3xl"><Badge variant="success"><Sparkles className="size-3" /> Recommended path</Badge><h2 className="mt-4 text-2xl font-semibold tracking-[-0.035em]">{result.recommendation.headline}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{result.recommendation.narrative}</p><div className="mt-4"><ReasoningRefs refs={result.recommendation.reasoningRefs} compact /></div></div><Button asChild className="shrink-0"><Link href="/what-if">Simulate this path <ArrowRight /></Link></Button></div>
          </motion.div>

          <div className="mt-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Static comparison dataset</p><h2 className="mt-1 text-xl font-semibold">Six paths, one decision frame</h2></div><Badge variant="demo">Fit is personalized</Badge></div>
            <div className="mt-5 hidden md:block"><ComparisonTable items={result.comparisons} columns={columns} getKey={(degree) => degree.degreeKey} highlightedKey={result.recommendation.degreeKey} getLabel={(degree) => degree.degreeType} /></div>
            <div className="mt-5 grid gap-4 md:hidden">{result.comparisons.map((degree) => <Card className={degree.degreeKey === result.recommendation.degreeKey ? "border-primary/35 p-5" : "p-5"} key={degree.degreeKey}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><Badge variant={degree.degreeKey === result.recommendation.degreeKey ? "success" : "demo"}>{degree.fitScore}% fit</Badge><Badge variant="outline">Flexibility {degree.flexibilityScore}/5</Badge></div><h3 className="mt-3 text-lg font-semibold">{degree.degreeType}</h3></div><Button size="sm" variant={selectedDegreeKey === degree.degreeKey ? "secondary" : "outline"} onClick={() => selectDegree(degree)}>{selectedDegreeKey === degree.degreeKey ? <Check /> : null}{selectedDegreeKey === degree.degreeKey ? "Selected" : "Select"}</Button></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-background/45 p-2"><Clock3 className="mx-auto size-4 text-[#a998ff]" /><p className="mt-1 font-data text-xs">{degree.durationYears} yrs</p></div><div className="rounded-lg bg-background/45 p-2"><IndianRupee className="mx-auto size-4 text-[#a998ff]" /><p className="mt-1 font-data text-xs">{formatCurrency(degree.averageTotalCost)}</p></div><div className="rounded-lg bg-background/45 p-2"><TrendingUp className="mx-auto size-4 text-[#a998ff]" /><p className="mt-1 font-data text-xs">{degree.typicalEntrySalary}</p></div></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{degree.roiNote}</p><div className="mt-4 flex flex-wrap gap-1.5">{degree.topCareerOutcomes.map((outcome) => <Badge variant="outline" key={outcome}>{outcome}</Badge>)}</div></Card>)}</div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">{result.comparisons.map((degree) => <Card className="p-5" key={`${degree.degreeKey}-analysis`}><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{degree.degreeType}</h3><Badge>{degree.fitScore}% fit</Badge></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{degree.roiNote}</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><div><p className="text-xs font-semibold text-success">Works well because</p><ul className="mt-2 grid gap-1.5">{degree.pros.map((pro) => <li className="flex gap-2 text-xs text-muted-foreground" key={pro}><Check className="size-3.5 shrink-0 text-success" />{pro}</li>)}</ul></div><div><p className="text-xs font-semibold text-warning">Watch for</p><ul className="mt-2 grid gap-1.5">{degree.cons.map((con) => <li className="text-xs text-muted-foreground" key={con}>• {con}</li>)}</ul></div></div></Card>)}</div>
        </div> : <Card className="grid min-h-[380px] place-items-center p-8 text-center"><div className="max-w-md"><GraduationCap className="mx-auto size-10 text-[#a998ff]" /><h2 className="mt-5 text-xl font-semibold">Compare the route, not just the label</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">PathPilot will score BTech, BCA, BSc, Diploma, Integrated, and Online degree routes against your careers, budget, and preferred pace.</p></div></Card>}
      </section>
      </div>
    </MotionConfig>
  );
}
