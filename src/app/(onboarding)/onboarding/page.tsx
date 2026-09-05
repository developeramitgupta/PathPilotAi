import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; journey?: string; mode?: string }>;
}) {
  const { name, journey, mode } = await searchParams;
  return <OnboardingWizard initialName={name} journey={journey} mode={mode === "adapt" ? "adapt" : "full"} />;
}
