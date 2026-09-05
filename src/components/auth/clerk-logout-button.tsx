"use client";

import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ClerkLogoutButton({ onLocalLogout }: { onLocalLogout: () => void }) {
  const { signOut } = useClerk();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    onLocalLogout();
    await signOut({ redirectUrl: "/" });
  }

  return <Button type="button" variant="outline" className="border-destructive/35 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={pending} onClick={logout}>{pending ? "Signing out…" : "Log out"}<LogOut aria-hidden="true" /></Button>;
}
