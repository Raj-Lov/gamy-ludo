"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, type FirestoreError, type Timestamp } from "firebase/firestore";

import { firebaseFirestore } from "@/lib/firebase/client";
import {
  claimDailyLoginBonus,
  claimWatchReward,
  computeDailyBonusReward,
  defaultEngagementConfig,
  type DailyBonusClaimResult,
  type EngagementConfig,
  type WatchRewardClaimResult
} from "@/lib/engagement";

const formatDateId = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);

const hydrateTimestamp = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (typeof (value as Timestamp)?.toDate === "function") {
    return (value as Timestamp).toDate();
  }
  return undefined;
};

interface DailyBonusState {
  lastClaimDate?: string;
  lastClaimedAt?: Date;
  streak: number;
  totalClaims: number;
  lastReward: number;
}

interface WatchEarnState {
  lastWatchDate?: string;
  lastWatchedAt?: Date;
  watchesToday: number;
  totalViews: number;
  lastReward: number;
}

interface EngagementProgressState {
  dailyBonus: DailyBonusState;
  watchAndEarn: WatchEarnState;
}

const defaultProgress: EngagementProgressState = {
  dailyBonus: {
    streak: 0,
    totalClaims: 0,
    lastReward: 0
  },
  watchAndEarn: {
    watchesToday: 0,
    totalViews: 0,
    lastReward: 0
  }
};

export interface UseEngagementRewardsResult {
  config: EngagementConfig;
  loading: boolean;
  error: FirestoreError | null;
  dailyBonus: {
    streak: number;
    nextStreak: number;
    available: boolean;
    reward: number;
    lastClaimDate?: string;
    lastClaimedAt?: Date;
    claiming: boolean;
    claim: () => Promise<DailyBonusClaimResult>;
  };
  watchAndEarn: {
    available: boolean;
    remainingToday: number;
    reward: number;
    cooldownMinutes: number;
    maxViewsPerDay: number;
    nextAvailableAt: Date | null;
    lastWatchedAt?: Date;
    claiming: boolean;
    claim: () => Promise<WatchRewardClaimResult>;
  };
}

