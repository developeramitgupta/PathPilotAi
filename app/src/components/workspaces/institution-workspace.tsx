"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, BookOpenCheck, BriefcaseBusiness, CheckCircle2, ChevronRight, ClipboardCheck, Handshake, Lightbulb, LogOut, MapPin, Plus, Search, Send, Settings, UsersRound } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { Logo } from "@/components/shared/logo";
import { Drawer, Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readinessCopy, seedInstitutionCohorts, seedInstitutionOpportunities, seedPartners, seedStudents, type Cohort, type Partner, type WorkspaceOpportunity, type WorkspaceStudent } from "@/features/workspaces/workspace-data";
import { serviceAvailability } from "@/lib/env";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const ClerkLogoutButton = dynamic(
  () => import("@/components/auth/clerk-logout-button").then((module) => module.ClerkLogoutButton),
  { ssr: false },
);

const tabs = ["Home", "Learners", "Cohorts", "Opportunities", "Partners", "Insights", "Settings"] as const;
type Tab = (typeof tabs)[number];
type DialogMode = "cohort" | "partner" | null;
type InstitutionSettings = { name: string; contact: string; emailUpdates: boolean };
type InstitutionSnapshot = {
  settings: InstitutionSettings;
  cohorts: Cohort[];
  partners: Partner[];
  nominations: Record<string, string[]>;
  supportNotes: Record<string, string>;
  partnerNotes: Record<string, string>;
  sharedOpportunities: Record<string, string[]>;
};

const storageKey = "pathpilot.institution.workspace.v2";

function Indicator({ value, label, note }: { value: string; label: string; note: string }) {
  return <article className="border border-slate-200 bg-white p-5"><strong className="block text-3xl font-semibold tracking-[-0.055em] text-slate-950">{value}</strong><p className="mt-2 text-sm font-semibold text-slate-700">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{note}</p></article>;
}

function Progress({ value, label }: { value: number; label: string }) {
  return <div><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="text-slate-600">{label}</span><strong className="text-slate-900">{value}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-[width]" style={{ width: `${value}%` }} /></div></div>;
}

