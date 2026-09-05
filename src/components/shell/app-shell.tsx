"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronLeft, ChevronRight, Command, MoreHorizontal, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/shared/logo";
import { getMobilePrimary, getNavigationGroups } from "@/components/shell/navigation-config";
import { Button } from "@/components/ui/button";
import { serviceAvailability } from "@/lib/env";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const AskPathPilotDialog = dynamic(
  () => import("@/components/shell/ask-pathpilot-dialog").then((module) => module.AskPathPilotDialog),
  { ssr: false },
);

const MobileModuleDrawer = dynamic(
  () => import("@/components/shell/mobile-module-drawer").then((module) => module.MobileModuleDrawer),
  { ssr: false },
);

const ClerkUserButton = dynamic(
  () => import("@clerk/nextjs").then((module) => module.UserButton),
  { ssr: false, loading: () => <span className="skeleton-shimmer size-9 shrink-0 rounded-full" aria-label="Loading profile" /> },
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const studentJourney = usePathPilotStore((state) => state.studentJourney);
  const [askOpen, setAskOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navigationGroups = getNavigationGroups(studentJourney);
  const mobilePrimary = getMobilePrimary(studentJourney);

  useEffect(() => {
    function openCommandPalette(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setAskOpen(true);
      }
    }
    window.addEventListener("keydown", openCommandPalette);
    return () => window.removeEventListener("keydown", openCommandPalette);
  }, []);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-card/72 backdrop-blur-xl transition-[width] duration-200 md:block", collapsed ? "w-[72px]" : "w-[264px]")}>
        <div className={cn("flex h-16 items-center border-b border-border px-4", collapsed && "justify-center px-0")}>
          <Logo compact={collapsed} href="/dashboard" />
        </div>
        <nav className="h-[calc(100vh-8rem)] overflow-y-auto px-2 py-4 [scrollbar-width:none]" aria-label="Product modules">
          {navigationGroups.map((group) => (
            <div className="mb-5" key={group.label}>
              {collapsed ? null : <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group.label}</p>}
              <div className="grid gap-0.5">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link href={href} key={href} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined} className={cn("relative flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", active && "bg-primary/10 text-foreground", collapsed && "justify-center px-0")}>
                      {active ? <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" /> : null}
                      <Icon className={cn("size-[18px] shrink-0", active && "fill-primary/12 text-[#9d8bff]")} aria-hidden="true" />
                      {collapsed ? null : <span>{label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <Button variant="ghost" size="sm" className={cn("absolute bottom-4 left-3 right-3 justify-start", collapsed && "left-4 right-4 justify-center px-0")} onClick={toggleSidebar} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed}>
          {collapsed ? <ChevronRight aria-hidden="true" /> : <><ChevronLeft aria-hidden="true" /> Collapse</>}
        </Button>
      </aside>

      <div className={cn("transition-[padding] duration-200 md:pl-[264px]", collapsed && "md:pl-[72px]")}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/78 px-3 backdrop-blur-xl sm:gap-4 sm:px-6">
          <Logo compact href="/dashboard" className="md:hidden" />
          <button type="button" onClick={() => setAskOpen(true)} className="mx-auto flex h-10 min-w-0 w-full max-w-lg items-center gap-3 rounded-lg border border-border bg-card/70 px-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/25 hover:text-foreground sm:px-3.5" aria-haspopup="dialog">
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 truncate">Ask PathPilot anything…</span>
            <span className="hidden items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-data text-[10px] sm:flex"><Command className="size-2.5" aria-hidden="true" /> K</span>
          </button>
          <Button asChild variant="ghost" size="icon" className="relative hidden sm:inline-flex">
            <Link href="/settings" aria-label="Open notification preferences"><Bell aria-hidden="true" /><span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary" /></Link>
          </Button>
          {serviceAvailability.clerk ? <ClerkUserButton /> : <Link href="/settings" className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-xs font-semibold" aria-label="Open preview profile settings">AR</Link>}
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1600px] px-4 py-6 pb-24 sm:px-6 sm:py-8 md:pb-8 lg:px-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-[calc(72px+env(safe-area-inset-bottom))] grid-cols-5 border-t border-border bg-card/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        {mobilePrimary.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return <Link className={cn("flex min-h-11 flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground", active && "text-[#a998ff]")} href={href} key={href} aria-current={active ? "page" : undefined}><Icon className="size-5" aria-hidden="true" /> {label}</Link>;
        })}
        <button type="button" className="flex min-h-11 flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen}><MoreHorizontal className="size-5" aria-hidden="true" /> More</button>
      </nav>

      {askOpen ? <AskPathPilotDialog open={askOpen} onOpenChange={setAskOpen} /> : null}
      {moreOpen ? <MobileModuleDrawer open={moreOpen} onOpenChange={setMoreOpen} /> : null}
    </div>
  );
}
