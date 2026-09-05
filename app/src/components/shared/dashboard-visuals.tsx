"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, LockKeyhole, Trophy } from "lucide-react";

import type { HealthCategory, MissionPlan } from "@/features/pathpilot/schemas";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function TrendSparkline({
  values,
  label,
  className,
}: {
  values: number[];
  label: string;
  className?: string;
}) {
  const width = 120;
  const height = 38;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - 4 - ((value - min) / range) * (height - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <motion.div
      className={cn("h-10 w-[120px]", className)}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease }}
      role="img"
      aria-label={`${label}: ${values.join(", ")}`}
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" aria-hidden="true">
        <path d={`M 0 ${height - 3} H ${width}`} stroke="rgba(255,255,255,0.06)" />
        <polyline
          points={points}
          fill="none"
          stroke="#8d79ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((value, index) => {
          const [x, y] = points.split(" ")[index].split(",");
          return index === values.length - 1 ? (
            <circle key={`${value}-${index}`} cx={x} cy={y} r="3" fill="#3e8bff" />
          ) : null;
        })}
      </svg>
    </motion.div>
  );
}

export function AnimatedProgressBar({
  value,
  label,
  showValue = true,
  className,
}: {
  value: number;
  label: string;
  showValue?: boolean;
  className?: string;
}) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {showValue ? (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-data text-foreground">{bounded}%</span>
        </div>
      ) : null}
      <div
        className="h-2 overflow-hidden rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={bounded}
      >
        <motion.div
          className="signature-gradient h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${bounded}%` }}
          transition={{ duration: 0.4, ease }}
        />
      </div>
    </div>
  );
}

const donutColors = [
  "#7c5cfc",
  "#3e8bff",
  "#22d3ee",
  "#34d399",
  "#fbbf24",
  "#fb7185",
  "#a78bfa",
];

export function CategoryDonut({
  score,
  categories,
  size = "lg",
}: {
  score: number;
  categories: HealthCategory[];
  size?: "md" | "lg";
}) {
  let cursor = 0;
  const segments = categories.map((category, index) => {
    const start = cursor;
    const end = start + category.weight;
    const activeEnd = start + (category.score * category.weight) / 100;
    cursor = end;
    return `${donutColors[index]} ${start}% ${activeEnd}%, rgba(255,255,255,0.055) ${activeEnd}% ${end}%`;
  });
  if (cursor < 100) segments.push(`rgba(255,255,255,0.045) ${cursor}% 100%`);
  const dimensions = size === "lg" ? "size-52 sm:size-60" : "size-40";

  return (
    <motion.div
      className={cn("relative grid shrink-0 place-items-center rounded-full", dimensions)}
      style={{ background: `conic-gradient(${segments.join(",")})` }}
      initial={{ opacity: 0, scale: 0.88, rotate: -12 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.4, ease }}
      role="img"
      aria-label={`Career Health Score ${score} out of 100. Category-weighted breakdown.`}
    >
      <div className="absolute inset-[15%] grid place-content-center rounded-full border border-white/8 bg-card text-center shadow-2xl">
        <motion.span
          className={cn(
            "font-display font-semibold leading-none tracking-[-0.06em]",
            size === "lg" ? "text-6xl" : "text-4xl",
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.32, ease }}
        >
          {score}
        </motion.span>
        <span className="mt-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Career health</span>
      </div>
    </motion.div>
  );
}

export function LevelBadge({ level }: { level: MissionPlan["level"] }) {
  const labels = {
    explorer: "Explorer",
    builder: "Builder",
    achiever: "Achiever",
    pro: "Pro",
  } as const;
  return (
    <Badge variant={level === "pro" || level === "achiever" ? "success" : "default"}>
      <ArrowUpRight className="size-3" aria-hidden="true" /> {labels[level]}
    </Badge>
  );
}

export function AchievementChip({
  title,
  description,
  unlocked,
}: {
  title: string;
  description: string;
  unlocked: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "flex min-h-28 items-start gap-3 rounded-xl border p-4",
        unlocked
          ? "border-success/20 bg-success/[0.06]"
          : "border-border bg-white/[0.025] text-muted-foreground",
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.12 }}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          unlocked ? "bg-success/12 text-success" : "bg-white/[0.04]",
        )}
      >
        {unlocked ? <Trophy className="size-4" /> : <LockKeyhole className="size-4" />}
      </span>
      <div>
        <p className={cn("text-xs font-semibold", unlocked && "text-foreground")}>{title}</p>
        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

export const dashboardEntrance = {
  hidden: { opacity: 0, y: 12 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.04, duration: 0.32, ease },
  }),
};
