"use client";

import { useMemo } from "react";
import type { HTMLAttributes } from "react";
import { motion } from "framer-motion";

import { cn } from "@/components/lib/utils";

export interface ProgressRingProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  size?: number;
  strokeWidth?: number;
  gradientId?: string;
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  gradientId = "progress-ring-gradient",
  className,
  ...props
}: ProgressRingProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const strokeDashoffset = useMemo(
    () => circumference - (normalizedValue / 100) * circumference,
    [circumference, normalizedValue]
  );

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 via-transparent to-purple-500/20 p-3",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148, 163, 184, 0.3)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
        <span>{Math.round(normalizedValue)}%</span>
      </div>
    </div>
  );
}
