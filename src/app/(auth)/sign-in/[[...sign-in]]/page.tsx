import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { AuthPreview } from "@/components/auth/auth-preview";
import { BackButton } from "@/components/shared/back-button";
import { serviceAvailability } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  if (!serviceAvailability.clerk) {
    return <AuthPreview mode="sign-in" />;
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-16"><div className="absolute left-4 top-4"><BackButton /></div>
      <SignIn />
    </main>
  );
}
