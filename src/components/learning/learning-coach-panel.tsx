"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  Filter,
  Play,
  Sparkles,
} from "lucide-react";

import { ErrorBanner, LoadingSkeleton } from "@/components/shared/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import type {
  LearningResourceResult,
  OnboardingProfile,
} from "@/features/pathpilot/schemas";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

type ResourceFilter = "all" | LearningResourceResult["type"] | "free";

export function LearningCoachPanel({
  milestone,
  skillTag,
  learningStyle,
  compact = false,
}: {
  milestone: string;
  skillTag: string;
  learningStyle: OnboardingProfile["learningStyle"];
  compact?: boolean;
}) {
  const [filter, setFilter] = useState<ResourceFilter>("all");
  const resourceProgress = usePathPilotStore((state) => state.resourceProgress);
  const setResourceProgress = usePathPilotStore((state) => state.setResourceProgress);
  const query = useQuery({
    queryKey: ["learning-resources", milestone, skillTag, learningStyle],
    queryFn: () => {
      const params = new URLSearchParams({ milestone, skillTag, learningStyle });
      return requestPathPilot<{
        resources: LearningResourceResult[];
        mode: "ai" | "deterministic-fallback";
      }>(`/api/learning/resources?${params}`);
    },
  });

  const filtered = useMemo(() => {
    const resources = query.data?.resources ?? [];
    if (filter === "all") return resources;
    if (filter === "free") return resources.filter((resource) => resource.free);
    return resources.filter((resource) => resource.type === filter);
  }, [filter, query.data]);

  if (query.isLoading) return <LoadingSkeleton variant="list" />;
  if (query.isError) return <ErrorBanner message={query.error.message} onRetry={() => query.refetch()} />;

  const filters: ResourceFilter[] = ["all", "course", "docs", "practice", "video", "free"];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2"><Badge><Sparkles className="size-3" /> Learning Coach</Badge><Badge variant={query.data?.mode === "ai" ? "success" : "demo"}>{query.data?.mode === "ai" ? "AI re-ranked" : "Retrieval fallback"}</Badge></div>
        <p className="text-xs text-muted-foreground">{skillTag}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter learning resources">
        <Filter className="size-3.5 text-muted-foreground" />
        {filters.map((item) => <button type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={cn("min-h-8 rounded-full border px-2.5 text-[11px] capitalize", filter === item ? "border-primary/40 bg-primary/12 text-foreground" : "border-border text-muted-foreground")} key={item}>{item}</button>)}
      </div>

      <div className={cn("mt-5 grid gap-3", !compact && "lg:grid-cols-2")}>
        {filtered.map((resource) => {
          const progress = resourceProgress[resource.id];
          return (
            <Card className="p-4" key={resource.id}>
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background/55 text-[#a99cff]"><BookOpen className="size-4" /></div>
                <div className="min-w-0 flex-1"><div className="flex flex-wrap gap-1.5"><Badge>{resource.type}</Badge><Badge variant={resource.free ? "success" : "demo"}>{resource.free ? "Free" : "Paid"}</Badge></div><h3 className="mt-2 text-sm font-semibold leading-5">{resource.title}</h3><p className="mt-1 text-[11px] text-muted-foreground">{resource.provider}</p></div>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">{resource.whyRelevant}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="size-3" /> {Math.max(1, Math.round(resource.estMinutes / 60))}h estimated</span><span className="font-data text-[#b5aaff]">{resource.relevance}% relevant</span></div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                <Button asChild size="sm" variant="secondary"><a href={resource.url} target="_blank" rel="noreferrer">Open <ArrowUpRight /></a></Button>
                {progress === "done" ? <Button size="sm" variant="ghost" onClick={() => setResourceProgress(resource.id, "started")}><Check /> Done</Button> : <Button size="sm" variant="ghost" onClick={() => setResourceProgress(resource.id, progress === "started" ? "done" : "started")}>{progress === "started" ? <><Check /> Mark done</> : <><Play /> Start</>}</Button>}
              </div>
            </Card>
          );
        })}
      </div>
      {!filtered.length ? <p className="mt-5 rounded-lg border border-border p-5 text-center text-sm text-muted-foreground">No resources match this filter. Try All or Free.</p> : null}
    </div>
  );
}
