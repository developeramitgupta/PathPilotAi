"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";

import { cn } from "@/lib/utils";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  titleIcon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  titleIcon?: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay data-slot="dialog-overlay" className="fixed inset-0 z-[80] bg-black/72 backdrop-blur-sm" />
        <Dialog.Content
          data-slot="dialog-content"
          className={cn(
            "fixed left-1/2 top-1/2 z-[90] max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-popover p-5 shadow-2xl outline-none sm:p-6",
            className,
          )}
        >
          <div className="pr-10">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em]">{titleIcon}{title}</Dialog.Title>
            {description ? (
              <Dialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                {description}
              </Dialog.Description>
            ) : null}
          </div>
          <Dialog.Close type="button" className="absolute right-4 top-4 grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Close dialog">
            <X className="size-4" />
          </Dialog.Close>
          <div className="mt-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  side?: "right" | "bottom";
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay data-slot="dialog-overlay" className="fixed inset-0 z-[80] bg-black/72 backdrop-blur-sm" />
        <Dialog.Content
          data-slot={side === "bottom" ? "drawer-bottom" : "drawer-right"}
          className={cn(
            "fixed z-[90] w-full overflow-y-auto bg-popover p-5 shadow-2xl outline-none",
            side === "right"
              ? "inset-y-0 right-0 border-l border-border sm:max-w-xl sm:p-7"
              : "inset-x-0 bottom-0 max-h-[82vh] rounded-t-2xl border-t border-border pb-[calc(2rem+env(safe-area-inset-bottom))]",
          )}
        >
          <div className="pr-10">
            <Dialog.Title className="text-xl font-semibold tracking-[-0.03em]">{title}</Dialog.Title>
            {description ? <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">{description}</Dialog.Description> : null}
          </div>
          <Dialog.Close type="button" className="absolute right-4 top-4 grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Close drawer"><X className="size-4" /></Dialog.Close>
          <div className="mt-7">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
