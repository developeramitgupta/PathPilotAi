"use client";

import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { ArrowUpRight, CalendarClock, Check, FileCheck2, Flag, GraduationCap, Sparkles } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { ChoiceChips, DifficultyMeter, EducationHero, FieldLabel, ReasoningRefs } from "@/components/shared/education-primitives";
import { ErrorBanner, LoadingSkeleton } from "@/components/shared/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import { createAcceptedDecision } from "@/features/pathpilot/decision-helpers";
import type { DecisionRecord, ExamNavigatorInput, ExamNavigatorResult, ExamRecommendation } from "@/features/pathpilot/schemas";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const budgetByBand = { low: 150_000, medium: 300_000, high: 600_000 } as const;

function ExamCard({ exam, index, selected, onOpen, onSelect }: { exam: ExamRecommendation; index: number; selected: boolean; onOpen: () => void; onSelect: () => void }) {
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="render-lazy rounded-xl border border-border bg-card/78 p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge>{exam.category}</Badge><Badge variant="demo">Dates mocked</Badge>{selected ? <Badge variant="success"><Check className="size-3" /> Target exam</Badge> : null}</div><button type="button" onClick={onOpen} className="mt-3 text-left"><h2 className="text-xl font-semibold tracking-[-0.03em] hover:text-[#b9afff]">{exam.shortName}</h2><p className="mt-1 text-xs text-muted-foreground">{exam.name}</p></button></div>
        <div className="shrink-0"><p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Difficulty {exam.difficulty}/5</p><DifficultyMeter value={exam.difficulty} /></div>
      </div>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">{exam.why}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-border bg-background/35 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Eligibility summary</p><p className="mt-2 text-xs leading-5">{exam.eligibilitySummary}</p></div><div className="rounded-lg border border-border bg-background/35 p-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Accepted institutions · demo</p><p className="mt-2 font-data text-xl">{exam.acceptedCollegesCountDemo || "Professional route"}</p></div></div>
      <div className="mt-4 rounded-lg border border-warning/18 bg-warning/6 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-[#ead58f]"><CalendarClock className="size-4" /> {exam.mockDates.exam}</div><p className="mt-1 text-[11px] text-muted-foreground">Mock date - verify on the official website.</p></div>
      <div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={onOpen}>Open details</Button><Button size="sm" onClick={onSelect}>{selected ? "Target selected" : "Set as target"}</Button></div>
    </motion.article>
  );
}
export function ExamNavigatorScreen() {
  const profile = usePathPilotStore((state) => state.profile);
  const discovery = usePathPilotStore((state) => state.careerDiscovery);
  const selectedCareerKey = usePathPilotStore((state) => state.selectedCareerKey);
  const selectedExamId = usePathPilotStore((state) => state.selectedExamId);
  const setEducationTarget = usePathPilotStore((state) => state.setEducationTarget);
  const recordDecision = usePathPilotStore((state) => state.recordDecision);
  const careerName = discovery?.matches.find((match) => match.careerKey === selectedCareerKey)?.careerName ?? discovery?.matches[0]?.careerName ?? "Software Engineer";
  const [input, setInput] = useState<ExamNavigatorInput>(() => ({ careerGoal: careerName, location: profile?.city ? `${profile.city}, India` : "All India", annualBudget: budgetByBand[profile?.studyBudget ?? "medium"], collegePreference: "any", difficultyTolerance: 3 }));
  const [result, setResult] = useState<ExamNavigatorResult | null>(null);
  const [detail, setDetail] = useState<ExamRecommendation | null>(null);
  const recommend = useMutation({ mutationFn: () => requestPathPilot<{ result: ExamNavigatorResult }>("/api/exams/recommend", { method: "POST", body: JSON.stringify(input) }), onSuccess: ({ result: next }) => setResult(next) });
  const syncDecision = useMutation({ mutationFn: (decision: DecisionRecord) => requestPathPilot("/api/decisions", { method: "POST", body: JSON.stringify({ operation: "record", decision }) }) });

  function selectExam(exam: ExamRecommendation) {
    const decision = createAcceptedDecision("exam", exam.examId, exam.shortName);
    setEducationTarget("exam", exam.examId); recordDecision(decision); syncDecision.mutate(decision);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-6xl">
      <EducationHero icon={FileCheck2} eyebrow="Exam Planner" title="Prepare only for exams that serve your goal" description="PathPilot maps your career and college preferences to relevant entrance routes, then explains the trade-offs without inventing dates." mode={result ? (result.mode === "hybrid-ai" ? "Hybrid AI" : "Rule-based fallback") : undefined} />
      <Card className="mt-7 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr_1fr]">
          <FieldLabel htmlFor="exam-career" label="Career goal"><Input id="exam-career" value={input.careerGoal} onChange={(event) => setInput({ ...input, careerGoal: event.target.value })} placeholder="e.g. Software Engineer" /></FieldLabel>
          <FieldLabel htmlFor="exam-location" label="Preferred location"><Input id="exam-location" value={input.location} onChange={(event) => setInput({ ...input, location: event.target.value })} /></FieldLabel>
          <FieldLabel htmlFor="exam-budget" label="Annual college budget" hint={`₹${Math.round(input.annualBudget / 1000)}k`}><input id="exam-budget" type="range" min="50000" max="800000" step="25000" value={input.annualBudget} onChange={(event) => setInput({ ...input, annualBudget: Number(event.target.value) })} className="accent-[#7c5cfc]" /></FieldLabel>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <ChoiceChips label="College preference" values={[{ value: "any", label: "Any" }, { value: "government", label: "Government" }, { value: "private", label: "Private" }]} selected={input.collegePreference} onChange={(value) => setInput({ ...input, collegePreference: value as ExamNavigatorInput["collegePreference"] })} />
          <FieldLabel htmlFor="difficulty-tolerance" label="Difficulty tolerance" hint={`${input.difficultyTolerance}/5`}><input id="difficulty-tolerance" type="range" min="1" max="5" value={input.difficultyTolerance} onChange={(event) => setInput({ ...input, difficultyTolerance: Number(event.target.value) })} className="accent-[#7c5cfc]" /></FieldLabel>
          <Button onClick={() => recommend.mutate()} disabled={recommend.isPending}><Sparkles className={recommend.isPending ? "animate-spin" : ""} /> Recommend exams</Button>
        </div>
      </Card>
      <div className="mt-5 rounded-lg border border-warning/20 bg-warning/6 p-3 text-xs leading-5 text-[#ead58f]">Mock dates - verify every date on the official exam website. PathPilot never asks AI to generate an important exam date.</div>
      {recommend.isError ? <div className="mt-5"><ErrorBanner message={recommend.error.message} onRetry={() => recommend.mutate()} /></div> : null}
      {syncDecision.isError ? <div className="mt-5"><ErrorBanner message="Your target is saved locally but could not sync yet." /></div> : null}
      <section className="mt-7" aria-live="polite"><div className="flex items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Recommended routes</p><h2 className="mt-1 text-xl font-semibold">{result ? `${result.recommendations.length} exams mapped to your goal` : "Your focused exam plan"}</h2></div></div><div className="mt-5">{recommend.isPending ? <LoadingSkeleton variant="list" /> : result?.recommendations.length ? <div className="grid gap-4">{result.recommendations.map((exam, index) => <ExamCard key={exam.examId} exam={exam} index={index} selected={selectedExamId === exam.examId} onOpen={() => setDetail(exam)} onSelect={() => selectExam(exam)} />)}</div> : result ? <Card className="grid min-h-[330px] place-items-center p-8 text-center"><div><Flag className="mx-auto size-9 text-[#a998ff]" /><h3 className="mt-4 text-xl font-semibold">No mapped exam found</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Try a broader career phrase such as engineering, medicine, law, design, finance, hospitality, science, or software.</p></div></Card> : <Card className="grid min-h-[330px] place-items-center p-8 text-center"><div><GraduationCap className="mx-auto size-9 text-[#a998ff]" /><h3 className="mt-4 text-xl font-semibold">Turn a goal into an exam shortlist</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">We will rule-map the relevant exams, then explain why each route deserves your preparation time.</p></div></Card>}</div></section>

      <Modal open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null); }} title={detail?.shortName ?? "Exam detail"} description={detail?.name} className="max-w-3xl">
        {detail ? <div><div className="grid gap-4 sm:grid-cols-2"><Card className="p-4"><p className="text-xs text-muted-foreground">Difficulty</p><div className="mt-3"><DifficultyMeter value={detail.difficulty} /></div></Card><Card className="p-4"><p className="text-xs text-muted-foreground">Demo accepted-college count</p><p className="mt-2 font-data text-2xl">{detail.acceptedCollegesCountDemo || "N/A"}</p></Card></div><div className="mt-5"><h3 className="text-sm font-semibold">Why it belongs on your list</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{detail.why}</p></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><h3 className="text-sm font-semibold">Advantages</h3><ul className="mt-3 grid gap-2">{detail.advantages.map((advantage) => <li className="flex gap-2 text-sm text-muted-foreground" key={advantage}><Check className="mt-0.5 size-4 shrink-0 text-success" />{advantage}</li>)}</ul></div><div><h3 className="text-sm font-semibold">Three success tips</h3><ol className="mt-3 grid gap-2">{detail.successTips.map((tip, index) => <li className="flex gap-2 text-sm text-muted-foreground" key={tip}><span className="font-data text-[#a998ff]">0{index + 1}</span>{tip}</li>)}</ol></div></div><div className="mt-5 rounded-lg border border-warning/20 bg-warning/6 p-4"><p className="text-xs font-semibold text-[#ead58f]">Mock timeline · verify officially</p><dl className="mt-3 grid gap-3 text-xs sm:grid-cols-3"><div><dt className="text-muted-foreground">Application</dt><dd className="mt-1">{detail.mockDates.application}</dd></div><div><dt className="text-muted-foreground">Exam</dt><dd className="mt-1">{detail.mockDates.exam}</dd></div><div><dt className="text-muted-foreground">Result</dt><dd className="mt-1">{detail.mockDates.result}</dd></div></dl></div><div className="mt-5"><ReasoningRefs refs={detail.reasoningRefs} /></div><div className="mt-6 flex flex-wrap justify-end gap-2"><Button variant="secondary" asChild><a href={detail.officialUrl} target="_blank" rel="noreferrer">Official site <ArrowUpRight /></a></Button><Button onClick={() => selectExam(detail)}>{selectedExamId === detail.examId ? <Check /> : null}{selectedExamId === detail.examId ? "Target selected" : "Set as target"}</Button></div></div> : null}
      </Modal>
      </div>
    </MotionConfig>
  );
}
