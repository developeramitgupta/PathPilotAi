import Image from "next/image";
import Link from "next/link";

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
      <span className="grid size-9 shrink-0 place-items-center" aria-hidden="true">
        <Image src="/images/brand-pathpilot-p-v2.png" alt="" width={512} height={512} className="size-full object-contain" priority />
      </span>
      {compact ? null : (
        <span className="text-[15px] font-semibold tracking-[-0.03em]">PathPilot</span>
      )}
    </Link>
  );
}
