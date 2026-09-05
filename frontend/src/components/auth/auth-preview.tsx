"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { BackButton } from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  workspaceRoleConfig,
  workspaceRoles,
  type WorkspaceRole,
} from "@/features/roles/config";
import { type StudentJourney } from "@/features/student-journey/config";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

export function AuthPreview({
  mode,
  role: initialRole = "student",
  journey,
}: {
  mode: "sign-in" | "sign-up";
  role?: WorkspaceRole;
  journey?: StudentJourney;
}) {
  const router = useRouter();
  const setWorkspaceSession = usePathPilotStore((state) => state.setWorkspaceSession);
  const savedSession = usePathPilotStore((state) => state.workspaceSession);
  const [role, setRole] = useState<WorkspaceRole>(initialRole);
  const [name, setName] = useState(savedSession?.displayName ?? "");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState(savedSession?.workspaceName ?? "");
  const [error, setError] = useState<string | null>(null);
  const isSignUp = mode === "sign-up";
  const config = workspaceRoleConfig[role];
  const Icon = config.icon;

  function continueToWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (isSignUp && cleanName.length < 2) {
      setError("Enter the name we should use in your workspace.");
      return;
    }
    if (isSignUp && !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (isSignUp && role !== "student" && workspaceName.trim().length < 2) {
      setError("Enter your institution or company name.");
      return;
    }

    setError(null);
    const displayName = cleanName || savedSession?.displayName || "PathPilot member";
    const nextWorkspaceName = workspaceName.trim() || undefined;
    setWorkspaceSession({ role, displayName, workspaceName: nextWorkspaceName });
    if (role === "student" && !journey) {
      router.push("/student-stage");
      return;
    }
    const destination = config.destination;
    const query = new URLSearchParams({ role, name: displayName });
    if (nextWorkspaceName) query.set("workspace", nextWorkspaceName);
    if (role === "student" && journey) query.set("journey", journey);
    router.push(`${destination}?${query.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 text-[#10284a] sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Logo className="text-[#10284a]" href="/" />
          <div className="flex items-center gap-1"><BackButton fallbackHref={isSignUp ? "/student-stage" : "/"} className="text-[#526174]" /><Link className="text-sm font-semibold text-[#526174] hover:text-[#1264c4]" href={isSignUp ? "/sign-in" : "/"}>{isSignUp ? "Sign in" : "Back to PathPilot"}</Link></div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <section className="max-w-xl">
            <p className="text-sm font-semibold text-[#1264c4]">One platform, clear roles</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
              {isSignUp ? config.signUpTitle : "Pick up where your work left off."}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#526174] sm:text-lg">
              {isSignUp ? config.signUpDescription : "Open the workspace that matches the work you need to do today."}
            </p>
            <div className="mt-8 grid gap-3 text-sm text-[#385c82]">
              {[
                "One primary workspace for each account",
                "Role-specific actions and information",
                "Student, institution, and industry collaboration",
              ].map((item) => <p className="flex items-center gap-2" key={item}><CheckCircle2 className="size-4 text-[#39a27e]" aria-hidden="true" />{item}</p>)}
            </div>
          </section>

          <section className="w-full rounded-2xl border border-[#dbe3ed] bg-white p-5 shadow-[0_20px_60px_rgba(16,40,74,0.09)] sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5ebf2] pb-6">
              <div>
                <p className="text-sm font-semibold text-[#1264c4]">{isSignUp ? "Create your workspace" : "Welcome back"}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Continue as {config.label}</h2>
              </div>
              <span className="grid size-11 place-items-center rounded-xl bg-[#eaf3ff] text-[#1264c4]"><Icon className="size-5" aria-hidden="true" /></span>
            </div>

            <div className="mt-6" role="group" aria-label="Choose a workspace role">
              <p className="text-sm font-medium">I&apos;m here as</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {workspaceRoles.map((candidateRole) => {
                  const candidate = workspaceRoleConfig[candidateRole];
                  return (
                    <button
                      className={cn("min-h-11 rounded-lg border px-2 text-sm font-medium transition-colors", role === candidateRole ? "border-[#1264c4] bg-[#eaf3ff] text-[#1264c4]" : "border-[#dbe3ed] text-[#526174] hover:border-[#1264c4]/50")}
                      key={candidateRole}
                      type="button"
                      aria-pressed={role === candidateRole}
                      onClick={() => setRole(candidateRole)}
                    >
                      {candidate.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <form className="mt-6 grid gap-5" onSubmit={continueToWorkspace} noValidate>
              {isSignUp ? (
                <>
                  <label className="grid gap-2 text-sm font-medium">Your name<Input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Aditi Sharma" /></label>
                  <label className="grid gap-2 text-sm font-medium">Email address<Input autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
                  {role !== "student" ? <label className="grid gap-2 text-sm font-medium">{role === "institution" ? "Institution name" : "Company name"}<Input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder={role === "institution" ? "e.g. Horizon Institute" : "e.g. Atlas Labs"} /></label> : null}
                </>
              ) : (
                <label className="grid gap-2 text-sm font-medium">Your name<Input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Aditi Sharma" /></label>
              )}
              {error ? <p className="rounded-lg border border-[#d05b68]/25 bg-[#fff4f5] px-3 py-2 text-sm text-[#a23848]" role="alert">{error}</p> : null}
              <Button className="mt-1 w-full bg-[#1264c4] hover:bg-[#0d55aa]" size="lg" type="submit">
                {isSignUp ? (role === "student" ? "Start my assessment" : "Set up workspace") : "Continue to workspace"} <ArrowRight aria-hidden="true" />
              </Button>
            </form>

            <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#62748b]"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#39a27e]" aria-hidden="true" />Your role determines the workspace you see. Institution and industry access is verified before shared data is published.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
