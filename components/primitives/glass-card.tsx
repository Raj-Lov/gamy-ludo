import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/components/lib/utils";

export function GlassCard({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-foreground shadow-glass backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 hover:shadow-glow",
        "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:bg-gradient-to-br before:from-white/15 before:via-white/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
