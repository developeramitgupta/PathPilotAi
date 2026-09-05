import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

export default async function ParentPage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const { inviteCode } = await params;
  return <main className="grid min-h-screen place-items-center px-4 py-12"><div className="w-full max-w-xl"><Logo className="mb-8 justify-center" /><Card className="p-8 text-center"><Badge variant="demo">Invite-only form scaffold</Badge><h1 className="mt-5 text-2xl font-semibold">Parent Alignment</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Invite <span className="font-data">{inviteCode}</span> will be validated before the five-question expectation form is shown. No parent role is self-serve.</p></Card></div></main>;
}
