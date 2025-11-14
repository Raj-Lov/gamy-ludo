"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";

import { firebaseFirestore } from "@/lib/firebase/client";
import type { CoinRewardConfig } from "@/lib/rewards";
import { defaultCoinRewardConfig } from "@/lib/rewards";

interface UseCoinRewardsResult {
  config: CoinRewardConfig;
  loading: boolean;
  error: FirestoreError | null;
}

export const useCoinRewards = (): UseCoinRewardsResult => {
  const [config, setConfig] = useState<CoinRewardConfig>(defaultCoinRewardConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const ref = doc(firebaseFirestore, "config", "coinRewards");
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data() as CoinRewardConfig | undefined;
        if (data) {
          setConfig({
            ...defaultCoinRewardConfig,
            ...data,
            fragments: Array.isArray(data.fragments) && data.fragments.length > 0
              ? data.fragments
              : defaultCoinRewardConfig.fragments
          });
        } else {
          setConfig(defaultCoinRewardConfig);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load coin rewards config", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return useMemo(
    () => ({ config, loading, error }),
    [config, error, loading]
  );
};
