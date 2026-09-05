import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { AuthPreview } from "@/components/auth/auth-preview";
import { isWorkspaceRole, workspaceRoleConfig } from "@/features/roles/config";
import { isStudentJourney } from "@/features/student-journey/config";
import { serviceAvailability } from "@/lib/env";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; journey?: string }>;
}) {
  const params = await searchParams;
  const role = isWorkspaceRole(params.role) ? params.role : "student";
  const journey = role === "student" && isStudentJourney(params.journey) ? params.journey : undefined;

  if (!serviceAvailability.clerk) {
    return <AuthPreview mode="sign-up" role={role} journey={journey} />;
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <SignUp fallbackRedirectUrl={`${workspaceRoleConfig[role].destination}?role=${role}${journey ? `&journey=${journey}` : ""}`} signInUrl="/sign-in" />
    </main>
  );
}
