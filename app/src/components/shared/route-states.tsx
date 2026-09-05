"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

import { LoadingSkeleton } from "@/components/shared/feedback-states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function RouteLoading({ label = "Loading your workspace" }: { label?: string }) {
  return (
    <div className="mx-auto max-w-6xl" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="mb-7 grid gap-3">
        <div className="skeleton-shimmer h-4 w-32 rounded" />
        <div className="skeleton-shimmer h-9 w-full max-w-md rounded-lg" />
        <div className="skeleton-shimmer h-4 w-full max-w-xl rounded" />
      </div>
      <LoadingSkeleton />
    </div>
  );
}

export function RouteErrorState({ error, reset, homeHref = "/dashboard" }: { error: Error & { digest?: string }; reset: () => void; homeHref?: string }) {
  return (
    <section className="grid min-h-[55vh] place-items-center py-8 text-center" role="alert" aria-labelledby="route-error-title">
      <Card className="w-full max-w-xl p-7 sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-xl border border-destructive/25 bg-destructive/10 text-destructive"><AlertTriangle className="size-6" aria-hidden="true" /></span>
        <h1 id="route-error-title" className="mt-6 text-2xl font-semibold tracking-[-0.03em]">Something interrupted this route.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Your saved progress is safe. Retry the screen, or return to a stable starting point.</p>
        {error.digest ? <p className="mt-3 font-data text-[10px] text-muted-foreground">Reference: {error.digest}</p> : null}
        <div className="mt-7 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <Button asChild variant="secondary"><Link href={homeHref}><ArrowLeft aria-hidden="true" /> Go back</Link></Button>
          <Button onClick={reset}><RefreshCw aria-hidden="true" /> Try again</Button>
        </div>
      </Card>
    </section>
  );
}
