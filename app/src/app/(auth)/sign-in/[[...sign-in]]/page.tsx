import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { AuthPreview } from "@/components/auth/auth-preview";
import { BackButton } from "@/components/shared/back-button";
import { isWorkspaceRole } from "@/features/roles/config";
import { isStudentJourney } from "@/features/student-journey/config";
import { serviceAvailability } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; journey?: string }>;
}) {
  const params = await searchParams;
  const role = isWorkspaceRole(params.role) ? params.role : undefined;
  const journey = role === "student" && isStudentJourney(params.journey) ? params.journey : undefined;

  if (!serviceAvailability.clerk) {
    return <AuthPreview mode="sign-in" role={role} journey={journey} lockRole={Boolean(role)} />;
  }

  return (
    <main className="relative grid min-h-screen place-items-center px-4 py-16"><div className="absolute left-4 top-4"><BackButton /></div>
      <SignIn />
    </main>
  );
}
