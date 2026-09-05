import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Blocks, CheckCircle2, CircleDashed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getModuleBySlug, type ModuleDefinition } from "@/features/modules/registry";

export function ModulePlaceholder({ module }: { module: ModuleDefinition }) {
  const isNext = module.status === "next";
  return (
    <div className="mx-auto max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="-ml-3 mb-5"><Link href="/dashboard"><ArrowLeft aria-hidden="true" /> Dashboard</Link></Button>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="min-h-[460px] p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2"><Badge>{module.stage === "mvp" ? "Hackathon MVP" : "Future module"}</Badge><Badge variant={isNext ? "success" : "demo"}>{isNext ? "Up next" : `Milestone ${module.milestone}`}</Badge></div>
          <div className="mt-12 max-w-2xl sm:mt-16">
            <div className="mb-6 grid size-14 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-[#a998ff]"><Blocks className="size-6" aria-hidden="true" /></div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{module.title}</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{module.purpose}</p>
            <p className="mt-6 text-sm leading-6 text-muted-foreground">The route, navigation, domain contract, data boundary, and responsive shell are ready. The full interactive workflow will land in Milestone {module.milestone} without changing this architecture.</p>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">{isNext ? <Button asChild><Link href="/onboarding">Start with onboarding <ArrowRight aria-hidden="true" /></Link></Button> : <Button asChild><Link href="/dashboard">Return to dashboard</Link></Button>}</div>
        </Card>
        <Card className="h-fit p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Implementation readiness</p>
          <div className="mt-5 grid gap-4 text-sm">
            {["Route and app shell", "Typed module registry", "Service interface"].map((item) => <div className="flex items-center gap-3" key={item}><CheckCircle2 className="size-4 text-success" aria-hidden="true" /><span>{item}</span></div>)}
            <div className="flex items-center gap-3 text-muted-foreground"><CircleDashed className="size-4" aria-hidden="true" /><span>Interactive workflow · M{module.milestone}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PlannedModulePage({ slug }: { slug: string }) {
  const definition = getModuleBySlug(slug);
  if (!definition) notFound();
  return <ModulePlaceholder module={definition} />;
}
