"use client";

import clsx from "clsx";

interface ProgressRingProps {
  label: string;
  value: number;
  metric: string;
  size?: number;
  accent?: string;
}

export const ProgressRing = ({
  label,
  value,
  metric,
  size = 140,
  accent = "#22c55e"
}: ProgressRingProps) => {
  const clamped = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="-rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-semibold text-foreground">
            {Math.round(clamped * 100)}%
          </span>
          <span className="text-xs uppercase tracking-widest text-white/50">{metric}</span>
        </div>
      </div>
      <p className={clsx("text-sm text-muted-foreground", clamped >= 1 && "text-emerald-300")}>{label}</p>
    </div>
  );
};
