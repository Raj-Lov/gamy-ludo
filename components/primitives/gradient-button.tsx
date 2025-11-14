"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

import { MotionDiv } from "@/components/providers";
import { Button } from "@/components/ui/button";

export interface GradientButtonProps extends ComponentPropsWithoutRef<typeof Button> {}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ children, ...props }, ref) => {
    return (
      <MotionDiv whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button ref={ref} variant="gradient" {...props}>
          {children}
        </Button>
      </MotionDiv>
    );
  }
);

GradientButton.displayName = "GradientButton";
