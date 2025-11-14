"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";

import { firebaseFirestore } from "@/lib/firebase/client";
import { defaultAdminAnalytics, type AdminAnalytics } from "@/lib/admin";

const mapNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const mapNumberArray = (value: unknown, fallback: number[]): number[] =>
  Array.isArray(value) && value.length
    ? value.map((item) => mapNumber(item))
    : fallback;

const mapRetention = (value: unknown, fallback: AdminAnalytics["retention"]): AdminAnalytics["retention"] => {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((entry) =>
      typeof entry === "object" && entry
        ? {
            label: "label" in entry && typeof entry.label === "string" ? entry.label : "",
            percentage: mapNumber((entry as Record<string, unknown>).percentage, 0)
          }
        : null
    )
    .filter((entry): entry is { label: string; percentage: number } => Boolean(entry && entry.label));
};

const mapRegions = (value: unknown, fallback: AdminAnalytics["regions"]): AdminAnalytics["regions"] => {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((entry) =>
      typeof entry === "object" && entry
        ? {
            region: "region" in entry && typeof entry.region === "string" ? entry.region : "",
            percentage: mapNumber((entry as Record<string, unknown>).percentage, 0)
          }
        : null
    )
    .filter((entry): entry is { region: string; percentage: number } => Boolean(entry && entry.region));
};

const mapMonetization = (
  value: unknown,
  fallback: AdminAnalytics["monetization"]
): AdminAnalytics["monetization"] => {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((entry) =>
      typeof entry === "object" && entry
        ? {
            plan: "plan" in entry && typeof entry.plan === "string" ? entry.plan : "",
            conversions: mapNumber((entry as Record<string, unknown>).conversions, 0),
            revenue: mapNumber((entry as Record<string, unknown>).revenue, 0)
          }
        : null
    )
    .filter((entry): entry is { plan: string; conversions: number; revenue: number } => Boolean(entry && entry.plan));
};

const mapCreators = (value: unknown, fallback: AdminAnalytics["topCreators"]): AdminAnalytics["topCreators"] => {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((entry) =>
      typeof entry === "object" && entry
        ? {
            name: "name" in entry && typeof entry.name === "string" ? entry.name : "",
            drops: mapNumber((entry as Record<string, unknown>).drops, 0),
            revenue: mapNumber((entry as Record<string, unknown>).revenue, 0)
          }
        : null
    )
    .filter((entry): entry is { name: string; drops: number; revenue: number } => Boolean(entry && entry.name));
};

interface UseAdminAnalyticsResult {
  analytics: AdminAnalytics;
  loading: boolean;
  error: FirestoreError | null;
  lastUpdated?: Date;
}

export const useAdminAnalytics = (): UseAdminAnalyticsResult => {
  const [analytics, setAnalytics] = useState<AdminAnalytics>(defaultAdminAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const ref = doc(firebaseFirestore, "adminMetrics", "overview");
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data() as Partial<AdminAnalytics> | undefined;
        if (data) {
          setAnalytics({
            ...defaultAdminAnalytics,
            ...data,
            playersOnline: mapNumber(data.playersOnline, defaultAdminAnalytics.playersOnline),
            coinsMinted: mapNumber(data.coinsMinted, defaultAdminAnalytics.coinsMinted),
            activeRooms: mapNumber(data.activeRooms, defaultAdminAnalytics.activeRooms),
            conversionRate: mapNumber(data.conversionRate, defaultAdminAnalytics.conversionRate),
            conversionDelta: mapNumber(data.conversionDelta, defaultAdminAnalytics.conversionDelta),
            dailyRevenue: mapNumber(data.dailyRevenue, defaultAdminAnalytics.dailyRevenue),
            revenueDelta: mapNumber(data.revenueDelta, defaultAdminAnalytics.revenueDelta),
            avgSessionMinutes: mapNumber(data.avgSessionMinutes, defaultAdminAnalytics.avgSessionMinutes),
            hourlyEngagement: mapNumberArray(data.hourlyEngagement, defaultAdminAnalytics.hourlyEngagement),
            mintSparkline: mapNumberArray(data.mintSparkline, defaultAdminAnalytics.mintSparkline),
            retention: mapRetention(data.retention, defaultAdminAnalytics.retention),
            regions: mapRegions(data.regions, defaultAdminAnalytics.regions),
            monetization: mapMonetization(data.monetization, defaultAdminAnalytics.monetization),
            topCreators: mapCreators(data.topCreators, defaultAdminAnalytics.topCreators),
            updatedAt: data.updatedAt ?? defaultAdminAnalytics.updatedAt
          });
        } else {
          setAnalytics(defaultAdminAnalytics);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to subscribe to admin analytics", err);
        setError(err);
        setAnalytics(defaultAdminAnalytics);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const lastUpdated = useMemo(() => {
    const value = analytics.updatedAt;
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
      return new Date(value.seconds * 1000 + (typeof value.nanoseconds === "number" ? value.nanoseconds / 1_000_000 : 0));
    }
    return undefined;
  }, [analytics.updatedAt]);

  return useMemo(
    () => ({ analytics, loading, error, lastUpdated }),
    [analytics, error, lastUpdated, loading]
  );
};
