"use client";

import { useState } from "react";
import { Code2, ExternalLink, LoaderCircle, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Analysis = {
  username: string;
  profileUrl: string;
  score: number;
  summary: string;
  evidence: {
    publicRepositories: number;
    activeOriginalRepositories: number;
    followers: number;
    stars: number;
    hasBio: boolean;
    languages: Record<string, number>;
  };
  repositories: Array<{
    name: string;
    url: string;
    description: string | null;
    language: string | null;
    stars: number;
    updatedAt: string;
  }>;
  retrievedAt: string;
};

export function GitHubAnalyzerScreen() {
  const [username, setUsername] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const body = (await response.json()) as Analysis & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "GitHub analysis failed.");
      setAnalysis(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "GitHub analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-9">
        <div className="absolute -right-14 -top-20 size-64 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
        <Badge>Live public evidence</Badge>
        <div className="relative mt-5 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="flex items-center gap-3"><Code2 className="size-8 text-primary" aria-hidden="true" /><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">GitHub Analyzer</h1></div>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Turn a public GitHub profile into transparent portfolio evidence. Private repositories are never requested or accessed.</p>
          </div>
          <form onSubmit={analyse} className="flex gap-2" aria-label="Analyze a GitHub profile">
            <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="GitHub username" aria-label="GitHub username" required />
            <Button type="submit" disabled={loading}>{loading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}<span className="sr-only sm:not-sr-only">Analyze</span></Button>
          </form>
        </div>
        {error ? <p role="alert" className="relative mt-4 text-sm text-destructive">{error}</p> : null}
      </section>

      {analysis ? <>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="GitHub profile evidence">
          {[
            ["Evidence score", `${analysis.score}/100`],
            ["Public repositories", String(analysis.evidence.publicRepositories)],
            ["Active originals", String(analysis.evidence.activeOriginalRepositories)],
            ["Stars", String(analysis.evidence.stars)],
            ["Followers", String(analysis.evidence.followers)],
          ].map(([label, value], index) => <Card key={label} className={cn("p-5", index === 0 && "border-primary/40 bg-primary/5")}><p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></Card>)}
        </section>
        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">What the profile shows</h2><Button asChild variant="ghost" size="icon"><a href={analysis.profileUrl} target="_blank" rel="noreferrer" aria-label="Open GitHub profile"><ExternalLink aria-hidden="true" /></a></Button></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{analysis.summary}</p><div className="mt-5 flex flex-wrap gap-2">{Object.entries(analysis.evidence.languages).map(([language, count]) => <Badge key={language} variant="outline">{language} · {count}</Badge>)}{!analysis.evidence.hasBio ? <Badge variant="warning">Add a profile bio</Badge> : null}</div><p className="mt-6 text-xs text-muted-foreground">Retrieved {new Date(analysis.retrievedAt).toLocaleString()}</p></Card>
          <Card className="p-6"><h2 className="text-lg font-semibold">Recent original repositories</h2><div className="mt-4 divide-y divide-border">{analysis.repositories.length ? analysis.repositories.map((repository) => <a key={repository.url} href={repository.url} target="_blank" rel="noreferrer" className="block py-4 first:pt-0 hover:text-primary"><div className="flex items-center justify-between gap-4"><p className="font-medium">{repository.name}</p><span className="text-xs text-muted-foreground">★ {repository.stars}</span></div><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{repository.description ?? "No repository description."}</p><p className="mt-2 text-xs text-muted-foreground">{repository.language ?? "Language not detected"} · Updated {new Date(repository.updatedAt).toLocaleDateString()}</p></a>) : <p className="py-8 text-sm text-muted-foreground">No original public repositories were returned by GitHub.</p>}</div></Card>
        </section>
      </> : <Card className="grid min-h-64 place-items-center p-6 text-center"><div><Code2 className="mx-auto size-9 text-muted-foreground" aria-hidden="true" /><h2 className="mt-4 text-lg font-semibold">Analyze real public work</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">Enter a public GitHub username. We use GitHub’s official REST API and save a personal history only after you sign in.</p></div></Card>}
    </div>
  );
}