export const useEngagementRewards = (userId?: string | null): UseEngagementRewardsResult => {
  const [config, setConfig] = useState<EngagementConfig>(defaultEngagementConfig);
  const [progress, setProgress] = useState<EngagementProgressState>(defaultProgress);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [claimingWatch, setClaimingWatch] = useState(false);

  useEffect(() => {
    const ref = doc(firebaseFirestore, "config", "engagement");
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data() as EngagementConfig | undefined;
        if (data) {
          setConfig({
            ...defaultEngagementConfig,
            ...data,
            dailyBonus: {
              ...defaultEngagementConfig.dailyBonus,
              ...data.dailyBonus
            },
            watchAndEarn: {
              ...defaultEngagementConfig.watchAndEarn,
              ...data.watchAndEarn
            }
          });
        } else {
          setConfig(defaultEngagementConfig);
        }
        setError(null);
        setLoadingConfig(false);
      },
      (err) => {
        console.error("Failed to load engagement config", err);
        setError(err);
        setLoadingConfig(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setProgress(defaultProgress);
      setLoadingProgress(false);
      return;
    }

    const ref = doc(firebaseFirestore, "userEngagement", userId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data() ?? {};
        const daily = data.dailyBonus ?? {};
        const watch = data.watchAndEarn ?? {};
        setProgress({
          dailyBonus: {
            streak: typeof daily.streak === "number" ? daily.streak : 0,
            totalClaims: typeof daily.totalClaims === "number" ? daily.totalClaims : 0,
            lastReward: typeof daily.lastReward === "number" ? daily.lastReward : 0,
            lastClaimDate: typeof daily.lastClaimDate === "string" ? daily.lastClaimDate : undefined,
            lastClaimedAt: hydrateTimestamp(daily.lastClaimedAt)
          },
          watchAndEarn: {
            watchesToday: typeof watch.watchesToday === "number" ? watch.watchesToday : 0,
            totalViews: typeof watch.totalViews === "number" ? watch.totalViews : 0,
            lastReward: typeof watch.lastReward === "number" ? watch.lastReward : 0,
            lastWatchDate: typeof watch.lastWatchDate === "string" ? watch.lastWatchDate : undefined,
            lastWatchedAt: hydrateTimestamp(watch.lastWatchedAt)
          }
        });
        setError(null);
        setLoadingProgress(false);
      },
      (err) => {
        console.error("Failed to load engagement progress", err);
        setError(err);
        setLoadingProgress(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const todayId = useMemo(() => formatDateId(new Date()), []);
  const yesterdayId = useMemo(() => formatDateId(new Date(Date.now() - 86400000)), []);

  const dailyBonus = useMemo(() => {
    const lastClaimDate = progress.dailyBonus.lastClaimDate;
    const claimedToday = lastClaimDate === todayId;
    const nextStreak = !claimedToday
      ? lastClaimDate === yesterdayId
        ? progress.dailyBonus.streak + 1
        : 1
      : progress.dailyBonus.streak;
    const reward = computeDailyBonusReward(
      config.dailyBonus,
      claimedToday ? progress.dailyBonus.streak || 1 : nextStreak
    );

    return {
      streak: progress.dailyBonus.streak,
      nextStreak,
      reward,
      available: Boolean(userId) && !claimedToday,
      lastClaimDate,
      lastClaimedAt: progress.dailyBonus.lastClaimedAt
    };
  }, [config.dailyBonus, progress.dailyBonus, todayId, userId, yesterdayId]);

  const watchAndEarn = useMemo(() => {
    const lastWatchDate = progress.watchAndEarn.lastWatchDate;
    const watchesToday = lastWatchDate === todayId ? progress.watchAndEarn.watchesToday : 0;
    const remainingToday = Math.max(0, config.watchAndEarn.maxViewsPerDay - watchesToday);
    const reward = Math.round(config.watchAndEarn.rewardPerView);
    const cooldownMs = config.watchAndEarn.cooldownMinutes * 60 * 1000;
    const now = Date.now();
    const lastWatchedAt = progress.watchAndEarn.lastWatchedAt;
    const nextAvailableAt = lastWatchedAt ? new Date(lastWatchedAt.getTime() + cooldownMs) : null;
    const available = Boolean(userId) && remainingToday > 0 && (!nextAvailableAt || nextAvailableAt.getTime() <= now);

    return {
      remainingToday,
      reward,
      cooldownMinutes: config.watchAndEarn.cooldownMinutes,
      maxViewsPerDay: config.watchAndEarn.maxViewsPerDay,
      nextAvailableAt: nextAvailableAt ?? (remainingToday > 0 ? new Date(now) : null),
      available,
      lastWatchedAt
    };
  }, [config.watchAndEarn, progress.watchAndEarn, todayId, userId]);

  const claimDaily = useCallback(async () => {
    if (!userId) {
      throw new Error("Sign in required to claim the daily bonus.");
    }
    setClaimingDaily(true);
    try {
      const result = await claimDailyLoginBonus(userId, config);
      setClaimingDaily(false);
      return result;
    } catch (err) {
      setClaimingDaily(false);
      throw err;
    }
  }, [config, userId]);

  const claimWatch = useCallback(async () => {
    if (!userId) {
      throw new Error("Sign in required to watch and earn.");
    }
    setClaimingWatch(true);
    try {
      const result = await claimWatchReward(userId, config);
      setClaimingWatch(false);
      return result;
    } catch (err) {
      setClaimingWatch(false);
      throw err;
    }
  }, [config, userId]);

  return {
    config,
    loading: loadingConfig || loadingProgress,
    error,
    dailyBonus: {
      streak: dailyBonus.streak,
      nextStreak: dailyBonus.nextStreak,
      reward: dailyBonus.reward,
      available: dailyBonus.available,
      lastClaimDate: dailyBonus.lastClaimDate,
      lastClaimedAt: dailyBonus.lastClaimedAt,
      claiming: claimingDaily,
      claim: claimDaily
    },
    watchAndEarn: {
      available: watchAndEarn.available,
      remainingToday: watchAndEarn.remainingToday,
      reward: watchAndEarn.reward,
      cooldownMinutes: watchAndEarn.cooldownMinutes,
      maxViewsPerDay: watchAndEarn.maxViewsPerDay,
      nextAvailableAt: watchAndEarn.nextAvailableAt,
      lastWatchedAt: watchAndEarn.lastWatchedAt,
      claiming: claimingWatch,
      claim: claimWatch
    }
  } satisfies UseEngagementRewardsResult;
};
