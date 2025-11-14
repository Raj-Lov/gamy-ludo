"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";

import { firebaseFirestore } from "@/lib/firebase/client";
import { defaultRazorpayPricing, type RazorpayPricingConfig } from "@/lib/admin";

interface UseRazorpayPricingResult {
  pricing: RazorpayPricingConfig;
  loading: boolean;
  error: FirestoreError | null;
}

export const useRazorpayPricing = (): UseRazorpayPricingResult => {
  const [pricing, setPricing] = useState<RazorpayPricingConfig>(defaultRazorpayPricing);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const ref = doc(firebaseFirestore, "config", "razorpayPricing");
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data() as Partial<RazorpayPricingConfig> | undefined;
        if (data) {
          setPricing({
            ...defaultRazorpayPricing,
            ...data,
            basePriceInr: typeof data.basePriceInr === "number" ? data.basePriceInr : defaultRazorpayPricing.basePriceInr,
            gstPercent: typeof data.gstPercent === "number" ? data.gstPercent : defaultRazorpayPricing.gstPercent,
            convenienceFeePercent:
              typeof data.convenienceFeePercent === "number"
                ? data.convenienceFeePercent
                : defaultRazorpayPricing.convenienceFeePercent,
            discountPercent:
              typeof data.discountPercent === "number" ? data.discountPercent : defaultRazorpayPricing.discountPercent,
            razorpayKey: typeof data.razorpayKey === "string" ? data.razorpayKey : defaultRazorpayPricing.razorpayKey,
            razorpaySecret:
              typeof data.razorpaySecret === "string" ? data.razorpaySecret : defaultRazorpayPricing.razorpaySecret,
            plans:
              Array.isArray(data.plans) && data.plans.length
                ? data.plans.map((plan, index) => ({
                    id:
                      typeof plan?.id === "string" && plan.id.trim() !== ""
                        ? plan.id
                        : defaultRazorpayPricing.plans[index]?.id ?? `plan-${index + 1}`,
                    label:
                      typeof plan?.label === "string"
                        ? plan.label
                        : defaultRazorpayPricing.plans[index]?.label ?? `Plan ${index + 1}`,
                    coins:
                      typeof plan?.coins === "number"
                        ? plan.coins
                        : defaultRazorpayPricing.plans[index]?.coins ?? 1000,
                    amountInr:
                      typeof plan?.amountInr === "number"
                        ? plan.amountInr
                        : defaultRazorpayPricing.plans[index]?.amountInr ?? 99,
                    active: plan?.active !== false
                  }))
                : defaultRazorpayPricing.plans,
            updatedAt: data.updatedAt ?? defaultRazorpayPricing.updatedAt
          });
        } else {
          setPricing(defaultRazorpayPricing);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to subscribe to Razorpay pricing", err);
        setError(err);
        setPricing(defaultRazorpayPricing);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return useMemo(() => ({ pricing, loading, error }), [pricing, error, loading]);
};
