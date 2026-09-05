import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name } = await searchParams;
  return <OnboardingWizard initialName={name} />;
}
