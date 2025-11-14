"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/components/lib/utils";

interface PuzzleShellProps {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
  className?: string;
}

export const PuzzleShell = ({
  title,
  description,
  children,
  actions,
  status,
  className
}: PuzzleShellProps) => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 lg:px-8">
      <motion.header
        className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/80 p-6 shadow-xl shadow-primary/10 backdrop-blur"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>
        {status ? <div className="rounded-lg bg-muted/60 p-3 text-sm">{status}</div> : null}
      </motion.header>
      <motion.main
        className={cn(
          "relative rounded-2xl border border-border/60 bg-background/70 p-6 shadow-lg shadow-primary/5 backdrop-blur",
          className
        )}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 16, delay: 0.05 }}
      >
        {children}
      </motion.main>
    </div>
  );
};
