"use client";

import { useDeferredValue, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  CalendarClock,
  ChevronDown,
  Code2,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  MapPin,
  Radar,
  Search,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { ErrorBanner, LoadingSkeleton } from "@/components/shared/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import {
  defaultOnboardingProfile,
  type OpportunityCategory,
  type RadarOpportunity,
  type RadarResult,
} from "@/features/pathpilot/schemas";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const categories = [
  ["all", "All"],
  ["internship", "Internships"],
  ["hackathon", "Hackathons"],
  ["scholarship", "Scholarships"],
  ["competition", "Competitions"],
  ["open-source", "Open source"],
  ["event", "Events"],
] as const;

const categoryIcons = {
  internship: BriefcaseBusiness,
  hackathon: Lightbulb,
  scholarship: GraduationCap,
  competition: Trophy,
  "open-source": Code2,
  event: Users,
} as const;

function OpportunityCard({
  item,
  index,
  expanded,
  onExpand,
}: {
  item: RadarOpportunity;
  index: number;
  expanded: boolean;
  onExpand: () => void;
}) {
  const Icon = categoryIcons[item.category];
  const action = usePathPilotStore((state) => state.opportunityActions[item.id]);
  const setAction = usePathPilotStore((state) => state.setOpportunityAction);
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "[contain-intrinsic-size:0_420px] [content-visibility:auto]",
        action === "dismissed" && "hidden",
      )}
    >
      <Card className="h-full overflow-hidden transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/20">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/[0.08] text-[#a998ff]"><Icon className="size-5" aria-hidden="true" /></span>
            <div className="flex flex-wrap justify-end gap-2"><Badge variant={item.isDemo ? "demo" : "success"}>{item.isDemo ? "Demo pattern" : "Official source"}</Badge><Badge variant="success">{item.relevance}% fit</Badge></div>
          </div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{item.organizerLabel}</p>
          <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em]">{item.title}</h2>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{item.description}</p>
          <div className="mt-5 grid gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-start gap-2"><CalendarClock className="mt-0.5 size-3.5 shrink-0 text-[#aaa0ef]" /> {item.typicalTiming}</span>
            <span className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0 text-[#aaa0ef]" /> {item.location} · {item.format}</span>
            {item.stipendInr !== null && item.stipendInr !== undefined ? <span><strong className="text-foreground">₹{item.stipendInr.toLocaleString("en-IN")}</strong> stipend {item.duration ? `· ${item.duration}` : ""}</span> : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-1.5">{item.tags.slice(0, 4).map((tag) => <Badge variant="outline" key={tag}>{tag}</Badge>)}</div>
          <button type="button" onClick={onExpand} aria-expanded={expanded} className="mt-5 flex min-h-11 w-full items-center justify-between rounded-lg border border-border bg-black/10 px-3 text-left text-xs text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"><span className="inline-flex items-center gap-2"><Sparkles className="size-3.5 text-[#a998ff]" /> Why this?</span><ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} /></button>
          <AnimatePresence initial={false}>{expanded ? <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden"><div className="mt-3 rounded-lg border border-primary/15 bg-primary/[0.06] p-4"><p className="text-xs leading-5 text-[#c7c0f7]">{item.whyRelevant}</p><p className="mt-2 font-data text-[9px] text-muted-foreground">Signals: {item.reasoningRefs.join(" · ")}</p></div></motion.div> : null}</AnimatePresence>
        </div>
        <div className="grid grid-cols-3 border-t border-border bg-black/10">
          <button type="button" onClick={() => setAction(item.id, action === "saved" ? null : "saved")} className={cn("flex min-h-12 items-center justify-center gap-2 border-r border-border text-xs text-muted-foreground hover:text-foreground", action === "saved" && "text-success")} aria-label={action === "saved" ? `Remove ${item.title} from saved opportunities` : `Save ${item.title}`}>
            {action === "saved" ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />} {action === "saved" ? "Saved" : "Save"}
          </button>
          {item.applicationUrl || item.sourceUrl ? <a href={item.applicationUrl ?? item.sourceUrl ?? "#"} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 border-r border-border text-xs text-muted-foreground hover:text-foreground"><ExternalLink className="size-4" /> Apply / view</a> : <button type="button" onClick={() => setAction(item.id, action === "joined" ? null : "joined")} className={cn("flex min-h-12 items-center justify-center gap-2 border-r border-border text-xs text-muted-foreground hover:text-foreground", action === "joined" && "text-[#a998ff]")}><ExternalLink className="size-4" /> {action === "joined" ? "Tracking" : "Track"}</button>}
          <button type="button" onClick={() => setAction(item.id, "dismissed")} className="flex min-h-12 items-center justify-center gap-2 text-xs text-muted-foreground hover:text-destructive" aria-label={`Dismiss ${item.title}`}><X className="size-4" /> Dismiss</button>
        </div>
      </Card>
    </motion.article>
  );
}

export function OpportunityRadarScreen() {
  const profileState = usePathPilotStore((state) => state.profile);
  const discovery = usePathPilotStore((state) => state.careerDiscovery);
  const selectedCareerKey = usePathPilotStore((state) => state.selectedCareerKey);
  const opportunityActions = usePathPilotStore((state) => state.opportunityActions);
  const restoreDismissedOpportunities = usePathPilotStore((state) => state.restoreDismissedOpportunities);
  const profile = profileState ?? defaultOnboardingProfile;
  const career = discovery?.matches.find((item) => item.careerKey === selectedCareerKey) ?? discovery?.matches[0];
  const [category, setCategory] = useState<OpportunityCategory | "all">("all");
  const [minimumStipend, setMinimumStipend] = useState(0);
  const [workMode, setWorkMode] = useState<"any" | RadarOpportunity["format"]>("any");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const params = new URLSearchParams({
    career: career?.careerName ?? "",
    interests: profile.interests.join(","),
    skills: career?.starterSkills.join(",") ?? "",
  });
  const radarQuery = useQuery({
    queryKey: ["opportunity-radar", career?.careerKey, profile.interests.join("|")],
    queryFn: () => requestPathPilot<{ result: RadarResult }>(`/api/radar?${params.toString()}`),
    staleTime: 1000 * 60 * 10,
  });
  const opportunities = (radarQuery.data?.result.opportunities ?? []).filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (opportunityActions[item.id] === "dismissed") return false;
    if (minimumStipend > 0 && (item.stipendInr ?? 0) < minimumStipend) return false;
    if (workMode !== "any" && item.format !== workMode) return false;
    if (!deferredSearch) return true;
    return `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(deferredSearch);
  });
  const savedCount = Object.values(opportunityActions).filter((action) => action === "saved").length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-7xl">
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 grid-fade opacity-35" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="flex flex-wrap items-center gap-2"><Badge><Radar className="size-3" /> Opportunity Radar</Badge>{radarQuery.data?.result.mode === "official-live" ? <Badge variant="success">Verified live sources</Badge> : <Badge variant="demo">Planning patterns</Badge>}</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Find the next place to prove your potential.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Hackathon, scholarship, competition, open-source, and event patterns ranked against your profile. No fabricated deadlines.</p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground"><span><strong className="font-data text-foreground">{radarQuery.data?.result.opportunities.length ?? 0}</strong> ranked patterns</span><span><strong className="font-data text-foreground">{savedCount}</strong> saved</span><span>Target: <strong className="text-foreground">{career?.careerName ?? "your top career"}</strong></span></div>
          </div>
          <div className="relative mx-auto grid size-52 place-items-center">
            {["inset-0", "inset-7", "inset-14"].map((position, index) => <motion.span key={position} className={cn("absolute rounded-full border border-primary/20", position)} animate={reducedMotion ? undefined : { rotate: index % 2 ? -360 : 360 }} transition={{ duration: 16 + index * 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }} />)}
            <span className="absolute inset-1/2 h-px w-1/2 origin-left bg-gradient-to-r from-primary/70 to-transparent" />
            <span className="grid size-16 place-items-center rounded-full border border-primary/25 bg-primary/12 text-[#a998ff] shadow-[0_0_60px_rgba(124,92,252,0.22)]"><Radar className="size-7" /></span>
            <motion.span className="absolute right-8 top-12 size-2 rounded-full bg-success shadow-[0_0_14px_#34d399]" animate={reducedMotion ? undefined : { scale: [1, 1.8, 1], opacity: [1, 0.55, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }} />
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Opportunity category filters">
          {categories.map(([value, label]) => <Button key={value} size="sm" variant={category === value ? "default" : "secondary"} onClick={() => setCategory(value)} aria-pressed={category === value}>{label}</Button>)}
        </div>
        <div className="grid w-full gap-2 sm:grid-cols-[150px_150px_1fr] xl:max-w-2xl">
          <Select value={minimumStipend} onChange={(event) => setMinimumStipend(Number(event.target.value))} aria-label="Minimum monthly stipend">
            <option value={0}>Any stipend</option><option value={10000}>₹10,000+</option><option value={20000}>₹20,000+</option><option value={30000}>₹30,000+</option>
          </Select>
          <Select value={workMode} onChange={(event) => setWorkMode(event.target.value as typeof workMode)} aria-label="Internship mode">
            <option value="any">Any mode</option><option value="online">Online</option><option value="hybrid">Hybrid</option><option value="in-person">Offline</option>
          </Select>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" placeholder="Search skills or opportunity types" aria-label="Search opportunity patterns" /></div>
        </div>
      </div>

      <div className="mt-4 flex gap-3 rounded-lg border border-primary/20 bg-primary/[0.06] p-4 text-xs leading-5 text-muted-foreground"><CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" /><p>{radarQuery.data?.result.disclaimer ?? "Loading verified opportunities and source links."}</p></div>

      {radarQuery.isPending ? <div className="mt-6"><LoadingSkeleton variant="cards" /></div> : null}
      {radarQuery.isError ? <div className="mt-6"><ErrorBanner message={radarQuery.error.message} onRetry={() => radarQuery.refetch()} /></div> : null}
      {radarQuery.isSuccess && opportunities.length === 0 ? <Card className="mt-6 grid min-h-64 place-items-center p-6 text-center"><div><Search className="mx-auto size-6 text-muted-foreground" aria-hidden="true" /><h2 className="mt-4 text-lg font-semibold">No visible patterns match these filters</h2><p className="mt-2 text-xs text-muted-foreground">Search, category choices, and dismissed cards can all narrow this view.</p><Button className="mt-5" variant="secondary" onClick={() => { setSearch(""); setCategory("all"); restoreDismissedOpportunities(); }}>Show all patterns</Button></div></Card> : null}
      {opportunities.length ? <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{opportunities.map((item, index) => <OpportunityCard key={item.id} item={item} index={index} expanded={expandedId === item.id} onExpand={() => setExpandedId((value) => value === item.id ? null : item.id)} />)}</div> : null}
      </div>
    </MotionConfig>
  );
}
