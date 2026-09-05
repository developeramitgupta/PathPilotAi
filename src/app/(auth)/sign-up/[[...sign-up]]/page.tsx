import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { AuthPreview } from "@/components/auth/auth-preview";
import { serviceAvailability } from "@/lib/env";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  if (!serviceAvailability.clerk) {
    return <AuthPreview mode="sign-up" />;
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <SignUp />
    </main>
  );
}
