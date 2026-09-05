"use client";

import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  BookmarkCheck,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  RefreshCw,
  Sparkles,
  ThumbsDown,
  TrendingUp,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  EmptyState,
  ErrorBanner,
  LoadingSkeleton,
} from "@/components/shared/feedback-states";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import {
  rejectReasons,
  type CareerDiscoveryResult,
  type CareerMatchResult,
  type DecisionRecord,
} from "@/features/pathpilot/schemas";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

function titleForRef(ref: string) {
  const labels: Record<string, string> = {
    interests: "Your interests",
    favoriteSubjects: "Favorite subjects",
    hobbies: "Your hobbies",
    "workStyle.analysis": "Analytical work style",
    studyPref: "Study preference",
    locationPref: "Location preference",
  };
  return labels[ref] ?? ref.replaceAll(".", " · ");
}

function valueForRef(ref: string, profile: NonNullable<ReturnType<typeof usePathPilotStore.getState>["profile"]>) {
  if (ref === "interests") return profile.interests.join(", ");
  if (ref === "favoriteSubjects") return profile.favoriteSubjects.join(", ");
  if (ref === "hobbies") return profile.hobbies.join(", ");
  if (ref === "workStyle.analysis") return `${profile.workStyle.analysis}/5 preference`;
  if (ref === "studyPref") return profile.studyPref;
  if (ref === "locationPref") return profile.locationPref.replaceAll("-", " ");
  return "Profile signal";
}

