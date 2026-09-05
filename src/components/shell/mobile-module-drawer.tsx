"use client";

import Link from "next/link";

import { getNavigationGroups } from "@/components/shell/navigation-config";
import { usePathPilotStore } from "@/stores/pathpilot-store";
import { Drawer } from "@/components/ui/dialog";

export function MobileModuleDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const studentJourney = usePathPilotStore((state) => state.studentJourney);
  const navigationGroups = getNavigationGroups(studentJourney);
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="All modules" description="Jump to any PathPilot workspace." side="bottom">
      <div className="grid gap-5">
        {navigationGroups.map((group) => {
          const headingId = `mobile-group-${group.label.toLowerCase()}`;
          return (
            <section key={group.label} aria-labelledby={headingId}>
              <h3 id={headingId} className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group.label}</h3>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map(({ label, href, icon: Icon }) => (
                  <Link href={href} key={href} onClick={() => onOpenChange(false)} className="flex min-h-12 min-w-0 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground transition-colors hover:border-primary/25 hover:text-foreground">
                    <Icon className="size-4 shrink-0 text-[#9d8bff]" aria-hidden="true" /><span className="truncate">{label}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Drawer>
  );
}
