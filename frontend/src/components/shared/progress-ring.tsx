import { cn } from "@/lib/utils";

export function ProgressRing({
  value,
  label,
  size = "lg",
  className,
}: {
  value: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const boundedValue = Math.max(0, Math.min(100, value));
  const dimensions = { sm: 80, md: 128, lg: 184 }[size];
  const strokeWidth = { sm: 7, md: 9, lg: 11 }[size];
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (boundedValue / 100) * circumference;

  return (
    <div
      className={cn("relative grid shrink-0 place-items-center", className)}
      style={{ width: dimensions, height: dimensions }}
      role="img"
      aria-label={`${label ?? "Progress"}: ${boundedValue} out of 100`}
    >
      <svg className="-rotate-90" width={dimensions} height={dimensions} aria-hidden="true">
        <defs>
          <linearGradient id={`ring-${dimensions}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C5CFC" />
            <stop offset="100%" stopColor="#3E8BFF" />
          </linearGradient>
        </defs>
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke={`url(#ring-${dimensions})`}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span
          className={cn(
            "font-display font-semibold leading-none tracking-[-0.05em]",
            size === "lg" ? "text-5xl" : size === "md" ? "text-3xl" : "text-xl",
          )}
        >
          {boundedValue}
        </span>
        {label ? <span className="mt-1 text-[10px] text-muted-foreground">{label}</span> : null}
      </div>
    </div>
  );
}
