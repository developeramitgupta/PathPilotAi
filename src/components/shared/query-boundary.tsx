import { AppProviders } from "@/app/providers";

export function QueryBoundary({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
