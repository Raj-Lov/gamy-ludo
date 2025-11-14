"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PuzzleStatProps {
  label: string;
  value: ReactNode;
}

export const PuzzleStats = ({ stats }: { stats: PuzzleStatProps[] }) => {
  if (!stats.length) return null;

  return (
    <motion.ul
      className="grid gap-3 sm:grid-cols-2"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        }
      }}
    >
      {stats.map((stat) => (
        <motion.li
          key={stat.label}
          className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/50 px-4 py-3 text-sm"
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        >
          <span className="text-muted-foreground">{stat.label}</span>
          <span className="font-semibold text-primary">{stat.value}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
};
