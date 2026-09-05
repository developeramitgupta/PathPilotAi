"use client";

import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Building2, Check, ExternalLink, Grid2X2, List, MapPin, Search, Sparkles, WalletCards } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { EducationHero, ChoiceChips, FieldLabel, ReasoningRefs } from "@/components/shared/education-primitives";
import { ErrorBanner, LoadingSkeleton } from "@/components/shared/feedback-states";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import { createAcceptedDecision } from "@/features/pathpilot/decision-helpers";
import type { CollegeFinderInput, CollegeFinderResult, CollegeMatchResult, DecisionRecord } from "@/features/pathpilot/schemas";
import { verifiedCollegeCourses, verifiedCollegeStates } from "@/lib/verified-data/local-dataset";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const cultureOptions = [
  { value: "sports", label: "Sports" }, { value: "tech-clubs", label: "Tech clubs" },
  { value: "quiet-academic", label: "Quiet academic" }, { value: "cultural", label: "Cultural" },
] as const;

const stateByCity: Record<string, string> = { Pune: "Maharashtra", Mumbai: "Maharashtra", Bengaluru: "Karnataka", Chennai: "Tamil Nadu", Hyderabad: "Telangana", Delhi: "Delhi" };
const budgetByBand = { low: 150_000, medium: 300_000, high: 600_000 } as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
function CollegeCard({ college, index, layout, selected, onOpen, onSelect }: { college: CollegeMatchResult; index: number; layout: "grid" | "list"; selected: boolean; onOpen: () => void; onSelect: () => void }) {
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={cn("render-lazy rounded-xl border bg-card/78 p-5 shadow-[var(--shadow-card)]", selected ? "border-success/35" : "border-border", layout === "list" && "lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-5")}>
      <ProgressRing value={college.compatibility} label="fit" size="sm" />
      <div className={cn("min-w-0", layout === "grid" ? "mt-4" : "mt-4 lg:mt-0")}>
        <div className="flex flex-wrap gap-2"><Badge variant={college.dataMode === "official" ? "success" : "demo"}>{college.officialRank ? `NIRF #${college.officialRank} · ${college.rankingYear}` : college.dataMode === "official" ? "Official record" : `Tier ${college.tier} · demo`}</Badge><Badge variant={college.ownership === "government" ? "success" : "default"}>{college.ownership}</Badge>{selected ? <Badge variant="success"><Check className="size-3" /> Shortlisted</Badge> : null}</div>
        <button type="button" onClick={onOpen} className="mt-3 text-left"><h2 className="text-lg font-semibold tracking-[-0.025em] hover:text-[#b9afff]">{college.name}</h2></button>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" /> {college.city}, {college.state}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{college.why}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">{college.estimatedAnnualCost ? <span><strong className="text-foreground">{formatCurrency(college.estimatedAnnualCost)}</strong> / year</span> : <span>Fee not verified</span>}{college.placementRateDemo !== null ? <span><strong className="text-foreground">{college.placementRateDemo}%</strong> placement</span> : <span>Placement data not verified</span>}</div>
      </div>
      <div className={cn("mt-5 flex gap-2", layout === "list" && "lg:mt-0 lg:flex-col")}><Button size="sm" variant="secondary" onClick={onOpen}>View details</Button><Button size="sm" onClick={onSelect}>{selected ? "Selected" : "Shortlist"}</Button></div>
    </motion.article>
  );
}

