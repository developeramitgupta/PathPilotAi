import Link from "next/link";
import { Waypoints } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  href = "/",
  className,
}: {
  compact?: boolean;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label="PathPilot AI home"
    >
      <span className="signature-gradient grid size-9 place-items-center rounded-[10px] shadow-[0_8px_24px_rgba(124,92,252,0.25)]">
        <Waypoints className="size-5 text-white" aria-hidden="true" />
      </span>
      {compact ? null : (
        <span className="text-[15px] font-semibold tracking-[-0.02em]">
          PathPilot <span className="text-muted-foreground">AI</span>
        </span>
      )}
    </Link>
  );
}
