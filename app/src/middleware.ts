import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

function hasValidClerkKey(value: string | undefined) {
  return Boolean(value && /^(pk_test|pk_live)_/.test(value));
}

const protectedPrefixes = [
  "/dashboard", "/onboarding", "/roadmap", "/learning",
  "/projects", "/resume", "/github", "/interview",
  "/simulator", "/what-if", "/health-score", "/timeline",
  "/future-twin", "/mission", "/financial-planner", "/journal",
  "/settings", "/admin", "/institution", "/industry",
];

// Public exploration may read only reviewed catalogue content. Personal actions
// (saving, uploads, guidance history and role workspaces) stay protected.
const publicApiPrefixes = [
  "/api/catalog",
  "/api/radar",
  "/api/colleges/generate",
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

const protectedMiddleware = clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = matchesPrefix(pathname, protectedPrefixes);
  const isPersonalApi = pathname.startsWith("/api/") && !matchesPrefix(pathname, publicApiPrefixes);

  if (isProtectedRoute || isPersonalApi) {
    await auth.protect();
  }
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!hasValidClerkKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)) return NextResponse.next();
  return protectedMiddleware(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
