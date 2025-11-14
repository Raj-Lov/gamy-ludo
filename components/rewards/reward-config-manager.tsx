"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Trash2, Wand2 } from "lucide-react";

import { GlassCard } from "@/components/primitives/glass-card";
import { GradientButton } from "@/components/primitives/gradient-button";
import { MotionDiv, useFeedback } from "@/components/providers";
import { cn } from "@/components/lib/utils";
import { useCoinRewards } from "@/hooks/use-coin-rewards";
import type { CoinFragment, CoinRewardConfig } from "@/lib/rewards";
import { defaultCoinRewardConfig } from "@/lib/rewards";
import { firebaseFirestore } from "@/lib/firebase/client";

interface DraftState extends CoinRewardConfig {}

interface RewardConfigManagerProps {
  className?: string;
}

const createFragmentTemplate = (): CoinFragment => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `fragment-${Math.random().toString(36).slice(2)}`,
  title: "New Fragment",
  description: "Describe the boost unlocked by this fragment.",
  value: 0,
  rarity: "common",
  accent: "from-slate-300 via-slate-400 to-slate-500",
  glow: "shadow-[0_0_30px_rgba(148,163,184,0.35)]"
});

export const RewardConfigManager = ({ className }: RewardConfigManagerProps) => {
  const { config, loading } = useCoinRewards();
  const { notify } = useFeedback();
  const [draft, setDraft] = useState<DraftState>(defaultCoinRewardConfig);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(config);
    setDirty(false);
  }, [config]);

  const updateFragment = useCallback(
    <K extends keyof CoinFragment>(fragmentId: string, key: K, value: CoinFragment[K]) => {
      setDraft((current) => ({
        ...current,
        fragments: current.fragments.map((fragment) =>
          fragment.id === fragmentId ? { ...fragment, [key]: value } : fragment
        )
      }));
      setDirty(true);
    },
    []
  );

  const updateCashout = useCallback(<K extends keyof DraftState["cashout"]>(key: K, value: DraftState["cashout"][K]) => {
    setDraft((current) => ({
      ...current,
      cashout: {
        ...current.cashout,
        [key]: value
      }
    }));
    setDirty(true);
  }, []);

  const addFragment = useCallback(() => {
    setDraft((current) => ({
      ...current,
      fragments: [...current.fragments, createFragmentTemplate()]
    }));
    setDirty(true);
  }, []);

  const removeFragment = useCallback((fragmentId: string) => {
    setDraft((current) => ({
      ...current,
      fragments: current.fragments.filter((fragment) => fragment.id !== fragmentId)
    }));
    setDirty(true);
  }, []);

  const handlePersist = useCallback(async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(firebaseFirestore, "config", "coinRewards"),
        {
          ...draft,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      notify({
        title: "Reward config updated",
        description: "Players will see the new fragment values immediately.",
        variant: "success"
      });
      setDirty(false);
    } catch (error) {
      console.error("Failed to persist coin rewards", error);
      notify({
        title: "Unable to save",
        description: error instanceof Error ? error.message : "Check your connection and try again.",
        variant: "error"
      });
    } finally {
      setSaving(false);
    }
  }, [draft, notify]);

  const totalRewardValue = useMemo(
    () => draft.fragments.reduce((sum, fragment) => sum + (fragment.value ?? 0), 0),
    [draft.fragments]
  );

  return (
    <section className={cn("flex flex-col gap-8", className)}>
      <MotionDiv
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Reward orchestration</h2>
            <p className="text-sm text-white/60">
              Tune fragment values, rarity, and cashout thresholds. Changes apply instantly across unlock and vault flows.
            </p>
          </div>
          <GradientButton type="button" onClick={handlePersist} disabled={!dirty || saving}>
            {saving ? "Saving" : "Save configuration"}
          </GradientButton>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="space-y-1 border-white/10 bg-white/[0.03]">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Status</p>
            <p className="text-lg font-semibold text-white">
              {loading ? "Fetching configuration…" : dirty ? "Unsaved changes" : "Synced"}
            </p>
          </GlassCard>
          <GlassCard className="space-y-1 border-white/10 bg-white/[0.03]">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Fragments</p>
            <p className="text-lg font-semibold text-sky-200">{draft.fragments.length}</p>
          </GlassCard>
          <GlassCard className="space-y-1 border-white/10 bg-white/[0.03]">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Total coin yield</p>
            <p className="text-lg font-semibold text-sky-200">{totalRewardValue.toLocaleString()} coins</p>
          </GlassCard>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addFragment}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <Wand2 className="h-4 w-4" />
            Add fragment
          </button>
        </div>
      </MotionDiv>

      <div className="grid gap-6 md:grid-cols-2">
        {draft.fragments.map((fragment) => (
          <GlassCard key={fragment.id} className="space-y-4 border-white/10 bg-white/[0.03]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">Fragment ID</p>
                <p className="text-sm text-white/60">{fragment.id}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFragment(fragment.id)}
                className="text-xs uppercase tracking-[0.3em] text-red-300 transition hover:text-red-200"
              >
                <Trash2 className="mr-1 inline-block h-4 w-4" /> Remove
              </button>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">Title</span>
              <input
                value={fragment.title}
                onChange={(event) => updateFragment(fragment.id, "title", event.target.value)}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">Description</span>
              <textarea
                value={fragment.description}
                onChange={(event) => updateFragment(fragment.id, "description", event.target.value)}
                className="min-h-[96px] rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Value</span>
                <input
                  type="number"
                  value={fragment.value}
                  onChange={(event) => updateFragment(fragment.id, "value", Number(event.target.value) || 0)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Rarity</span>
                <select
                  value={fragment.rarity}
                  onChange={(event) => updateFragment(fragment.id, "rarity", event.target.value as CoinFragment["rarity"])}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                >
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Accent gradient</span>
                <input
                  value={fragment.accent}
                  onChange={(event) => updateFragment(fragment.id, "accent", event.target.value)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs uppercase tracking-[0.3em] text-white/40">Glow utility class</span>
              <input
                value={fragment.glow}
                onChange={(event) => updateFragment(fragment.id, "glow", event.target.value)}
                className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
              />
            </label>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="space-y-4 border-white/10 bg-white/[0.03]">
        <h3 className="text-xl font-semibold text-white">Cashout policy</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Minimum coins</span>
            <input
              type="number"
              value={draft.cashout.minCoins}
              onChange={(event) => updateCashout("minCoins", Number(event.target.value) || 0)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Exchange rate</span>
            <input
              type="number"
              step="0.01"
              value={draft.cashout.exchangeRate}
              onChange={(event) => updateCashout("exchangeRate", Number(event.target.value) || 0)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Currency</span>
            <input
              value={draft.cashout.currency}
              onChange={(event) => updateCashout("currency", event.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
            />
          </label>
        </div>
      </GlassCard>
    </section>
  );
};

export default RewardConfigManager;
