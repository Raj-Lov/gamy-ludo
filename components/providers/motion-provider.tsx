"use client";

import { LazyMotion, domAnimation, type MotionProps, m } from "framer-motion";
import type { PropsWithChildren } from "react";

export function MotionProvider({ children }: PropsWithChildren) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}

export const MotionDiv = m.div;
export const MotionSpan = m.span;
export type { MotionProps };