function Pill({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "amber" | "rose" | "slate" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-800", rose: "bg-rose-50 text-rose-700", slate: "bg-slate-100 text-slate-700" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}

function readinessTone(student: WorkspaceStudent) {
  return student.band === "ready" ? "green" : student.band === "building" ? "amber" : "rose";
}

function opportunityMatches(student: WorkspaceStudent, opportunity: WorkspaceOpportunity) {
  const evidence = student.evidence.join(" ").toLowerCase();
  return opportunity.skills.filter((skill) => evidence.includes(skill.toLowerCase())).length;
}

function studentInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function InstitutionWorkspace({ displayName, workspaceName }: { displayName?: string; workspaceName?: string }) {
  const router = useRouter();
  const clearLocalSession = usePathPilotStore((state) => state.clearLocalSession);
  const defaultSettings: InstitutionSettings = { name: workspaceName || "Your institution", contact: displayName || "Placement lead", emailUpdates: true };
  const [tab, setTab] = useState<Tab>("Home");
  const [students] = useState<WorkspaceStudent[]>(seedStudents);
  const [settings, setSettings] = useState<InstitutionSettings>(defaultSettings);
  const [cohorts, setCohorts] = useState<Cohort[]>(seedInstitutionCohorts);
  const [partners, setPartners] = useState<Partner[]>(seedPartners);
  const [nominations, setNominations] = useState<Record<string, string[]>>({});
  const [supportNotes, setSupportNotes] = useState<Record<string, string>>({});
  const [partnerNotes, setPartnerNotes] = useState<Record<string, string>>({});
  const [sharedOpportunities, setSharedOpportunities] = useState<Record<string, string[]>>({});
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [readinessFilter, setReadinessFilter] = useState<"all" | WorkspaceStudent["band"]>("all");
  const [cohortFilter, setCohortFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<WorkspaceStudent | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<WorkspaceOpportunity | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const snapshot = JSON.parse(stored) as Partial<InstitutionSnapshot>;
        if (snapshot.settings) setSettings(snapshot.settings);
        if (snapshot.cohorts) setCohorts(snapshot.cohorts);
        if (snapshot.partners) setPartners(snapshot.partners);
        if (snapshot.nominations) setNominations(snapshot.nominations);
        if (snapshot.supportNotes) setSupportNotes(snapshot.supportNotes);
        if (snapshot.partnerNotes) setPartnerNotes(snapshot.partnerNotes);
        if (snapshot.sharedOpportunities) setSharedOpportunities(snapshot.sharedOpportunities);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const snapshot: InstitutionSnapshot = { settings, cohorts, partners, nominations, supportNotes, partnerNotes, sharedOpportunities };
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
  }, [cohorts, nominations, partnerNotes, partners, ready, settings, sharedOpportunities, supportNotes]);

  const filteredStudents = useMemo(() => students.filter((student) => {
    const matchesSearch = `${student.name} ${student.programme} ${student.cohort} ${student.evidence.join(" ")}`.toLowerCase().includes(search.toLowerCase());
    const matchesReadiness = readinessFilter === "all" || student.band === readinessFilter;
    const matchesCohort = cohortFilter === "all" || student.cohort === cohortFilter;
    return matchesSearch && matchesReadiness && matchesCohort;
  }), [cohortFilter, readinessFilter, search, students]);

  const averageReadiness = Math.round(students.reduce((sum, student) => sum + student.readiness, 0) / students.length);
  const needsSupport = students.filter((student) => student.band === "needs-support").length;
  const readyStudents = students.filter((student) => student.band === "ready").length;
  const nominationCount = Object.values(nominations).flat().length;
  const skillSignals = useMemo(() => {
    const skills = seedInstitutionOpportunities.flatMap((opportunity) => opportunity.skills);
    return [...new Set(skills)].map((skill) => ({ skill, covered: students.filter((student) => student.evidence.join(" ").toLowerCase().includes(skill.toLowerCase())).length })).sort((a, b) => a.covered - b.covered);
  }, [students]);

  function openLearnersForCohort(cohortName: string) { setCohortFilter(cohortName); setReadinessFilter("all"); setSearch(""); setTab("Learners"); }
  function nominate(student: WorkspaceStudent, opportunity: WorkspaceOpportunity) {
    setNominations((current) => ({ ...current, [opportunity.id]: Array.from(new Set([...(current[opportunity.id] ?? []), student.id])) }));
    setNotice(`${student.name} is now nominated for ${opportunity.title}.`);
  }
  function saveSupport(student: WorkspaceStudent, note: string) {
    const value = note.trim();
    if (!value) return;
    setSupportNotes((current) => ({ ...current, [student.id]: value }));
    setNotice(`Support action saved for ${student.name}.`);
  }
  function shareOpportunity(opportunity: WorkspaceOpportunity, cohortName: string) {
    if (!cohortName) return;
    setSharedOpportunities((current) => ({ ...current, [opportunity.id]: Array.from(new Set([...(current[opportunity.id] ?? []), cohortName])) }));
    setNotice(`${opportunity.title} is ready to share with ${cohortName}.`);
  }
  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings.name.trim() || !settings.contact.trim()) return;
    setSettings((current) => ({ ...current, name: current.name.trim(), contact: current.contact.trim() }));
    setSettingsSaved(true);
    setNotice("Institution settings saved.");
  }
  function addCohort(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const programme = String(form.get("programme") ?? "").trim();
    const term = String(form.get("term") ?? "").trim();
    if (!name || !programme || !term) return;
    setCohorts((current) => [{ id: `cohort-${Date.now()}`, name, programme, term, learners: 0, readiness: 0, needsAttention: 0, focus: "Set the first shared outcome" }, ...current]);
    setDialog(null); setTab("Cohorts"); setNotice(`${name} has been created.`);
  }
  function addPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const sector = String(form.get("sector") ?? "").trim();
    const touchpoint = String(form.get("touchpoint") ?? "").trim();
    if (!name || !sector || !touchpoint) return;
    setPartners((current) => [{ id: `partner-${Date.now()}`, name, sector, relationship: "New partner", activeBriefs: 0, nextTouchpoint: touchpoint }, ...current]);
    setDialog(null); setTab("Partners"); setNotice(`${name} has been added as a partner.`);
  }
  function logout() { clearLocalSession(); router.replace("/"); }

  const pageCopy: Record<Tab, { eyebrow: string; title: string; description: string }> = {
    Home: { eyebrow: "Institution workspace", title: "Help every learner take the right next step.", description: "A calm operational view of readiness, support, and opportunities—built for placement teams, not dashboards for dashboards' sake." },
    Learners: { eyebrow: "Learner support", title: "See who needs action, not just a score.", description: "Review evidence, record support, and nominate the right learner when an opportunity fits." },
    Cohorts: { eyebrow: "Cohort operations", title: "Plan support where it has the most impact.", description: "Use readiness signals to focus each programme group before the next hiring window." },
    Opportunities: { eyebrow: "Opportunity desk", title: "Turn industry openings into clear student actions.", description: "Review requirements, share a brief with the right cohort, and nominate learners deliberately." },
    Partners: { eyebrow: "Industry relationships", title: "Keep partner work moving with context.", description: "A simple record of active briefs, relationship context, and the next meaningful conversation." },
    Insights: { eyebrow: "Skill signals", title: "Make industry feedback usable for students.", description: "This view aggregates opportunity requirements. It never exposes an individual learner to a partner." },
    Settings: { eyebrow: "Workspace settings", title: "Keep the workspace accurate for your team.", description: "Manage institution details, update preferences, or securely end this session." },
  };
  const currentPage = pageCopy[tab];

  return <main className="min-h-screen bg-[#f7f9fc] text-[#10284a]"><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8"><Logo className="text-[#10284a]" href="/" /><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-900">{settings.name}</p><p className="text-xs text-slate-500">{settings.contact}</p></div><Button variant="outline" size="sm" onClick={() => setTab("Settings")}><Settings /> Settings</Button><span className="grid size-10 place-items-center rounded-full bg-blue-50 text-blue-700"><LandmarkIcon /></span></div></div></header>
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8 sm:pt-12">
      <section className="border-b border-slate-200 pb-8"><p className="text-sm font-semibold text-blue-700">{currentPage.eyebrow}</p><div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div className="max-w-3xl"><h1 className="text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-6xl">{currentPage.title}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{currentPage.description}</p></div>{tab === "Cohorts" ? <Button className="bg-blue-700 hover:bg-blue-800" size="lg" onClick={() => setDialog("cohort")}><Plus /> Create cohort</Button> : tab === "Partners" ? <Button className="bg-blue-700 hover:bg-blue-800" size="lg" onClick={() => setDialog("partner")}><Plus /> Add partner</Button> : null}</div></section>
      <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Institution workspace sections">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={cn("min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors", tab === item ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-900")}>{item}</button>)}</nav>
      {notice ? <div className="mt-5 flex items-center justify-between gap-4 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status"><span className="flex items-center gap-2"><CheckCircle2 className="size-4" />{notice}</span><button className="text-xs font-semibold underline" type="button" onClick={() => setNotice(null)}>Dismiss</button></div> : null}

      {tab === "Home" ? <section className="py-8"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Indicator value={String(students.length)} label="active learners" note="Across programme groups" /><Indicator value={`${averageReadiness}%`} label="average readiness" note="Evidence and current action" /><Indicator value={String(needsSupport)} label="need support" note="Prioritise a mentor check-in" /><Indicator value={String(partners.length)} label="active partners" note="Live industry relationships" /></div><div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><article className="border border-slate-200 bg-white p-6"><p className="text-sm font-semibold text-blue-700">Today&apos;s focus</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Review learners before nominations close.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{readyStudents} learners have strong evidence today. Start with the ones closest to an open opportunity, then record support for anyone who needs a clearer next step.</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => setTab("Learners")}>Review learners <ArrowRight /></Button><Button variant="outline" onClick={() => setTab("Opportunities")}>Open opportunity desk</Button></div></article><article className="border border-slate-200 bg-white p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">Readiness snapshot</p><p className="mt-1 text-sm text-slate-500">Where support can change outcomes fastest.</p></div><Pill tone="blue">This month</Pill></div><div className="mt-6 grid gap-5"><Progress label="Career direction" value={76} /><Progress label="Evidence quality" value={69} /><Progress label="Opportunity readiness" value={82} /></div></article></div><div className="mt-8 grid gap-4 lg:grid-cols-3"><HomeAction icon={<UsersRound />} title="Support learners" body={`${needsSupport} learner${needsSupport === 1 ? "" : "s"} need a defined next action.`} action="Open learners" onClick={() => { setReadinessFilter("needs-support"); setTab("Learners"); }} /><HomeAction icon={<BriefcaseBusiness />} title="Match an opportunity" body={`${seedInstitutionOpportunities.length} verified openings are ready to review${nominationCount ? ` · ${nominationCount} nomination${nominationCount === 1 ? "" : "s"} in progress` : ""}.`} action="Review fit" onClick={() => setTab("Opportunities")} /><HomeAction icon={<Handshake />} title="Prepare partner feedback" body="Turn live skill demand into a useful cohort action." action="Open insights" onClick={() => setTab("Insights")} /></div></section> : null}

      {tab === "Learners" ? <section className="py-8"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">Learner readiness</h2><p className="mt-2 text-sm text-slate-500">Open a record to see evidence, record support, or nominate a learner.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input className="min-w-60 pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search learners" /></label><select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="Filter learners by readiness" value={readinessFilter} onChange={(event) => setReadinessFilter(event.target.value as typeof readinessFilter)}><option value="all">All readiness</option><option value="ready">Ready to match</option><option value="building">Building evidence</option><option value="needs-support">Needs support</option></select><select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="Filter learners by cohort" value={cohortFilter} onChange={(event) => setCohortFilter(event.target.value)}><option value="all">All cohorts</option>{cohorts.map((cohort) => <option key={cohort.id} value={cohort.name}>{cohort.name}</option>)}</select></div></div><div className="mt-7 divide-y divide-slate-200 border-y border-slate-200 bg-white">{filteredStudents.length ? filteredStudents.map((student) => <article className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center" key={student.id}><span className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">{studentInitials(student.name)}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-950">{student.name}</h3><Pill tone={readinessTone(student)}>{readinessCopy[student.band].label}</Pill></div><p className="mt-1 text-sm text-slate-500">{student.programme} · {student.cohort}</p><p className="mt-2 text-sm text-slate-700">{student.evidence.join(" · ")}</p></div><div className="flex items-center gap-4"><div className="text-right"><strong className="block text-lg text-slate-950">{student.readiness}%</strong><span className="text-xs text-slate-500">readiness</span></div><Button size="sm" variant="outline" onClick={() => setSelectedStudent(student)}>Open record <ChevronRight /></Button></div></article>) : <p className="p-10 text-center text-sm text-slate-500">No learners match these filters. Clear one filter to see the full list.</p>}</div></section> : null}

      {tab === "Cohorts" ? <section className="py-8"><div className="grid gap-4 lg:grid-cols-3">{cohorts.map((cohort) => <article className="border border-slate-200 bg-white p-5" key={cohort.id}><div className="flex items-start justify-between gap-4"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><UsersRound className="size-5" /></span><Pill tone={cohort.readiness >= 70 ? "green" : "amber"}>{cohort.readiness >= 70 ? "On track" : "Needs focus"}</Pill></div><h2 className="mt-6 text-lg font-semibold text-slate-950">{cohort.name}</h2><p className="mt-1 text-sm text-slate-500">{cohort.programme} · {cohort.term}</p><div className="mt-5"><Progress value={cohort.readiness} label="Average readiness" /></div><dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm"><div><dt className="text-slate-500">Learners</dt><dd className="mt-1 font-semibold text-slate-950">{cohort.learners}</dd></div><div><dt className="text-slate-500">Need support</dt><dd className="mt-1 font-semibold text-rose-700">{cohort.needsAttention}</dd></div></dl><p className="mt-4 text-sm leading-6 text-slate-600"><strong className="text-slate-900">Focus:</strong> {cohort.focus}</p><Button className="mt-5" size="sm" variant="outline" onClick={() => openLearnersForCohort(cohort.name)}>View learners <ArrowRight /></Button></article>)}</div></section> : null}

      {tab === "Opportunities" ? <section className="py-8"><div className="grid gap-4 lg:grid-cols-2">{seedInstitutionOpportunities.map((opportunity) => { const nominated = nominations[opportunity.id] ?? []; const shared = sharedOpportunities[opportunity.id] ?? []; return <article className="border border-slate-200 bg-white p-5" key={opportunity.id}><div className="flex items-start justify-between gap-4"><div><Pill tone={opportunity.status === "Open" ? "green" : "slate"}>{opportunity.status}</Pill><h2 className="mt-4 text-lg font-semibold text-slate-950">{opportunity.title}</h2><p className="mt-1 text-sm text-slate-500">{opportunity.organization} · {opportunity.type}</p></div><BriefcaseBusiness className="size-5 text-blue-700" /></div><div className="mt-5 flex flex-wrap gap-2">{opportunity.skills.map((skill) => <Pill key={skill} tone="slate">{skill}</Pill>)}</div><div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500"><span className="flex items-center gap-1"><MapPin className="size-3.5" />{opportunity.location}</span><span>{opportunity.deadline}</span></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-medium text-slate-700">{nominated.length} nominated{shared.length ? ` · shared with ${shared.length} cohort${shared.length === 1 ? "" : "s"}` : ""}</span><Button size="sm" variant="outline" onClick={() => setSelectedOpportunity(opportunity)}>Review fit <ArrowRight /></Button></div></article>; })}</div></section> : null}

      {tab === "Partners" ? <section className="py-8"><div className="grid gap-4 lg:grid-cols-3">{partners.map((partner) => <article className="border border-slate-200 bg-white p-5" key={partner.id}><Handshake className="size-5 text-blue-700" /><h2 className="mt-6 text-lg font-semibold text-slate-950">{partner.name}</h2><p className="mt-1 text-sm text-slate-500">{partner.sector} · {partner.relationship}</p><dl className="mt-5 grid gap-3 border-y border-slate-100 py-4 text-sm"><div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Active briefs</dt><dd className="font-semibold text-slate-900">{partner.activeBriefs}</dd></div><div className="flex items-start justify-between gap-4"><dt className="text-slate-500">Next touchpoint</dt><dd className="text-right font-medium text-slate-700">{partner.nextTouchpoint}</dd></div></dl>{partnerNotes[partner.id] ? <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">Last note: {partnerNotes[partner.id]}</p> : <p className="mt-4 text-sm text-slate-500">No relationship note recorded yet.</p>}<Button className="mt-5" size="sm" variant="outline" onClick={() => setSelectedPartner(partner)}>Open partner record <ChevronRight /></Button></article>)}</div></section> : null}

      {tab === "Insights" ? <section className="py-8"><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><article className="border border-slate-200 bg-white p-6"><p className="text-sm font-semibold text-blue-700">Demand signals</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Skills to strengthen before the next matching round.</h2><p className="mt-3 text-sm leading-6 text-slate-600">This is a cohort-level signal from the current opportunity desk. It helps your team decide what support to offer; no individual profile is shared with a partner.</p><div className="mt-6 divide-y divide-slate-100 border-y border-slate-100">{skillSignals.map((signal) => <div className="flex items-center justify-between gap-5 py-4" key={signal.skill}><div><p className="font-semibold text-slate-900">{signal.skill}</p><p className="mt-1 text-sm text-slate-500">{signal.covered} of {students.length} visible learner profiles show related evidence</p></div><Button size="sm" variant="outline" onClick={() => { setSearch(signal.skill); setReadinessFilter("all"); setCohortFilter("all"); setTab("Learners"); }}>View learners <ArrowRight /></Button></div>)}</div></article><article className="border border-blue-100 bg-blue-50 p-6"><Lightbulb className="size-6 text-blue-700" /><p className="mt-5 text-sm font-semibold text-blue-700">Recommended next move</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">Start a short evidence sprint.</h2><p className="mt-3 text-sm leading-6 text-slate-600">Create a shared project brief around the lowest-covered skill, then review the learners who need a portfolio-level example.</p><Button className="mt-6 bg-blue-700 hover:bg-blue-800" onClick={() => { setDialog("cohort"); setNotice("Create a focused cohort for the skill you want to strengthen."); }}>Create support cohort <Plus /></Button><div className="mt-6 border-t border-blue-200 pt-5"><p className="text-sm font-semibold text-slate-900">Industry feedback</p><p className="mt-1 text-sm leading-6 text-slate-600">Use partner records to prepare feedback for your team. PathPilot keeps this at a cohort level by default.</p><Button className="mt-4" size="sm" variant="outline" onClick={() => setTab("Partners")}>Prepare partner update <Send /></Button></div></article></div></section> : null}

      {tab === "Settings" ? <section className="grid gap-7 py-8 lg:grid-cols-[1.15fr_.85fr]"><form className="border border-slate-200 bg-white p-6" onSubmit={saveSettings}><div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Settings className="size-5" /></span><div><h2 className="text-xl font-semibold text-slate-950">Workspace settings</h2><p className="mt-1 text-sm leading-6 text-slate-600">Update the details your placement team sees across this workspace.</p></div></div><div className="mt-7 grid gap-5 sm:grid-cols-2"><Field label="Institution name" value={settings.name} onChange={(name) => { setSettings((current) => ({ ...current, name })); setSettingsSaved(false); }} /><Field label="Primary contact" value={settings.contact} onChange={(contact) => { setSettings((current) => ({ ...current, contact })); setSettingsSaved(false); }} /></div><label className="mt-6 flex cursor-pointer items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-4"><input type="checkbox" className="mt-1 size-4 accent-blue-700" checked={settings.emailUpdates} onChange={(event) => { setSettings((current) => ({ ...current, emailUpdates: event.target.checked })); setSettingsSaved(false); }} /><span className="flex gap-3"><Bell className="mt-0.5 size-4 text-blue-700" /><span><strong className="block text-sm text-slate-900">Weekly workspace update</strong><span className="mt-1 block text-sm leading-5 text-slate-600">Receive a summary of readiness, nominations, and opportunities needing attention.</span></span></span></label><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">{settingsSaved ? <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="size-4" /> Settings saved</span> : <span className="text-sm text-slate-500">Changes save to this workspace.</span>}<Button type="submit">Save settings <CheckCircle2 className="size-4" /></Button></div></form><section className="border border-slate-200 bg-slate-50 p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Account</p><h2 className="mt-3 text-xl font-semibold text-slate-950">Manage your session</h2><p className="mt-2 text-sm leading-6 text-slate-600">You can safely sign out from this device at any time.</p><section className="mt-7 border-t border-slate-200 pt-6"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><LogOut className="size-5" /></span><div><h3 className="font-semibold text-slate-900">Log out</h3><p className="mt-1 text-sm leading-5 text-slate-600">End this session and return to PathPilot&apos;s welcome screen.</p></div></div><div className="mt-5">{serviceAvailability.clerk ? <ClerkLogoutButton onLocalLogout={clearLocalSession} /> : <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700" onClick={logout}>Log out <LogOut /></Button>}</div></section></section></section> : null}
    </div>

    <Drawer open={selectedStudent !== null} onOpenChange={(open) => !open && setSelectedStudent(null)} title={selectedStudent?.name ?? "Learner record"} description={selectedStudent ? `${selectedStudent.programme} · ${selectedStudent.cohort}` : undefined}>{selectedStudent ? <StudentRecord student={selectedStudent} opportunities={seedInstitutionOpportunities} supportNote={supportNotes[selectedStudent.id] ?? ""} nominations={nominations} onSaveSupport={saveSupport} onNominate={nominate} /> : null}</Drawer>
    <Drawer open={selectedOpportunity !== null} onOpenChange={(open) => !open && setSelectedOpportunity(null)} title={selectedOpportunity?.title ?? "Opportunity"} description={selectedOpportunity ? `${selectedOpportunity.organization} · ${selectedOpportunity.type}` : undefined}>{selectedOpportunity ? <OpportunityRecord opportunity={selectedOpportunity} students={students} cohorts={cohorts} nominations={nominations[selectedOpportunity.id] ?? []} sharedCohorts={sharedOpportunities[selectedOpportunity.id] ?? []} onShare={shareOpportunity} onNominate={nominate} /> : null}</Drawer>
    <Drawer open={selectedPartner !== null} onOpenChange={(open) => !open && setSelectedPartner(null)} title={selectedPartner?.name ?? "Partner record"} description={selectedPartner ? `${selectedPartner.sector} · ${selectedPartner.relationship}` : undefined}>{selectedPartner ? <PartnerRecord partner={selectedPartner} note={partnerNotes[selectedPartner.id] ?? ""} onSave={(note) => { setPartnerNotes((current) => ({ ...current, [selectedPartner.id]: note })); setNotice(`Partner note saved for ${selectedPartner.name}.`); }} /> : null}</Drawer>
    <Modal open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)} title={dialog === "cohort" ? "Create a support cohort" : "Add an industry partner"} description={dialog === "cohort" ? "Use a focused cohort when a group needs a shared next step." : "Start with the information that helps your team keep the relationship moving."} titleIcon={dialog === "cohort" ? <UsersRound className="size-5 text-blue-700" /> : <Handshake className="size-5 text-blue-700" />}>{dialog === "cohort" ? <CohortForm onSubmit={addCohort} /> : <PartnerForm onSubmit={addPartner} />}</Modal>
  </main>;
}

function HomeAction({ icon, title, body, action, onClick }: { icon: React.ReactNode; title: string; body: string; action: string; onClick: () => void }) { return <article className="border border-slate-200 bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">{icon}</span><h2 className="mt-5 font-semibold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p><Button className="mt-5" size="sm" variant="ghost" onClick={onClick}>{action} <ArrowRight /></Button></article>; }
function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="grid gap-2 text-sm font-medium text-slate-800">{label}<Input value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function LandmarkIcon() { return <BookOpenCheck className="size-5" aria-hidden="true" />; }

function StudentRecord({ student, opportunities, supportNote, nominations, onSaveSupport, onNominate }: { student: WorkspaceStudent; opportunities: WorkspaceOpportunity[]; supportNote: string; nominations: Record<string, string[]>; onSaveSupport: (student: WorkspaceStudent, note: string) => void; onNominate: (student: WorkspaceStudent, opportunity: WorkspaceOpportunity) => void }) {
  const [note, setNote] = useState(supportNote);
  return <div className="grid gap-7"><section className="flex gap-4 border-b border-slate-100 pb-6"><span className="grid size-14 shrink-0 place-items-center rounded-full bg-blue-50 font-semibold text-blue-700">{studentInitials(student.name)}</span><div><div className="flex flex-wrap gap-2"><Pill tone={readinessTone(student)}>{readinessCopy[student.band].label}</Pill><Pill tone="slate">{student.readiness}% readiness</Pill></div><p className="mt-3 text-sm leading-6 text-slate-600">{student.nextAction}</p></div></section><section><h3 className="font-semibold text-slate-950">Visible evidence</h3><div className="mt-3 flex flex-wrap gap-2">{student.evidence.map((item) => <Pill key={item} tone="slate">{item}</Pill>)}</div></section><section><h3 className="font-semibold text-slate-950">Record a support action</h3><p className="mt-1 text-sm leading-6 text-slate-500">This stays with your placement team and makes the next follow-up clear.</p><textarea className="mt-3 min-h-24 w-full rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Book a 20-minute portfolio review before Friday." /><Button className="mt-3" variant="outline" onClick={() => onSaveSupport(student, note)}>Save support action <ClipboardCheck /></Button></section><section className="border-t border-slate-100 pt-6"><h3 className="font-semibold text-slate-950">Opportunity fit</h3><p className="mt-1 text-sm leading-6 text-slate-500">Nomination is a human placement-team action; PathPilot only shows the evidence available.</p><div className="mt-3 grid gap-3">{opportunities.map((opportunity) => { const nominated = (nominations[opportunity.id] ?? []).includes(student.id); const matches = opportunityMatches(student, opportunity); return <div className="flex items-center justify-between gap-4 border border-slate-200 p-3" key={opportunity.id}><div><p className="text-sm font-semibold text-slate-900">{opportunity.title}</p><p className="mt-1 text-xs text-slate-500">{matches} of {opportunity.skills.length} named skills reflected in visible evidence</p></div><Button size="sm" disabled={nominated} variant={nominated ? "secondary" : "outline"} onClick={() => onNominate(student, opportunity)}>{nominated ? "Nominated" : "Nominate"}</Button></div>; })}</div></section></div>;
}

function OpportunityRecord({ opportunity, students, cohorts, nominations, sharedCohorts, onShare, onNominate }: { opportunity: WorkspaceOpportunity; students: WorkspaceStudent[]; cohorts: Cohort[]; nominations: string[]; sharedCohorts: string[]; onShare: (opportunity: WorkspaceOpportunity, cohortName: string) => void; onNominate: (student: WorkspaceStudent, opportunity: WorkspaceOpportunity) => void }) {
  const [cohortName, setCohortName] = useState("");
  const matches = [...students].map((student) => ({ student, matchedSkills: opportunityMatches(student, opportunity) })).sort((a, b) => b.matchedSkills - a.matchedSkills || b.student.readiness - a.student.readiness);
  return <div className="grid gap-7"><section><h3 className="font-semibold text-slate-950">What this opportunity needs</h3><div className="mt-3 flex flex-wrap gap-2">{opportunity.skills.map((skill) => <Pill key={skill} tone="slate">{skill}</Pill>)}</div><p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><MapPin className="size-4 text-blue-700" />{opportunity.location} · {opportunity.deadline}</p></section><section className="border-y border-slate-100 py-6"><h3 className="font-semibold text-slate-950">Share with a cohort</h3><p className="mt-1 text-sm leading-6 text-slate-500">Prepare this opening for a cohort before making nominations.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><select className="h-11 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm" aria-label="Choose a cohort to share this opportunity" value={cohortName} onChange={(event) => setCohortName(event.target.value)}><option value="">Choose a cohort</option>{cohorts.map((cohort) => <option key={cohort.id} value={cohort.name}>{cohort.name}</option>)}</select><Button variant="outline" disabled={!cohortName || sharedCohorts.includes(cohortName)} onClick={() => onShare(opportunity, cohortName)}>{sharedCohorts.includes(cohortName) ? "Shared" : "Share brief"}</Button></div>{sharedCohorts.length ? <p className="mt-3 text-xs text-emerald-700">Shared with: {sharedCohorts.join(", ")}</p> : null}</section><section><div className="flex items-end justify-between gap-3"><div><h3 className="font-semibold text-slate-950">Learners to review</h3><p className="mt-1 text-sm text-slate-500">Ranked only by named evidence overlap and readiness.</p></div><Pill tone="blue">{nominations.length} nominated</Pill></div><div className="mt-3 grid gap-3">{matches.map(({ student, matchedSkills }) => { const nominated = nominations.includes(student.id); return <div className="flex items-center justify-between gap-4 border border-slate-200 p-3" key={student.id}><div className="min-w-0"><p className="font-semibold text-slate-900">{student.name}</p><p className="mt-1 text-xs text-slate-500">{matchedSkills} evidence match{matchedSkills === 1 ? "" : "es"} · {student.readiness}% readiness</p></div><Button size="sm" disabled={nominated} variant={nominated ? "secondary" : "outline"} onClick={() => onNominate(student, opportunity)}>{nominated ? "Nominated" : "Nominate"}</Button></div>; })}</div></section></div>;
}

function PartnerRecord({ partner, note, onSave }: { partner: Partner; note: string; onSave: (note: string) => void }) { const [draft, setDraft] = useState(note); return <div className="grid gap-7"><section className="grid gap-4 border-b border-slate-100 pb-6 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Relationship</p><p className="mt-2 font-semibold text-slate-900">{partner.relationship}</p></div><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active briefs</p><p className="mt-2 font-semibold text-slate-900">{partner.activeBriefs}</p></div><div className="sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Next touchpoint</p><p className="mt-2 text-sm leading-6 text-slate-700">{partner.nextTouchpoint}</p></div></section><section><h3 className="font-semibold text-slate-950">Relationship note</h3><p className="mt-1 text-sm leading-6 text-slate-500">Keep a concise internal note so the next team member can continue the conversation.</p><textarea className="mt-3 min-h-28 w-full rounded-md border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="e.g. Agreed to review a data portfolio showcase next week." /><Button className="mt-3" variant="outline" onClick={() => onSave(draft)}>Save note <CheckCircle2 /></Button></section></div>; }
function CohortForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <form className="grid gap-5" onSubmit={onSubmit}><label className="grid gap-2 text-sm font-medium">Cohort name<Input autoFocus name="name" placeholder="e.g. Data portfolio sprint" required /></label><label className="grid gap-2 text-sm font-medium">Programme<Input name="programme" placeholder="e.g. B.Tech · CSE" required /></label><label className="grid gap-2 text-sm font-medium">Term<Input name="term" placeholder="e.g. Semester 5" required /></label><Button className="bg-blue-700 hover:bg-blue-800" type="submit">Create cohort <ArrowRight /></Button></form>; }
function PartnerForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <form className="grid gap-5" onSubmit={onSubmit}><label className="grid gap-2 text-sm font-medium">Organisation name<Input autoFocus name="name" placeholder="e.g. Northstar Labs" required /></label><label className="grid gap-2 text-sm font-medium">Sector<Input name="sector" placeholder="e.g. Product & design" required /></label><label className="grid gap-2 text-sm font-medium">Next touchpoint<Input name="touchpoint" placeholder="e.g. Intro call · 18 Sep" required /></label><Button className="bg-blue-700 hover:bg-blue-800" type="submit">Add partner <ArrowRight /></Button></form>; }
