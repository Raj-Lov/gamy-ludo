"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";

import { MotionDiv } from "@/components/providers";
import type { CoinFragment } from "@/lib/rewards";
import { GradientButton } from "@/components/primitives/gradient-button";

interface FragmentCardProps {
  fragment: CoinFragment;
  claimed: boolean;
  pending: boolean;
  onClaim: () => void;
}

const rarityCopy: Record<CoinFragment["rarity"], string> = {
  common: "Common Fragment",
  rare: "Rare Fragment",
  epic: "Epic Fragment",
  legendary: "Legendary Fragment"
};

export const FragmentCard = ({ fragment, claimed, pending, onClaim }: FragmentCardProps) => {
  const rotation = useMemo(() => {
    const base = fragment.id.length * 17;
    const tilt = (base % 15) - 7;
    return {
      rotateX: -12 + (base % 4),
      rotateY: tilt,
      rotateZ: (base % 3) * 2
    };
  }, [fragment.id]);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_-28px_rgba(15,118,255,0.35)] backdrop-blur-xl"
    >
      <MotionDiv
        className={`pointer-events-none absolute -left-16 top-10 h-52 w-52 rounded-full bg-gradient-to-br ${fragment.accent} blur-3xl opacity-60 transition group-hover:opacity-100`}
        animate={{ rotateZ: [0, 12, -10, 0] }}
        transition={{ repeat: Infinity, duration: 24, ease: "easeInOut" }}
      />
      <MotionDiv
        style={{ transformStyle: "preserve-3d" }}
        className="relative mx-auto mb-6 flex h-48 w-48 items-center justify-center"
        animate={{ rotateX: rotation.rotateX, rotateY: rotation.rotateY, rotateZ: rotation.rotateZ }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
      >
        <div
          className={`relative flex h-40 w-40 items-center justify-center rounded-[20px] bg-gradient-to-br ${fragment.accent} ${fragment.glow}`}
          style={{ transform: "rotateX(15deg) rotateY(-8deg)" }}
        >
          <div className="absolute inset-[2px] rounded-[18px] bg-black/35 backdrop-blur" />
          <Sparkles className="relative h-8 w-8 text-white/90 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
        </div>
        <div className="absolute inset-0 rounded-[22px] border border-white/10" style={{ transform: "translateZ(18px)" }} />
      </MotionDiv>
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-white/50">{rarityCopy[fragment.rarity]}</p>
        <h3 className="text-2xl font-semibold text-white drop-shadow-sm">{fragment.title}</h3>
        <p className="text-sm text-white/70">{fragment.description}</p>
        <p className="text-lg font-semibold text-sky-200">
          +{fragment.value.toLocaleString()} coins
        </p>
      </div>
      <div className="mt-6 flex justify-center">
        <GradientButton
          type="button"
          onClick={onClaim}
          disabled={claimed || pending}
          className="min-w-[160px]"
        >
          {claimed ? "Claimed" : pending ? "Reserving..." : "Claim fragment"}
        </GradientButton>
      </div>
    </MotionDiv>
  );
};
