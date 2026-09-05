import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function PortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl"><div className="flex items-center justify-between"><Logo /><Badge variant="demo">Public portfolio scaffold</Badge></div><Card className="mt-12 p-8 sm:p-12"><BriefcaseBusiness className="size-8 text-[#a998ff]" /><p className="font-data mt-8 text-xs text-muted-foreground">/{slug}</p><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em]">A student story, not just a list.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">This public route intentionally has no dashboard chrome. Milestone 6 will compose projects, resume evidence, and GitHub analysis into the narrative case-study format.</p><Button asChild variant="ghost" className="mt-8 -ml-4"><Link href="/"><ArrowLeft /> PathPilot home</Link></Button></Card></div>
    </main>
  );
}
