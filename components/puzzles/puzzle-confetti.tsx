"use client";

import { Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";

const particles = Array.from({ length: 24 }, (_, index) => index);

export const PuzzleConfetti = ({ show }: { show: boolean }) => {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="confetti"
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative h-full w-full overflow-hidden">
            {particles.map((particle) => {
              const delay = particle * 0.04;
              const hue = (particle * 47) % 360;
              return (
                <Fragment key={particle}>
                  <motion.span
                    className="absolute text-3xl"
                    initial={{
                      top: "-10%",
                      left: `${(particle * 37) % 100}%`,
                      rotate: 0,
                      opacity: 0
                    }}
                    animate={{
                      top: "110%",
                      rotate: 360,
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                      duration: 2.2,
                      delay,
                      ease: "easeOut"
                    }}
                    style={{ color: `hsl(${hue} 85% 60%)` }}
                  >
                    •
                  </motion.span>
                </Fragment>
              );
            })}
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-primary"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 10 }}
            >
              🎉
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