function CareerCard({
  match,
  index,
  decision,
  profile,
  onAccept,
  onReject,
  onSnooze,
  onOpen,
  onRoadmap,
}: {
  match: CareerMatchResult;
  index: number;
  decision?: DecisionRecord;
  profile: NonNullable<ReturnType<typeof usePathPilotStore.getState>["profile"]>;
  onAccept: () => void;
  onReject: () => void;
  onSnooze: () => void;
  onOpen: () => void;
  onRoadmap: () => void;
}) {
  const [whyOpen, setWhyOpen] = useState(index === 0);
  const actionLabel = decision?.action;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28 }}
      className={cn(
        "render-lazy rounded-xl border border-border bg-card/78 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl",
        decision?.action === "rejected" && "border-destructive/20 opacity-72",
      )}
    >
      <div className="flex items-start gap-4">
        <ProgressRing value={match.compatibility} label="match" size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="demo">#{index + 1}</Badge>
            <Badge variant={match.demandTrend === "growing" ? "success" : "default"}>
              <TrendingUp className="size-3" /> {match.demandTrend}
            </Badge>
            {actionLabel ? <Badge variant={actionLabel === "rejected" ? "demo" : "success"}>{actionLabel}</Badge> : null}
          </div>
          <button type="button" onClick={onOpen} className="mt-3 text-left">
            <h2 className="text-xl font-semibold tracking-[-0.03em] hover:text-[#b9afff]">{match.careerName}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{match.family}</p>
          </button>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-muted-foreground">{match.why}</p>
      <button type="button" onClick={() => setWhyOpen((open) => !open)} className="mt-4 flex min-h-10 w-full items-center justify-between rounded-lg border border-primary/12 bg-primary/6 px-3 text-left text-xs font-medium text-[#c4bbff]">
        <span className="flex items-center gap-2"><BrainCircuit className="size-4" /> Why this?</span>
        {whyOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>
      {whyOpen ? (
        <div className="mt-2 grid gap-2 rounded-lg border border-border bg-background/45 p-3">
          {match.reasoningRefs.map((ref) => (
            <div className="grid grid-cols-[130px_1fr] gap-3 text-xs" key={ref}>
              <span className="text-muted-foreground">{titleForRef(ref)}</span>
              <span>{valueForRef(ref, profile)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-lg border border-border bg-background/35 p-3 text-center">
        <div><p className="text-[10px] text-muted-foreground">Entry</p><p className="mt-1 font-data text-xs">{match.salaryBandEntry}</p></div>
        <div><p className="text-[10px] text-muted-foreground">Mid</p><p className="mt-1 font-data text-xs">{match.salaryBandMid}</p></div>
        <div><p className="text-[10px] text-muted-foreground">Senior</p><p className="mt-1 font-data text-xs">{match.salaryBandSenior}</p></div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
        <Button size="sm" onClick={onRoadmap}>See Roadmap <ArrowRight /></Button>
        <Button size="sm" variant="ghost" onClick={onAccept}><Check /> Accept</Button>
        <Button size="sm" variant="ghost" onClick={onSnooze}><Clock3 /> Snooze</Button>
        <Button size="sm" variant="destructive" onClick={onReject}><ThumbsDown /> Reject</Button>
      </div>
    </motion.article>
  );
}

export function CareerDiscoveryScreen() {
  const router = useRouter();
  const profile = usePathPilotStore((state) => state.profile);
  const discovery = usePathPilotStore((state) => state.careerDiscovery);
  const decisions = usePathPilotStore((state) => state.decisions);
  const setDiscovery = usePathPilotStore((state) => state.setCareerDiscovery);
  const setSelectedCareer = usePathPilotStore((state) => state.setSelectedCareer);
  const recordDecision = usePathPilotStore((state) => state.recordDecision);
  const [detail, setDetail] = useState<CareerMatchResult | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CareerMatchResult | null>(null);

  const generateMutation = useMutation({
    mutationFn: () =>
      requestPathPilot<{ result: CareerDiscoveryResult }>(
        "/api/career-discovery/generate",
        {
          method: "POST",
          body: JSON.stringify({ regenerate: true, profile, decisions }),
        },
      ),
    onSuccess: ({ result }) => setDiscovery(result),
  });

  const decisionMutation = useMutation({
    mutationFn: (decision: DecisionRecord) =>
      requestPathPilot<{ ok: true }>("/api/decisions", {
        method: "POST",
        body: JSON.stringify({ operation: "record", decision }),
      }),
  });

  if (!profile) {
    return <EmptyState title="Complete your profile to get your first matches" description="Career Discovery needs your interests, work-style preferences, priorities, strengths, and growth areas before it can rank anything responsibly." href="/onboarding" action="Complete onboarding" />;
  }

  function decide(
    match: CareerMatchResult,
    action: DecisionRecord["action"],
    reason?: string,
  ) {
    const now = new Date();
    const decision: DecisionRecord = {
      id: crypto.randomUUID(),
      targetType: "career",
      targetId: match.careerKey,
      targetLabel: match.careerName,
      action,
      reason,
      snoozedUntil:
        action === "snoozed"
          ? new Date(now.getTime() + 30 * 86_400_000).toISOString()
          : undefined,
      createdAt: now.toISOString(),
    };
    recordDecision(decision);
    decisionMutation.mutate(decision);
    if (action === "accepted") setSelectedCareer(match.careerKey);
  }

  function openRoadmap(match: CareerMatchResult) {
    setSelectedCareer(match.careerKey);
    router.push("/roadmap");
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Badge><Sparkles className="size-3" /> Career Strategist</Badge>{discovery ? <Badge variant={discovery.mode === "ai" ? "success" : "demo"}>{discovery.mode === "ai" ? "AI-ranked" : "Deterministic fallback"}</Badge> : null}</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your strongest career matches</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Filtered from an India-relevant 180-career taxonomy, then ranked against the profile signals shown on every card.</p>
        </div>
        <Button variant="secondary" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}><RefreshCw className={generateMutation.isPending ? "animate-spin" : ""} /> Refresh matches</Button>
      </div>

      <div className="mt-5 rounded-lg border border-warning/18 bg-warning/6 p-3 text-xs leading-5 text-[#ead58f]">Salary bands and demand trends are illustrative static demo data, not live labour-market figures or guarantees.</div>
      {decisionMutation.isError ? <div className="mt-4"><ErrorBanner message="Your choice is saved on this device, but could not sync to the server yet." onRetry={() => { const latest = decisions[0]; if (latest) decisionMutation.mutate(latest); }} /></div> : null}
      {generateMutation.isError ? <div className="mt-5"><ErrorBanner message={generateMutation.error.message} onRetry={() => generateMutation.mutate()} /></div> : null}

      <div className="mt-7">
        {generateMutation.isPending ? (
          <div><p className="mb-4 text-xs text-[#b8adff]" role="status">Reading your profile… ranking matches…</p><LoadingSkeleton /></div>
        ) : discovery ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {discovery.matches.map((match, index) => (
              <CareerCard
                key={match.careerKey}
                match={match}
                index={index}
                profile={profile}
                decision={decisions.find((decision) => decision.targetType === "career" && decision.targetId === match.careerKey)}
                onAccept={() => decide(match, "accepted")}
                onReject={() => setRejectTarget(match)}
                onSnooze={() => decide(match, "snoozed")}
                onOpen={() => setDetail(match)}
                onRoadmap={() => openRoadmap(match)}
              />
            ))}
          </div>
        ) : (
          <Card className="grid min-h-[380px] place-items-center p-6 text-center">
            <div className="max-w-md"><BookmarkCheck className="mx-auto size-9 text-[#a998ff]" /><h2 className="mt-5 text-xl font-semibold">Your profile is ready</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Generate your first five explained matches.</p><Button className="mt-6" onClick={() => generateMutation.mutate()}><Sparkles /> Generate matches</Button></div>
          </Card>
        )}
      </div>

      <Modal open={Boolean(rejectTarget)} onOpenChange={(open) => { if (!open) setRejectTarget(null); }} title={`Why isn't ${rejectTarget?.careerName ?? "this career"} a fit?`} description="Choose one reason. PathPilot will use it in future rankings, and you can undo it in Decision History.">
        <div className="grid gap-2">
          {rejectReasons.map((reason) => <Button variant="secondary" key={reason} className="justify-start" onClick={() => { if (rejectTarget) decide(rejectTarget, "rejected", reason); setRejectTarget(null); }}>{reason}</Button>)}
        </div>
      </Modal>

      <Modal open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null); }} title={detail?.careerName ?? "Career detail"} description={detail?.family} className="max-w-2xl">
        {detail ? (
          <div>
            <div className="flex items-start gap-5"><ProgressRing value={detail.compatibility} label="match" size="md" /><div><Badge variant={detail.demandTrend === "growing" ? "success" : "default"}>{detail.demandTrend} demand</Badge><p className="mt-4 text-sm leading-6 text-muted-foreground">{detail.description}</p></div></div>
            <div className="mt-6"><h3 className="text-sm font-semibold">Starter skills</h3><div className="mt-3 flex flex-wrap gap-2">{detail.starterSkills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div></div>
            <div className="mt-6 rounded-lg border border-primary/15 bg-primary/7 p-4"><p className="text-xs font-semibold text-[#c4bbff]">Why it ranked</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{detail.why}</p></div>
            <div className="mt-7 flex flex-wrap justify-end gap-3"><Button variant="secondary" onClick={() => decide(detail, "accepted")}><Check /> Accept path</Button><Button onClick={() => openRoadmap(detail)}>See full roadmap <ArrowRight /></Button></div>
          </div>
        ) : null}
      </Modal>
      </div>
    </MotionConfig>
  );
}
