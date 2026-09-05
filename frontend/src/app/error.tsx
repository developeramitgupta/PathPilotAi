"use client";

import { RouteErrorState } from "@/components/shared/route-states";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="min-h-screen px-4"><RouteErrorState error={error} reset={reset} homeHref="/" /></main>;
}
