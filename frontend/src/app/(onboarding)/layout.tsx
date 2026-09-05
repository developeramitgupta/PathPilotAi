import { QueryBoundary } from "@/components/shared/query-boundary";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <QueryBoundary>{children}</QueryBoundary>;
}
