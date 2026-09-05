"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Bot, LoaderCircle, Sparkles } from "lucide-react";

import { ErrorBanner } from "@/components/shared/feedback-states";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { requestPathPilot } from "@/features/pathpilot/api-client";
import { usePathPilotStore } from "@/stores/pathpilot-store";

interface AskResult {
  message: string;
  links: Array<{ label: string; href: string }>;
  agent: string;
  mode: "ai" | "deterministic-fallback";
}

function AskPathPilotDialogContent({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [question, setQuestion] = useState("");
  const profile = usePathPilotStore((state) => state.profile);
  const decisions = usePathPilotStore((state) => state.decisions);
  const askMutation = useMutation({
    mutationFn: () => requestPathPilot<{ result: AskResult }>("/api/ask", {
      method: "POST",
      body: JSON.stringify({ question, profile, decisionMemory: decisions }),
    }),
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Ask PathPilot" description="Questions route through the Master Orchestrator and your decision memory." className="max-w-xl" titleIcon={<Bot className="size-5 text-[#a998ff]" aria-hidden="true" />}>
      <form onSubmit={(event) => { event.preventDefault(); if (question.trim().length >= 3) askMutation.mutate(); }}>
        <label className="sr-only" htmlFor="ask-pathpilot">Your question</label>
        <Textarea id="ask-pathpilot" autoFocus value={question} onChange={(event) => setQuestion(event.target.value)} className="min-h-28 resize-none" placeholder="Which career fits my interest in design and maths?" aria-describedby="ask-pathpilot-help" />
        <p id="ask-pathpilot-help" className="mt-2 text-[11px] text-muted-foreground">Ask about careers, colleges, exams, degrees, roadmaps, or your next action.</p>
        {askMutation.data ? (
          <div className="mt-4 rounded-lg border border-primary/15 bg-primary/8 p-4 text-xs leading-5 text-[#c4bbff]" aria-live="polite">
            <p>{askMutation.data.result.message}</p>
            {askMutation.data.result.links.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {askMutation.data.result.links.map((link) => <Button asChild size="sm" variant="ghost" key={link.href}><Link href={link.href} onClick={() => onOpenChange(false)}>{link.label} <ArrowRight aria-hidden="true" /></Link></Button>)}
              </div>
            ) : null}
          </div>
        ) : null}
        {askMutation.isError ? <div className="mt-4"><ErrorBanner message={askMutation.error.message} onRetry={() => askMutation.mutate()} /></div> : null}
        <div className="mt-5 flex justify-end">
          <Button type="submit" disabled={askMutation.isPending || question.trim().length < 3}>
            {askMutation.isPending ? <><span className="animate-spin motion-reduce:animate-none"><LoaderCircle aria-hidden="true" /></span> Routing…</> : <><Sparkles aria-hidden="true" /> Ask</>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function AskPathPilotDialog(props: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <QueryBoundary><AskPathPilotDialogContent {...props} /></QueryBoundary>;
}
import { QueryBoundary } from "@/components/shared/query-boundary";
