"use client";

import clsx from "clsx";

interface StreakFlameProps {
  streak: number;
  label?: string;
}

export const StreakFlame = ({ streak, label = "Day streak" }: StreakFlameProps) => {
  const intensity = Math.min(1, streak / 30);
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-orange-500/40 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent px-5 py-4 shadow-inner shadow-orange-500/20">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />
        <div
          className={clsx(
            "absolute inset-2 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-transparent",
            "animate-flame"
          )}
          style={{
            filter: `drop-shadow(0 0 ${8 + intensity * 12}px rgba(251, 191, 36, 0.85))`
          }}
        />
        <div className="absolute inset-4 rounded-full bg-orange-200/30 blur-sm" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-300/80">{label}</p>
        <p className="text-3xl font-semibold text-amber-100">{streak}🔥</p>
      </div>
    </div>
  );
};
