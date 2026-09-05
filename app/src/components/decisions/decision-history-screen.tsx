"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  History,
  RotateCcw,
  SlidersHorizontal,
  ThumbsDown,
} from "lucide-react";

import { EmptyState, ErrorBanner } from "@/components/shared/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import type { DecisionRecord } from "@/features/pathpilot/schemas";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

type Filter = "all" | DecisionRecord["action"];

const actionMeta = {
  accepted: { icon: CheckCircle2, label: "Accepted", className: "text-success" },
  rejected: { icon: ThumbsDown, label: "Rejected", className: "text-destructive" },
  snoozed: { icon: Clock3, label: "Snoozed", className: "text-warning" },
} as const;

export function DecisionHistoryScreen() {
  const decisions = usePathPilotStore((state) => state.decisions);
  const hydrateDecisions = usePathPilotStore((state) => state.hydrateDecisions);
  const undoDecision = usePathPilotStore((state) => state.undoDecision);
  const [filter, setFilter] = useState<Filter>("all");
  const historyQuery = useQuery({
    queryKey: ["decisions"],
    queryFn: () => requestPathPilot<{ history: DecisionRecord[] }>("/api/decisions"),
  });
  const undoMutation = useMutation({
    mutationFn: (decisionId: string) =>
      requestPathPilot<{ ok: true }>("/api/decisions", {
        method: "POST",
        body: JSON.stringify({ operation: "undo", decisionId }),
      }),
  });

  useEffect(() => {
    if (historyQuery.data?.history.length) {
      hydrateDecisions(historyQuery.data.history);
    }
  }, [historyQuery.data, hydrateDecisions]);

  if (!decisions.length && !historyQuery.isLoading) {
    return <EmptyState title="Nothing rejected yet" description="Recommendations you accept, reject, or snooze will show up here. You will always be able to review and undo them." href="/career-discovery" action="Explore careers" />;
  }

  const filtered = filter === "all" ? decisions : decisions.filter((decision) => decision.action === filter);

  function undo(decisionId: string) {
    undoDecision(decisionId);
    undoMutation.mutate(decisionId);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><Badge><History className="size-3" /> Decision Memory</Badge><h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Your decision history</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">PathPilot uses this visible history in future rankings. Nothing is silently permanent.</p></div>
        <Badge variant="demo">{decisions.length} remembered</Badge>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-2" role="group" aria-label="Filter decisions">
        <SlidersHorizontal className="mr-1 size-4 text-muted-foreground" />
        {(["all", "accepted", "rejected", "snoozed"] as Filter[]).map((item) => (
          <button type="button" aria-pressed={filter === item} className={cn("min-h-9 rounded-full border px-3 text-xs capitalize", filter === item ? "border-primary/40 bg-primary/12 text-foreground" : "border-border text-muted-foreground")} key={item} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>

      {historyQuery.isError || undoMutation.isError ? <div className="mt-5"><ErrorBanner message="Your local history is safe, but the server sync needs another try." onRetry={() => historyQuery.refetch()} /></div> : null}

      <div className="mt-5 grid gap-3">
        {filtered.map((decision) => {
          const meta = actionMeta[decision.action];
          const Icon = meta.icon;
          return (
            <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center" key={decision.id}>
              <div className={cn("grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-background/50", meta.className)}><Icon className="size-5" /></div>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{decision.targetLabel}</h2><Badge>{decision.targetType}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{meta.label}{decision.reason ? ` · ${decision.reason}` : ""} · {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(decision.createdAt))}</p>{decision.snoozedUntil ? <p className="mt-1 text-xs text-warning">Snoozed until {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(decision.snoozedUntil))}</p> : null}</div>
              <Button variant="ghost" size="sm" onClick={() => undo(decision.id)}><RotateCcw /> Undo</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
