import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[transform,background-color,border-color,box-shadow,color] duration-150 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "signature-gradient text-primary-foreground shadow-[0_8px_30px_rgba(124,92,252,0.22)] hover:-translate-y-0.5 hover:shadow-[0_12px_38px_rgba(124,92,252,0.3)] active:translate-y-0",
        secondary:
          "border border-border bg-secondary/70 text-secondary-foreground hover:bg-accent",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        destructive:
          "border border-destructive/35 bg-destructive/10 text-destructive hover:bg-destructive/18",
        outline:
          "border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-primary/8",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 min-h-9 rounded-md px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        type={asChild ? undefined : (type ?? "button")}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
