import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { fraunces, geist, geistMono } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pathpilot.ai"),
  title: {
    default: "PathPilot AI — Student Success, Explained",
    template: "%s | PathPilot AI",
  },
  description:
    "Continuous, explained career guidance for Indian students — from Class 10 to the first job offer.",
  applicationName: "PathPilot AI",
  openGraph: {
    title: "PathPilot AI",
    description: "Your AI-powered Student Success Operating System.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0F",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`dark ${geist.variable} ${geistMono.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {clerkKey ? (
          <ClerkProvider publishableKey={clerkKey}><ThemeProvider>{children}</ThemeProvider></ClerkProvider>
        ) : (
          <ThemeProvider>{children}</ThemeProvider>
        )}
      </body>
    </html>
  );
}
