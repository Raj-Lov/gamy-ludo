"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, type FirestoreError, type Timestamp } from "firebase/firestore";

import { firebaseFirestore } from "@/lib/firebase/client";
import type { CoinClaimRecord } from "@/lib/rewards";

export interface CoinClaim {
  fragmentId: string;
  coins: number;
  rarity?: string;
  title?: string;
  claimedAt?: Date;
}

interface UseCoinClaimsResult {
  claims: CoinClaim[];
  claimMap: Record<string, CoinClaim>;
  totalCoins: number;
  loading: boolean;
  error: FirestoreError | null;
}

const hydrateClaim = (record: CoinClaimRecord): CoinClaim | null => {
  if (!record) return null;
  const fragmentId = typeof record.fragmentId === "string" ? record.fragmentId : undefined;
  const coins = typeof record.coins === "number" ? record.coins : undefined;
  if (!fragmentId || typeof coins !== "number") {
    return null;
  }
  const claimedAtValue = record.claimedAt;
  const claimedAt =
    claimedAtValue && typeof (claimedAtValue as Timestamp)?.toDate === "function"
      ? (claimedAtValue as Timestamp).toDate()
      : undefined;

  return {
    fragmentId,
    coins,
    rarity: typeof record.rarity === "string" ? record.rarity : undefined,
    title: typeof record.title === "string" ? record.title : undefined,
    claimedAt
  };
};

export const useCoinClaims = (userId?: string | null): UseCoinClaimsResult => {
  const [claims, setClaims] = useState<CoinClaim[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!userId) {
      setClaims([]);
      setTotalCoins(0);
      setLoading(false);
      return;
    }

    const ref = doc(firebaseFirestore, "coinClaims", userId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data();
        const claimed = data?.claimed ?? {};
        const hydrated = Object.values(claimed)
          .map((entry) => hydrateClaim(entry as CoinClaimRecord))
          .filter((entry): entry is CoinClaim => Boolean(entry));
        setClaims(hydrated);
        const coinsValue = data?.totalCoins;
        setTotalCoins(typeof coinsValue === "number" && Number.isFinite(coinsValue) ? coinsValue : 0);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load coin claims", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const claimMap = useMemo(
    () =>
      claims.reduce<Record<string, CoinClaim>>((acc, claim) => {
        acc[claim.fragmentId] = claim;
        return acc;
      }, {}),
    [claims]
  );

  return useMemo(
    () => ({ claims, claimMap, totalCoins, loading, error }),
    [claims, claimMap, error, loading, totalCoins]
  );
};
