"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Database, ExternalLink, LoaderCircle, RefreshCw, ShieldCheck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Overview = {
  sources: Array<{ id: string; name: string; websiteUrl: string; isActive: boolean }>;
  runs: Array<{ id: string; sourceId: string; status: string; createdAt: string; errorMessage: string | null }>;
  pendingRecords: Array<{ id: string; sourceId: string; entityType: string; sourceUrl: string; payload: Record<string, unknown> }>;
};

export function VerifiedDataConsole() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/admin/ingestion", { cache: "no-store" });
      const body = await response.json() as Overview & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not load the ingestion console.");
      setOverview(body);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load the ingestion console."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function runAisheImport() {
    setWorking("import"); setError(null);
    try {
      const response = await fetch("/api/admin/ingestion/aishe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 100 }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not start AISHE import.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start AISHE import."); }
    finally { setWorking(null); }
  }
  async function review(recordId: string, decision: "published" | "rejected") {
    setWorking(recordId); setError(null);
    try {
      const response = await fetch(`/api/admin/source-records/${recordId}/review`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not review that record.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not review that record."); }
    finally { setWorking(null); }
  }
  return <div className="mx-auto max-w-7xl space-y-6 pb-16">
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-9"><Badge>Admin only</Badge><div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><div className="flex items-center gap-3"><ShieldCheck className="size-8 text-primary" aria-hidden="true" /><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Verified data console</h1></div><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Every official record is staged first. Nothing reaches students without human review and a separate catalogue publication step.</p></div><div className="flex gap-2"><Button variant="secondary" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />Refresh</Button><Button onClick={() => void runAisheImport()} disabled={working !== null}><Database aria-hidden="true" />{working === "import" ? "Importing…" : "Stage AISHE page"}</Button></div></div>{error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}</section>
    {loading && !overview ? <Card className="grid min-h-60 place-items-center"><LoaderCircle className="animate-spin text-primary" aria-label="Loading" /></Card> : null}
    {overview ? <><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{overview.sources.map((source) => <Card key={source.id} className="p-5"><div className="flex items-start justify-between gap-3"><p className="font-medium">{source.name}</p><Badge variant={source.isActive ? "success" : "outline"}>{source.isActive ? "Active" : "Paused"}</Badge></div><a href={source.websiteUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">Official source <ExternalLink className="size-3" aria-hidden="true" /></a></Card>)}</section>
      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]"><Card className="overflow-hidden"><div className="border-b border-border p-5"><h2 className="font-semibold">Pending review</h2><p className="mt-1 text-sm text-muted-foreground">Approval preserves provenance; it does not automatically publish student-facing claims.</p></div><div className="divide-y divide-border">{overview.pendingRecords.length ? overview.pendingRecords.map((record) => <div key={record.id} className="p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant="warning">Pending</Badge><span className="text-sm font-medium">{record.entityType}</span><span className="text-xs text-muted-foreground">{record.sourceId}</span></div><a href={record.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 block truncate text-sm text-primary hover:underline">{record.sourceUrl}</a><pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">{JSON.stringify(record.payload, null, 2)}</pre></div><div className="flex shrink-0 gap-2"><Button size="sm" variant="secondary" onClick={() => void review(record.id, "rejected")} disabled={working !== null}><X aria-hidden="true" />Reject</Button><Button size="sm" onClick={() => void review(record.id, "published")} disabled={working !== null}>{working === record.id ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}Approve</Button></div></div></div>) : <p className="p-8 text-sm text-muted-foreground">No records are waiting for review.</p>}</div></Card><Card className="p-5"><h2 className="font-semibold">Recent import runs</h2><div className="mt-4 space-y-4">{overview.runs.length ? overview.runs.map((run) => <div key={run.id} className="rounded-xl border border-border p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-medium">{run.sourceId}</p><Badge variant={run.status === "succeeded" ? "success" : run.status === "failed" ? "warning" : "outline"}>{run.status}</Badge></div><p className="mt-2 text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleString()}</p>{run.errorMessage ? <p className="mt-2 text-xs text-destructive">{run.errorMessage}</p> : null}</div>) : <p className="text-sm text-muted-foreground">No imports yet.</p>}</div></Card></section></> : null}
  </div>;
}
