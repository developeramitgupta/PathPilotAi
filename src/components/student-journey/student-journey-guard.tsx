"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getStudentJourney, isJourneyRouteAllowed, studentJourneyConfig } from "@/features/student-journey/config";
import { usePathPilotStore } from "@/stores/pathpilot-store";

export function StudentJourneyGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const journey = usePathPilotStore((state) => state.studentJourney);
  const workspaceRole = usePathPilotStore((state) => state.workspaceSession?.role);
  const [hydrated, setHydrated] = useState(false);
  const current = getStudentJourney(journey);

  useEffect(() => {
    setHydrated(usePathPilotStore.persist.hasHydrated());
    return usePathPilotStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  if (!hydrated) return <div className="grid min-h-[42vh] place-items-center text-sm text-muted-foreground">Loading your personalized workspace…</div>;

  if (workspaceRole && workspaceRole !== "student") return <>{children}</>;
  if (isJourneyRouteAllowed(current, pathname)) return <>{children}</>;

  const config = studentJourneyConfig[current];
  return <section className="mx-auto grid min-h-[52vh] max-w-2xl place-items-center text-center"><div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)] sm:p-10"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><Compass className="size-6" aria-hidden="true" /></span><p className="mt-6 text-sm font-semibold text-primary">{config.label}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">This tool is not part of your current stage.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">{config.unavailableMessage}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild><Link href="/dashboard">Go to my home <ArrowRight /></Link></Button><Button asChild variant="secondary"><Link href="/student-stage?mode=switch">Change student stage</Link></Button></div></div></section>;
}
