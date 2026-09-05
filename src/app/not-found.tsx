import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-4 text-center"><div><p className="font-data text-sm text-[#a998ff]">404</p><h1 className="mt-3 text-3xl font-semibold">This path is not on the map.</h1><p className="mt-3 text-sm text-muted-foreground">Return to PathPilot and choose a working route.</p><Button asChild className="mt-6"><Link href="/">Go home</Link></Button></div></main>;
}
