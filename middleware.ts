import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/roadmap(.*)",
  "/learning(.*)",
  "/projects(.*)",
  "/resume(.*)",
  "/github(.*)",
  "/interview(.*)",
  "/simulator(.*)",
  "/what-if(.*)",
  "/health-score(.*)",
  "/timeline(.*)",
  "/future-twin(.*)",
  "/mission(.*)",
  "/financial-planner(.*)",
  "/journal(.*)",
  "/settings(.*)",
  "/admin(.*)",
  "/institution(.*)",
  "/industry(.*)",
]);

const isPublicApi = createRouteMatcher(["/api/catalog(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

const protectedMiddleware = clerkMiddleware(async (auth, request) => {
  // Exploration is intentionally public. Personal data, uploads, AI calls and
  // every non-catalogue API still require a Clerk session.
  if (isProtectedRoute(request) || (isApiRoute(request) && !isPublicApi(request))) {
    await auth.protect();
  }
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }

  return protectedMiddleware(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
