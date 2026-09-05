import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

export default async function ObserverPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  return <main className="grid min-h-screen place-items-center px-4 py-12"><div className="w-full max-w-xl"><Logo className="mb-8 justify-center" /><Card className="p-8 text-center"><Badge variant="demo">Read-only view scaffold</Badge><h1 className="mt-5 text-2xl font-semibold">Shared student progress</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Grant <span className="font-data">{shareId}</span> will require a valid, non-revoked, unexpired sharing record before any student summary is returned.</p></Card></div></main>;
}