export function CollegeFinderScreen() {
  const profile = usePathPilotStore((state) => state.profile);
  const selectedCollegeId = usePathPilotStore((state) => state.selectedCollegeId);
  const setEducationTarget = usePathPilotStore((state) => state.setEducationTarget);
  const recordDecision = usePathPilotStore((state) => state.recordDecision);
  const [input, setInput] = useState<CollegeFinderInput>(() => ({
    annualBudget: budgetByBand[profile?.studyBudget ?? "medium"], state: stateByCity[profile?.city ?? ""] ?? "All India", city: "", ownership: "any", hostel: "preferred", placementPriority: 4, branch: "Any programme", scholarshipNeed: false, boardPercentile: 82, cultureTags: ["tech-clubs"],
  }));
  const [result, setResult] = useState<CollegeFinderResult | null>(null);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [detail, setDetail] = useState<CollegeMatchResult | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "cutoffs" | "placements" | "culture">("overview");

  const generate = useMutation({ mutationFn: () => requestPathPilot<{ result: CollegeFinderResult }>("/api/colleges/generate", { method: "POST", body: JSON.stringify(input) }), onSuccess: ({ result: next }) => setResult(next) });
  const syncDecision = useMutation({ mutationFn: (decision: DecisionRecord) => requestPathPilot("/api/decisions", { method: "POST", body: JSON.stringify({ operation: "record", decision }) }) });

  function shortlist(college: CollegeMatchResult) {
    const decision = createAcceptedDecision("college", college.collegeId, college.name);
    setEducationTarget("college", college.collegeId); recordDecision(decision); syncDecision.mutate(decision);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl">
      <EducationHero icon={Building2} eyebrow="College Advisor" title="Find colleges that fit your reality" description="Filter verified institution records by location, ownership, and known constraints. Every official result carries its source and verification date." mode={result ? (result.mode === "official" ? "Official records" : result.mode === "ai" ? "AI-ranked" : "Deterministic fallback") : undefined} />
      <div className="mt-5 rounded-lg border border-primary/20 bg-primary/6 p-3 text-xs leading-5 text-muted-foreground">{result?.disclaimer ?? "Official records replace demo data when the verified catalogue contains matches. Never treat a ranking as an admission, fee, placement, or cut-off guarantee."}</div>

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-[310px_1fr]">
        <Card className="p-5 xl:sticky xl:top-24">
          <div className="flex items-center gap-2"><Search className="size-4 text-[#a998ff]" /><h2 className="font-semibold">Your filters</h2></div>
          <div className="mt-5 grid gap-4">
            <FieldLabel htmlFor="college-budget" label="Annual budget" hint={formatCurrency(input.annualBudget)}><input id="college-budget" type="range" min="50000" max="800000" step="25000" value={input.annualBudget} onChange={(event) => setInput({ ...input, annualBudget: Number(event.target.value) })} className="accent-[#7c5cfc]" /></FieldLabel>
            <FieldLabel htmlFor="college-state" label="State"><Select id="college-state" value={input.state} onChange={(event) => setInput({ ...input, state: event.target.value })}>{verifiedCollegeStates.map((state) => <option value={state} key={state}>{state}</option>)}</Select></FieldLabel>
            <FieldLabel htmlFor="college-city" label="City" hint="optional"><Input id="college-city" value={input.city} onChange={(event) => setInput({ ...input, city: event.target.value })} placeholder="e.g. Pune" /></FieldLabel>
            <FieldLabel htmlFor="college-branch" label="Programme / course"><Select id="college-branch" value={input.branch} onChange={(event) => setInput({ ...input, branch: event.target.value })}>{verifiedCollegeCourses.map((branch) => <option key={branch}>{branch}</option>)}</Select></FieldLabel>
            <ChoiceChips label="Ownership" values={[{ value: "any", label: "Any" }, { value: "government", label: "Government" }, { value: "private", label: "Private" }]} selected={input.ownership} onChange={(value) => setInput({ ...input, ownership: value as CollegeFinderInput["ownership"] })} />
            <FieldLabel htmlFor="college-hostel" label="Hostel"><Select id="college-hostel" value={input.hostel} onChange={(event) => setInput({ ...input, hostel: event.target.value as CollegeFinderInput["hostel"] })}><option value="required">Required</option><option value="preferred">Preferred</option><option value="not-needed">Not needed</option></Select></FieldLabel>
            <FieldLabel htmlFor="college-board" label="Board percentile" hint={`${input.boardPercentile}%`}><input id="college-board" type="range" min="35" max="100" value={input.boardPercentile} onChange={(event) => setInput({ ...input, boardPercentile: Number(event.target.value) })} className="accent-[#7c5cfc]" /></FieldLabel>
            <FieldLabel htmlFor="placement-priority" label="Placement priority" hint={`${input.placementPriority}/5`}><input id="placement-priority" type="range" min="1" max="5" value={input.placementPriority} onChange={(event) => setInput({ ...input, placementPriority: Number(event.target.value) })} className="accent-[#7c5cfc]" /></FieldLabel>
            <ChoiceChips label="Campus culture" values={cultureOptions} selected={input.cultureTags} multiple onChange={(value) => setInput({ ...input, cultureTags: value as CollegeFinderInput["cultureTags"] })} />
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-background/40 px-3 text-sm"><input type="checkbox" checked={input.scholarshipNeed} onChange={(event) => setInput({ ...input, scholarshipNeed: event.target.checked })} className="size-4 accent-[#7c5cfc]" /> Scholarship support needed</label>
            <Button onClick={() => generate.mutate()} disabled={generate.isPending}><Sparkles className={generate.isPending ? "animate-spin" : ""} /> Rank colleges</Button>
          </div>
        </Card>

        <section aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Results</p><h2 className="mt-1 text-xl font-semibold">{result ? `${result.matches.length} strongest matches` : "Ready when you are"}</h2></div><div className="flex rounded-lg border border-border p-1"><Button size="sm" variant={layout === "grid" ? "secondary" : "ghost"} onClick={() => setLayout("grid")} aria-label="Grid view"><Grid2X2 /></Button><Button size="sm" variant={layout === "list" ? "secondary" : "ghost"} onClick={() => setLayout("list")} aria-label="List view"><List /></Button></div></div>
          {generate.isError ? <div className="mt-5"><ErrorBanner message={generate.error.message} onRetry={() => generate.mutate()} /></div> : null}
          {syncDecision.isError ? <div className="mt-5"><ErrorBanner message="Your shortlist is saved locally but could not sync yet." /></div> : null}
          <div className="mt-5">
            {generate.isPending ? <LoadingSkeleton /> : result?.matches.length ? <div className={cn("grid gap-4", layout === "grid" && "lg:grid-cols-2")}>{result.matches.map((college, index) => <CollegeCard key={college.collegeId} college={college} index={index} layout={layout} selected={selectedCollegeId === college.collegeId} onOpen={() => { setDetail(college); setDetailTab("overview"); }} onSelect={() => shortlist(college)} />)}</div> : result ? <Card className="grid min-h-[360px] place-items-center p-8 text-center"><div className="max-w-md"><WalletCards className="mx-auto size-9 text-[#a998ff]" /><h3 className="mt-4 text-xl font-semibold">No colleges match every hard filter</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Increase the budget, choose All India, remove the city, or make hostel optional. PathPilot will never hide a failed hard constraint.</p></div></Card> : <Card className="grid min-h-[360px] place-items-center p-8 text-center"><div className="max-w-md"><Building2 className="mx-auto size-9 text-[#a998ff]" /><h3 className="mt-4 text-xl font-semibold">Set the constraints that matter</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">The first pass removes colleges that cannot fit. The second pass explains which remaining options align best.</p></div></Card>}
          </div>
        </section>
      </div>

      <Modal open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null); }} title={detail?.name ?? "College detail"} description={detail ? `${detail.city}, ${detail.state} · ${detail.ownership}` : undefined} className="max-w-3xl">
        {detail ? <div><div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="College detail sections">{(["overview", "cutoffs", "placements", "culture"] as const).map((tab) => <Button size="sm" variant={detailTab === tab ? "secondary" : "ghost"} aria-pressed={detailTab === tab} key={tab} onClick={() => setDetailTab(tab)} className="capitalize">{tab}</Button>)}</div><div className="mt-5 min-h-44">{detailTab === "overview" ? <div><p className="text-sm leading-6 text-muted-foreground">{detail.overview}</p><div className="mt-4 flex flex-wrap gap-2">{detail.branches.length ? detail.branches.map((branch) => <Badge key={branch}>{branch}</Badge>) : <Badge variant="outline">Programme evidence not imported</Badge>}</div></div> : detailTab === "cutoffs" ? <div><p className="text-sm font-medium">{detail.boardCutoffDemo === null ? "No verified cut-off record yet" : `${detail.boardCutoffDemo}%`}</p><p className="mt-2 text-sm text-muted-foreground">Cut-offs vary by exam, category, quota, programme, and counselling round. PathPilot only shows them after an official record is published.</p></div> : detailTab === "placements" ? <div className="grid gap-3 sm:grid-cols-2"><Card className="p-4"><p className="text-xs text-muted-foreground">Placement rate</p><p className="mt-2 font-data text-2xl">{detail.placementRateDemo === null ? "Not verified" : `${detail.placementRateDemo}%`}</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Median package</p><p className="mt-2 font-data text-2xl">{detail.medianPackageDemo ?? "Not verified"}</p></Card></div> : <div><p className="text-sm text-muted-foreground">Published availability signals:</p><div className="mt-3 flex flex-wrap gap-2">{detail.cultureTags.map((tag) => <Badge key={tag}>{tag.replaceAll("-", " ")}</Badge>)}<Badge variant="outline">{detail.hostelAvailable === null ? "Hostel not verified" : detail.hostelAvailable ? "Hostel available" : "No hostel listed"}</Badge><Badge variant="outline">{detail.scholarshipAvailable === null ? "Scholarship not verified" : detail.scholarshipAvailable ? "Scholarship listed" : "No scholarship listed"}</Badge></div></div>}</div><ReasoningRefs refs={detail.reasoningRefs} /><div className="mt-6 flex flex-wrap justify-end gap-2">{detail.sourceUrl ? <Button asChild variant="secondary"><a href={detail.sourceUrl} target="_blank" rel="noreferrer">Open source <ExternalLink /></a></Button> : null}<Button onClick={() => shortlist(detail)}>{selectedCollegeId === detail.collegeId ? <Check /> : null}{selectedCollegeId === detail.collegeId ? "Shortlisted" : "Add to shortlist"}</Button></div></div> : null}
      </Modal>
      </div>
    </MotionConfig>
  );
}
