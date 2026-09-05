import Link from "next/link";
import { AlertTriangle, ArrowRight, Compass, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-destructive/25 bg-destructive/8 p-4 text-sm sm:flex-row sm:items-center" role="alert" aria-live="assertive">
      <AlertTriangle className="size-5 shrink-0 text-destructive" aria-hidden="true" />
      <p className="flex-1 text-foreground">{message}</p>
      {onRetry ? (
        <Button variant="ghost" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden="true" /> Retry
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <Card className="grid min-h-[430px] place-items-center p-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid size-14 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-[#a998ff]">
          <Compass className="size-6" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        <Button asChild className="mt-7">
          <Link href={href}>{action} <ArrowRight aria-hidden="true" /></Link>
        </Button>
      </div>
    </Card>
  );
}

export function LoadingSkeleton({ variant = "cards" }: { variant?: "cards" | "timeline" | "list" }) {
  const rows = variant === "timeline" ? 6 : variant === "list" ? 5 : 3;
  return (
    <div className="grid gap-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading results</span>
      {Array.from({ length: rows }, (_, index) => (
        <div className="rounded-xl border border-border bg-card/70 p-5" key={index} aria-hidden="true">
          <div className="skeleton-shimmer h-3 w-24 rounded" />
          <div className="skeleton-shimmer mt-4 h-6 w-2/3 rounded" />
          <div className="skeleton-shimmer mt-3 h-3 w-full rounded" />
          <div className="skeleton-shimmer mt-2 h-3 w-4/5 rounded" />
        </div>
      ))}
    </div>
  );
}
