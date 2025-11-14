"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { MotionDiv, useAuth, useFeedback } from "@/components/providers";
import { FragmentCard } from "@/components/rewards/fragment-card";
import { GradientButton } from "@/components/primitives/gradient-button";
import { GlassCard } from "@/components/primitives/glass-card";
import { reserveCoinReward } from "@/lib/rewards";
import { useCoinRewards } from "@/hooks/use-coin-rewards";
import { useCoinClaims } from "@/hooks/use-coin-claims";

const ensureConfettiStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("unlock-confetti-style")) return;
  const style = document.createElement("style");
  style.id = "unlock-confetti-style";
  style.textContent = `@keyframes unlock-confetti-fall {\n  0% { transform: translate3d(0, -12vh, 0) rotate(0deg); opacity: 0; }\n  15% { opacity: 1; }\n  100% { transform: translate3d(var(--confetti-shift, 0), 110vh, 0) rotate(720deg); opacity: 0; }\n}`;
  document.head.appendChild(style);
};

const triggerConfetti = () => {
  if (typeof document === "undefined") return;
  ensureConfettiStyles();
  const container = document.createElement("div");
  container.className = "pointer-events-none fixed inset-0 z-[200] overflow-hidden";
  const colors = ["#34d399", "#f472b6", "#60a5fa", "#fbbf24", "#c084fc"];
  const pieces = 160;

  for (let index = 0; index < pieces; index += 1) {
    const piece = document.createElement("span");
    piece.className = "absolute block h-2 w-1.5 rounded-full";
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = "-6%";
    piece.style.opacity = "0";
    piece.style.animationName = "unlock-confetti-fall";
    piece.style.animationDuration = `${0.9 + Math.random() * 0.6}s`;
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    piece.style.animationTimingFunction = "cubic-bezier(0.15, 0.65, 0.35, 1)";
    piece.style.animationFillMode = "forwards";
    piece.style.setProperty("--confetti-shift", `${(Math.random() * 40 - 20).toFixed(2)}vw`);
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(piece);
  }

  document.body.appendChild(container);
  window.setTimeout(() => container.remove(), 1600);
};

export default function UnlockPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { notify } = useFeedback();
  const { config, loading: configLoading } = useCoinRewards();
  const { claims, claimMap, totalCoins, loading: claimLoading } = useCoinClaims(user?.uid);
  const [pendingFragmentId, setPendingFragmentId] = useState<string | null>(null);

  const handleRequireAuth = useCallback(() => {
    if (!user && !authLoading) {
      router.push("/login");
      notify({
        title: "Sign in required",
        description: "Authenticate to reserve fragments and capture rewards.",
        variant: "info"
      });
      return true;
    }
    return false;
  }, [authLoading, notify, router, user]);

  const handleClaim = useCallback(
    async (fragmentId: string) => {
      if (handleRequireAuth()) return;
      if (!user) return;
      setPendingFragmentId(fragmentId);
      try {
        const result = await reserveCoinReward(user.uid, fragmentId);
        triggerConfetti();
        notify({
          title: `+${result.coinsAwarded.toLocaleString()} coins claimed`,
          description: `${result.fragment.title} is now bonded to your vault.`,
          variant: "success"
        });
      } catch (error) {
        console.error("Failed to reserve fragment", error);
        const message =
          error instanceof Error ? error.message : "Unable to reserve the selected fragment right now.";
        notify({
          title: "Claim failed",
          description: message,
          variant: "error"
        });
      } finally {
        setPendingFragmentId(null);
      }
    },
    [handleRequireAuth, notify, user]
  );

  const totalFragmentsClaimed = claims.length;

  const isLoading = configLoading || claimLoading;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-slate-950 to-slate-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(168,85,247,0.18),_transparent_60%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-24">
        <header className="space-y-6 text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-sky-200"
          >
            Fragment Unlock Protocol
          </MotionDiv>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Assemble the vault, fragment by fragment.
          </h1>
          <p className="mx-auto max-w-2xl text-base text-white/70 md:text-lg">
            Claim rare shards curated by the admin team. Each fragment deposits coins directly into your vault, ready for cashout when you hit the threshold.
          </p>
        </header>

        <GlassCard className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Total coins</p>
            <p className="mt-2 text-3xl font-semibold text-sky-200">{totalCoins.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Fragments bonded</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-200">{totalFragmentsClaimed}</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Cashout readiness</p>
            <p className="text-sm text-white/70">
              Reach {config.cashout.minCoins.toLocaleString()} coins to unlock Razorpay payout at {config.cashout.exchangeRate} {config.cashout.currency} per coin.
            </p>
            <GradientButton type="button" onClick={() => router.push("/vault")}>
              Open vault
            </GradientButton>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/60">
            <span className="text-sm uppercase tracking-[0.4em]">Calibrating fragments…</span>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {config.fragments.map((fragment) => (
              <FragmentCard
                key={fragment.id}
                fragment={fragment}
                claimed={Boolean(claimMap[fragment.id])}
                pending={pendingFragmentId === fragment.id}
                onClaim={() => handleClaim(fragment.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
