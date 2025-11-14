"use client";

import { useCallback, useMemo, useState } from "react";
import Script from "next/script";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { GlassCard } from "@/components/primitives/glass-card";
import { GradientButton } from "@/components/primitives/gradient-button";
import { MotionDiv, useAuth, useFeedback } from "@/components/providers";
import { useCoinClaims } from "@/hooks/use-coin-claims";
import { useCoinRewards } from "@/hooks/use-coin-rewards";
import { PuzzleConfetti } from "@/components/puzzles/puzzle-confetti";

interface RazorpayOrderResponse {
  order: {
    id: string;
    amount: number;
    currency: string;
  };
  keyId: string;
  coins: number;
}

const formatDate = (value?: Date) => {
  if (!value) return "Pending timestamp";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(value);
};

export default function VaultPage() {
  const { user } = useAuth();
  const { notify } = useFeedback();
  const { config } = useCoinRewards();
  const { claims, totalCoins } = useCoinClaims(user?.uid);
  const [cashoutLoading, setCashoutLoading] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const sortedClaims = useMemo(
    () => [...claims].sort((a, b) => (b.claimedAt?.getTime() ?? 0) - (a.claimedAt?.getTime() ?? 0)),
    [claims]
  );

  const readyForCashout = totalCoins >= config.cashout.minCoins;

  const handleCashout = useCallback(async () => {
    if (!user) {
      notify({
        title: "Sign in to continue",
        description: "You need to be authenticated before requesting a payout.",
        variant: "info"
      });
      return;
    }

    if (!readyForCashout) {
      notify({
        title: "Not enough coins",
        description: `Reach ${config.cashout.minCoins.toLocaleString()} coins to unlock cashout.`,
        variant: "info"
      });
      return;
    }

    if (!window.Razorpay) {
      notify({
        title: "Checkout unavailable",
        description: "Razorpay SDK has not loaded yet. Please wait a moment and retry.",
        variant: "error"
      });
      return;
    }

    setCashoutLoading(true);
    try {
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ coins: totalCoins })
      });

      if (!response.ok) {
        throw new Error("Unable to initialise Razorpay order");
      }

      const payload = (await response.json()) as RazorpayOrderResponse;
      const RazorpayCtor = window.Razorpay;

      const options = {
        key: payload.keyId,
        amount: payload.order.amount,
        currency: payload.order.currency,
        name: "Gamy Ludo Vault",
        description: `Cashout for ${payload.coins.toLocaleString()} coins`,
        order_id: payload.order.id,
        prefill: {
          email: user.email ?? undefined,
          name: user.displayName ?? undefined
        },
        notes: {
          coins: payload.coins,
          uid: user.uid
        },
        handler: () => {
          notify({
            title: "Cashout initiated",
            description: "Razorpay checkout complete. Track settlement in your Razorpay dashboard.",
            variant: "success"
          });
        }
      };

      const checkout = new RazorpayCtor(options);
      checkout.open();
    } catch (error) {
      console.error("Failed to initiate cashout", error);
      notify({
        title: "Cashout failed",
        description: error instanceof Error ? error.message : "Try again in a few moments.",
        variant: "error"
      });
    } finally {
      setCashoutLoading(false);
    }
  }, [config.cashout.minCoins, notify, readyForCashout, totalCoins, user]);

  const handleReveal = useCallback(
    (fragmentId: string) => {
      let alreadyVisible = false;
      setRevealed((prev) => {
        alreadyVisible = Boolean(prev[fragmentId]);
        if (alreadyVisible) {
          return prev;
        }
        return { ...prev, [fragmentId]: true };
      });
      if (alreadyVisible) {
        notify({
          title: "Already revealed",
          description: "This fragment is visible—copy it whenever you're ready.",
          variant: "info"
        });
        return;
      }
      setShowConfetti(true);
      window.setTimeout(() => setShowConfetti(false), 2000);
      notify({
        title: "Reward unlocked",
        description: "Fragment details revealed. Copy or redeem before the timer cools down!",
        variant: "success"
      });
    },
    [notify]
  );

  const handleCopy = useCallback(
    async (fragmentId: string, code?: string | null) => {
      if (!code) {
        notify({
          title: "Nothing to copy",
          description: "This fragment doesn't expose a redemption code.",
          variant: "info"
        });
        return;
      }
      try {
        await navigator.clipboard.writeText(code);
        setCopied(fragmentId);
        window.setTimeout(() => setCopied((current) => (current === fragmentId ? null : current)), 2000);
        notify({
          title: "Copied to clipboard",
          description: "Share the shard or redeem it instantly.",
          variant: "success"
        });
      } catch (error) {
        console.error("Unable to copy reward code", error);
        notify({
          title: "Copy failed",
          description: "Clipboard access was blocked. Try again manually.",
          variant: "error"
        });
      }
    },
    [notify]
  );

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <PuzzleConfetti show={showConfetti} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.25),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(79,70,229,0.18),_transparent_60%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-24 pt-24">
        <header className="space-y-6 text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200"
          >
            Vault resonance stable
          </MotionDiv>
          <h1 className="text-4xl font-semibold md:text-5xl">Your assembled fragments</h1>
          <p className="mx-auto max-w-2xl text-base text-white/70 md:text-lg">
            Every fragment you reserve feeds this vault. Monitor totals, review your claim history, and trigger Razorpay payout when the cashout threshold is met.
          </p>
        </header>

        <GlassCard className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Total coins</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-200">{totalCoins.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Fragments secured</p>
            <p className="mt-2 text-3xl font-semibold text-sky-200">{claims.length}</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Cashout threshold</p>
            <p className="text-sm text-white/70">
              {config.cashout.minCoins.toLocaleString()} coins · {config.cashout.exchangeRate} {config.cashout.currency} per coin
            </p>
            <GradientButton type="button" onClick={handleCashout} disabled={!readyForCashout || cashoutLoading}>
              {cashoutLoading ? "Launching Razorpay…" : readyForCashout ? "Cash out" : "Keep collecting"}
            </GradientButton>
          </div>
        </GlassCard>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Fragment vault</h2>
              <p className="text-sm text-white/60">
                Reveal stored shards, copy redemption intel, and surface Razorpay receipts for accounting.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 uppercase tracking-[0.3em] text-emerald-200">
                Grid synced
              </span>
              <span>Updated automatically on new claims</span>
            </div>
          </div>
        </div>

        {sortedClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-16 text-white/50">
            <p className="text-sm uppercase tracking-[0.4em]">No fragments claimed yet</p>
            <p className="mt-3 text-sm">Explore the unlock protocol to reserve your first shard.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {sortedClaims.map((claim) => {
              const code = claim.redemptionCode ?? claim.fragmentId;
              const isRevealed = revealed[claim.fragmentId] ?? false;
              const isCopied = copied === claim.fragmentId;
              return (
                <GlassCard
                  key={claim.fragmentId}
                  className="flex h-full flex-col justify-between border-white/5 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Fragment</p>
                        <p className="text-xl font-semibold text-white">{claim.title ?? claim.fragmentId}</p>
                      </div>
                      {claim.rarity ? (
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                          {claim.rarity}
                        </span>
                      ) : null}
                    </div>
                    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                      <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Redemption code</p>
                      <p
                        className={`mt-2 font-mono text-lg tracking-wide text-emerald-100 ${
                          isRevealed ? "blur-0" : "blur-md"
                        } transition-all duration-500`}
                      >
                        {code ?? "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/60">
                      <span>Claimed {formatDate(claim.claimedAt)}</span>
                      <span>+{claim.coins.toLocaleString()} coins</span>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 md:flex-row">
                    {!isRevealed ? (
                      <button
                        type="button"
                        onClick={() => handleReveal(claim.fragmentId)}
                        className="flex-1 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-400/50 hover:bg-sky-500/20"
                      >
                        Reveal code
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCopy(claim.fragmentId, code)}
                        className="flex-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400/60 hover:bg-emerald-500/20"
                      >
                        {isCopied ? "Copied!" : "Copy code"}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!claim.receiptUrl}
                      onClick={() => claim.receiptUrl && window.open(claim.receiptUrl, "_blank", "noopener")}
                      className="flex-1 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {claim.receiptUrl ? "View Razorpay receipt" : "Receipt pending"}
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}
