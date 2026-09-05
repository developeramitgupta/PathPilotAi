"use client";

import {
  ArrowRight,
  Building2,
  ClipboardPlus,
  GraduationCap,
  Handshake,
  MapPin,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/dialog";
import { workspaceRoleConfig, type WorkspaceRole } from "@/features/roles/config";
import { cn } from "@/lib/utils";

type Candidate = {
  name: string;
  programme: string;
  location: string;
  readiness: number;
  proof: string;
};

const candidates: Candidate[] = [
  { name: "Aanya Sharma", programme: "B.Tech · Computer Science", location: "Bengaluru", readiness: 92, proof: "Python · SQL · 2 verified projects" },
  { name: "Kabir Mehta", programme: "B.Des · Interaction Design", location: "Pune", readiness: 87, proof: "Research · Figma · portfolio review" },
  { name: "Nisha Iyer", programme: "B.Sc · Data Science", location: "Chennai", readiness: 83, proof: "Statistics · Python · capstone" },
];

const tabs = {
  institution: ["Overview", "Students", "Opportunities", "Partners"],
  industry: ["Overview", "Candidates", "Opportunities", "Pipeline"],
} as const;

function ReadinessRing({ value }: { value: number }) {
  return (
    <span className="grid size-12 place-items-center rounded-full border-[5px] border-[#d7e9ff] text-xs font-bold text-[#1264c4]" aria-label={`${value}% readiness`}>
      {value}
    </span>
  );
}

export function RoleWorkspace({
  role,
  displayName,
  workspaceName,
}: {
  role: Exclude<WorkspaceRole, "student">;
  displayName?: string;
  workspaceName?: string;
}) {
  const config = workspaceRoleConfig[role];
  const Icon = config.icon;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[typeof role][number]>("Overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [items, setItems] = useState<string[]>(role === "institution" ? ["Data & AI readiness cohort", "First-year exploration cohort"] : ["Data Analyst Internship", "Design Research Sprint"]);
  const [candidateFilter, setCandidateFilter] = useState<"all" | "ready" | "nearby">("all");
  const workspaceLabel = workspaceName || (role === "institution" ? "Your institution" : "Your company");
  const actionTitle = role === "institution" ? "Create a student cohort" : "Post an opportunity";
  const actionDescription = role === "institution" ? "Group learners around a shared outcome and make support visible." : "Describe the real work so candidates can assess their fit before applying.";
  const filteredCandidates = useMemo(() => candidates.filter((candidate) => candidateFilter === "all" || candidateFilter === "ready" ? candidateFilter !== "ready" || candidate.readiness >= 87 : candidate.location === "Bengaluru"), [candidateFilter]);

  function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = newItem.trim();
    if (!value) return;
    setItems((current) => [value, ...current]);
    setNewItem("");
    setCreateOpen(false);
    setActiveTab(role === "institution" ? "Students" : "Opportunities");
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#10284a]">
      <header className="border-b border-[#e1e8f0] bg-white/90 px-4 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Logo className="text-[#10284a]" href="/" />
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block"><p className="text-sm font-semibold">{workspaceLabel}</p><p className="text-xs text-[#62748b]">{displayName || "Workspace lead"}</p></div>
            <span className="grid size-10 place-items-center rounded-full bg-[#eaf3ff] text-[#1264c4]"><Icon className="size-5" aria-hidden="true" /></span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-col justify-between gap-6 border-b border-[#dbe3ed] pb-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-[#1264c4]">{role === "institution" ? "Institution workspace" : "Industry workspace"}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
              {role === "institution" ? "Turn student potential into a coordinated plan." : "Build your early-talent pipeline on proof."}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#526174] sm:text-lg">
              {role === "institution" ? "Connect readiness signals, student support, and industry opportunities in one shared view." : "Review skills, work samples, and readiness signals before your first conversation."}
            </p>
          </div>
          <Button className="bg-[#1264c4] hover:bg-[#0d55aa]" size="lg" onClick={() => setCreateOpen(true)}><Plus aria-hidden="true" />{actionTitle}</Button>
        </div>

        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-[#dbe3ed]" aria-label={`${config.label} workspace sections`}>
          {tabs[role].map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={cn("min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors", activeTab === tab ? "border-[#1264c4] text-[#1264c4]" : "border-transparent text-[#62748b] hover:text-[#10284a]")} aria-current={activeTab === tab ? "page" : undefined}>{tab}</button>)}
        </nav>

        {activeTab === "Overview" ? (
          <section className="grid gap-6 py-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="border-b border-[#dbe3ed] pb-8 lg:border-b-0 lg:border-r lg:pr-8">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-[#1264c4]">Today&apos;s next action</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{role === "institution" ? "Review students who need a next step" : "Review evidence-backed candidates"}</h2></div><span className="grid size-11 place-items-center rounded-xl bg-[#eaf3ff] text-[#1264c4]">{role === "institution" ? <GraduationCap className="size-5" /> : <Search className="size-5" />}</span></div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#526174]">{role === "institution" ? "12 students have completed their latest reflection. Two are ready for a project brief, and three need a mentoring check-in." : "Three candidates match the skills and evidence signals for your active opportunity. Start with the strongest work samples."}</p>
              <div className="mt-6 flex flex-wrap gap-3"><Button variant="outline" onClick={() => setActiveTab(role === "institution" ? "Students" : "Candidates")}>Open the list <ArrowRight /></Button><Button variant="ghost" onClick={() => setActiveTab("Opportunities")}>See active opportunities</Button></div>
            </div>
            <div className="grid content-start gap-4">
              {role === "institution" ? [
                ["184", "students in active cohorts"],
                ["61%", "have a clear next action"],
                ["8", "industry-linked briefs open"],
              ] : [
                ["24", "evidence-backed candidates"],
                ["8", "active opportunities"],
                ["76%", "average candidate readiness"],
              ].map(([value, label]) => <div className="flex items-baseline justify-between border-b border-[#e8edf3] py-3" key={label}><strong className="text-2xl tracking-[-0.04em]">{value}</strong><span className="text-sm text-[#62748b]">{label}</span></div>)}
            </div>
          </section>
        ) : null}

        {activeTab === "Students" && role === "institution" ? <section className="py-8"><div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-[-0.04em]">Cohorts that need attention</h2><p className="mt-2 text-sm text-[#62748b]">Use readiness and evidence to decide the support each group needs next.</p></div><Button variant="outline" onClick={() => setCreateOpen(true)}><Plus /> New cohort</Button></div><div className="mt-7 grid gap-3 md:grid-cols-2">{items.map((item, index) => <article className="border border-[#dbe3ed] bg-white p-5" key={item}><div className="flex items-start justify-between"><span className="grid size-9 place-items-center rounded-lg bg-[#eaf3ff] text-[#1264c4]"><UsersRound className="size-4" /></span><span className="text-sm font-semibold text-[#1264c4]">{18 + index * 7} learners</span></div><h3 className="mt-6 font-semibold">{item}</h3><p className="mt-2 text-sm text-[#62748b]">{index + 2} learners need a check-in this week.</p><Button className="mt-5 -ml-3" variant="ghost" size="sm">Review readiness <ArrowRight /></Button></article>)}</div></section> : null}

        {activeTab === "Candidates" && role === "industry" ? <section className="py-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-2xl font-semibold tracking-[-0.04em]">Candidates with visible evidence</h2><p className="mt-2 text-sm text-[#62748b]">The strongest evidence comes first—then you decide who to meet.</p></div><div className="flex gap-2">{(["all", "ready", "nearby"] as const).map((filter) => <Button key={filter} variant={candidateFilter === filter ? "default" : "outline"} size="sm" onClick={() => setCandidateFilter(filter)}>{filter === "all" ? "All" : filter === "ready" ? "Readiness 87+" : "Near Bengaluru"}</Button>)}</div></div><div className="mt-7 divide-y divide-[#dbe3ed] border-y border-[#dbe3ed]">{filteredCandidates.map((candidate) => <article className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center" key={candidate.name}><ReadinessRing value={candidate.readiness} /><div className="min-w-0 flex-1"><h3 className="font-semibold">{candidate.name}</h3><p className="mt-1 text-sm text-[#62748b]">{candidate.programme} · {candidate.location}</p><p className="mt-2 text-sm text-[#385c82]">{candidate.proof}</p></div><Button variant="outline">Review profile <ArrowRight /></Button></article>)}</div></section> : null}

        {(activeTab === "Opportunities" || activeTab === "Partners" || activeTab === "Pipeline") ? <section className="py-8"><div className="flex items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold tracking-[-0.04em]">{activeTab === "Partners" ? "Industry partners" : activeTab === "Pipeline" ? "Hiring pipeline" : "Active opportunities"}</h2><p className="mt-2 text-sm text-[#62748b]">{activeTab === "Partners" ? "Relationships that turn learning into real work." : "Work that is ready for the right people to see."}</p></div><Button variant="outline" onClick={() => setCreateOpen(true)}><Plus />{activeTab === "Partners" ? "Add partner" : actionTitle}</Button></div><div className="mt-7 grid gap-3 md:grid-cols-2">{items.map((item, index) => <article className="border border-[#dbe3ed] bg-white p-5" key={item}><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-lg bg-[#eaf3ff] text-[#1264c4]">{activeTab === "Partners" ? <Handshake className="size-4" /> : <ClipboardPlus className="size-4" />}</span><span className="text-xs font-semibold text-[#39a27e]">Active</span></div><h3 className="mt-6 font-semibold">{item}</h3><p className="mt-2 flex items-center gap-1.5 text-sm text-[#62748b]"><MapPin className="size-3.5" />{index % 2 ? "Remote / India" : "Bengaluru, India"}</p><Button className="mt-5 -ml-3" variant="ghost" size="sm">Open details <ArrowRight /></Button></article>)}</div></section> : null}
      </div>

      <Modal open={createOpen} onOpenChange={setCreateOpen} title={actionTitle} description={actionDescription} titleIcon={role === "institution" ? <Building2 className="size-5 text-[#1264c4]" /> : <ClipboardPlus className="size-5 text-[#1264c4]" />}>
        <form className="grid gap-5" onSubmit={createItem}><label className="grid gap-2 text-sm font-medium">{role === "institution" ? "Cohort name" : "Opportunity title"}<Input autoFocus value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder={role === "institution" ? "e.g. Product thinking cohort" : "e.g. Frontend engineering internship"} /></label><Button className="bg-[#1264c4] hover:bg-[#0d55aa]" type="submit">Create and continue <ArrowRight /></Button></form>
      </Modal>
    </main>
  );
}
