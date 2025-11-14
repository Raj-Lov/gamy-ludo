"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type FirestoreError,
  type QueryDocumentSnapshot
} from "firebase/firestore";

import { firebaseFirestore } from "@/lib/firebase/client";
import type { CoinCode } from "@/lib/admin";

const mapTimestamp = (value: unknown) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as { seconds?: unknown }).seconds === "number"
  ) {
    const timestamp = value as { seconds: number; nanoseconds?: number };
    return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds ?? 0) / 1_000_000);
  }
  return undefined;
};

const mapDocument = (snapshot: QueryDocumentSnapshot): CoinCode => {
  const data = snapshot.data() as Partial<CoinCode>;
  return {
    id: snapshot.id,
    code: typeof data.code === "string" ? data.code : snapshot.id,
    amount: typeof data.amount === "number" ? data.amount : 0,
    priceInr: typeof data.priceInr === "number" ? data.priceInr : 0,
    status:
      data.status === "active" || data.status === "redeemed" || data.status === "expired" || data.status === "disabled"
        ? data.status
        : "active",
    usageCount: typeof data.usageCount === "number" ? data.usageCount : 0,
    maxUses: typeof data.maxUses === "number" ? data.maxUses : 1,
    planId: typeof data.planId === "string" ? data.planId : "",
    notes: typeof data.notes === "string" ? data.notes : "",
    expiresAt: mapTimestamp(data.expiresAt ?? null),
    createdAt: mapTimestamp(data.createdAt ?? null),
    updatedAt: mapTimestamp(data.updatedAt ?? null)
  };
};

interface UseCoinCodesResult {
  codes: CoinCode[];
  loading: boolean;
  error: FirestoreError | null;
}

export const useCoinCodes = (max = 300): UseCoinCodesResult => {
  const [codes, setCodes] = useState<CoinCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const ref = collection(firebaseFirestore, "coinCodes");
    const q = query(ref, orderBy("createdAt", "desc"), limit(max));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setCodes(snapshot.docs.map(mapDocument));
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load coin codes", err);
        setCodes([]);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [max]);

  return useMemo(() => ({ codes, loading, error }), [codes, error, loading]);
};
