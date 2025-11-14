import {
  doc,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type Firestore,
  type Timestamp
} from "firebase/firestore";

import { firebaseFirestore } from "./firebase/client.ts";
import type { CoinClaimRecord } from "./rewards";

const formatDateId = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);

const getPreviousDateId = (date: Date) => {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return formatDateId(previous);
};

const getTomorrowMidnight = (date: Date) => {
  const next = new Date(date);
  next.setHours(24, 0, 0, 0);
  return next;
};

export interface DailyBonusConfig {
  baseReward: number;
  streakMultipliers: number[];
  capStreak: number;
}

export interface WatchAndEarnConfig {
  rewardPerView: number;
  cooldownMinutes: number;
  maxViewsPerDay: number;
}

export interface EngagementConfig {
  dailyBonus: DailyBonusConfig;
  watchAndEarn: WatchAndEarnConfig;
  updatedAt?: unknown;
}

export const defaultEngagementConfig: EngagementConfig = {
  dailyBonus: {
    baseReward: 120,
    streakMultipliers: [1, 1.2, 1.5, 1.8, 2, 2.25, 2.5],
    capStreak: 14
  },
  watchAndEarn: {
    rewardPerView: 80,
    cooldownMinutes: 30,
    maxViewsPerDay: 5
  }
};

interface CoinClaimsDocument extends DocumentData {
  totalCoins?: number;
  claimed?: Record<string, CoinClaimRecord>;
}

interface DailyBonusDocument extends DocumentData {
  lastClaimDate?: string;
  streak?: number;
  totalClaims?: number;
  lastReward?: number;
  lastClaimedAt?: Timestamp;
}

interface WatchAndEarnDocument extends DocumentData {
  lastWatchDate?: string;
  watchesToday?: number;
  totalViews?: number;
  lastReward?: number;
  lastWatchedAt?: Timestamp;
}

interface UserEngagementDocument extends DocumentData {
  dailyBonus?: DailyBonusDocument;
  watchAndEarn?: WatchAndEarnDocument;
}

export interface DailyBonusClaimResult {
  reward: number;
  streak: number;
  totalCoins: number;
  nextEligibleAt: Date;
}

export interface WatchRewardClaimResult {
  reward: number;
  totalCoins: number;
  remainingViews: number;
  nextAvailableAt: Date;
}

export interface EngagementDependencies {
  runTransaction: typeof runTransaction;
  doc: typeof doc;
  serverTimestamp: typeof serverTimestamp;
}

const defaultDependencies: EngagementDependencies = {
  runTransaction,
  doc,
  serverTimestamp
};

const resolveFirestore = (db?: Firestore): Firestore => db ?? firebaseFirestore;

const clampMultiplierIndex = (config: DailyBonusConfig, streak: number) => {
  const capped = Math.min(streak, config.capStreak);
  return Math.min(config.streakMultipliers.length - 1, Math.max(0, capped - 1));
};

export const computeDailyBonusReward = (config: DailyBonusConfig, streak: number): number => {
  const index = clampMultiplierIndex(config, streak);
  const multiplier = config.streakMultipliers[index] ?? 1;
  return Math.round(config.baseReward * multiplier);
};

export const claimDailyLoginBonus = async (
  userId: string,
  config: EngagementConfig = defaultEngagementConfig,
  db?: Firestore,
  dependencies: EngagementDependencies = defaultDependencies,
  currentDate: Date = new Date()
): Promise<DailyBonusClaimResult> => {
  if (!userId) {
    throw new Error("Missing user id for daily bonus claim.");
  }

  const activeDb = resolveFirestore(db);
  const todayId = formatDateId(currentDate);
  const yesterdayId = getPreviousDateId(currentDate);

  const engagementRef = dependencies.doc(activeDb, "userEngagement", userId);
  const claimRef = dependencies.doc(activeDb, "coinClaims", userId);
  const userRef = dependencies.doc(activeDb, "users", userId);

  return dependencies.runTransaction(activeDb, async (transaction) => {
    const engagementSnap = await transaction.get(engagementRef);
    const engagementData = (engagementSnap.data() as UserEngagementDocument | undefined) ?? {};
    const dailyData = engagementData.dailyBonus ?? {};

    if (dailyData.lastClaimDate === todayId) {
      throw new Error("Daily login bonus already claimed.");
    }

    const previousStreak = typeof dailyData.streak === "number" ? dailyData.streak : 0;
    const isSequential = dailyData.lastClaimDate === yesterdayId;
    const streak = isSequential ? previousStreak + 1 : 1;
    const reward = computeDailyBonusReward(config.dailyBonus, streak);

    const claimSnap = await transaction.get(claimRef);
    const claimData = (claimSnap.data() as CoinClaimsDocument | undefined) ?? {};
    const claimedEntries = (claimData.claimed ?? {}) as Record<string, CoinClaimRecord>;
    const claimId = `daily-${todayId}`;

    if (claimedEntries[claimId]) {
      throw new Error("Daily bonus already registered in vault.");
    }

    const currentTotal =
      typeof claimData.totalCoins === "number" && Number.isFinite(claimData.totalCoins)
        ? claimData.totalCoins
        : 0;
    const nextTotal = currentTotal + reward;

    transaction.set(
      claimRef,
      {
        totalCoins: nextTotal,
        claimed: {
          ...claimedEntries,
          [claimId]: {
            fragmentId: claimId,
            coins: reward,
            title: "Daily login bonus",
            claimedAt: dependencies.serverTimestamp(),
            rarity: "rare",
            description: "Daily reward for keeping your streak alive.",
            type: "dailyBonus"
          } as CoinClaimRecord
        },
        updatedAt: dependencies.serverTimestamp()
      },
      { merge: true }
    );

    const userSnap = await transaction.get(userRef);
    const userData = (userSnap.data() as DocumentData | undefined) ?? {};
    const currentCoins =
      typeof userData.coins === "number" && Number.isFinite(userData.coins) ? userData.coins : 0;

    transaction.set(
      userRef,
      {
        coins: currentCoins + reward,
        updatedAt: dependencies.serverTimestamp(),
        rewardSummary: {
          totalCoins: nextTotal,
          lastFragmentId: claimId,
          lastUpdatedAt: dependencies.serverTimestamp()
        }
      },
      { merge: true }
    );

    transaction.set(
      engagementRef,
      {
        dailyBonus: {
          lastClaimDate: todayId,
          streak,
          totalClaims: (dailyData.totalClaims ?? 0) + 1,
          lastReward: reward,
          lastClaimedAt: dependencies.serverTimestamp()
        },
        updatedAt: dependencies.serverTimestamp()
      },
      { merge: true }
    );

    return {
      reward,
      streak,
      totalCoins: nextTotal,
      nextEligibleAt: getTomorrowMidnight(currentDate)
    } satisfies DailyBonusClaimResult;
  });
};

const minutesToMs = (minutes: number) => minutes * 60 * 1000;

export const claimWatchReward = async (
  userId: string,
  config: EngagementConfig = defaultEngagementConfig,
  db?: Firestore,
  dependencies: EngagementDependencies = defaultDependencies,
  currentDate: Date = new Date()
): Promise<WatchRewardClaimResult> => {
  if (!userId) {
    throw new Error("Missing user id for watch reward claim.");
  }

  const activeDb = resolveFirestore(db);
  const todayId = formatDateId(currentDate);
  const cooldownMs = minutesToMs(config.watchAndEarn.cooldownMinutes);

  const engagementRef = dependencies.doc(activeDb, "userEngagement", userId);
  const claimRef = dependencies.doc(activeDb, "coinClaims", userId);
  const userRef = dependencies.doc(activeDb, "users", userId);

  return dependencies.runTransaction(activeDb, async (transaction) => {
    const engagementSnap = await transaction.get(engagementRef);
    const engagementData = (engagementSnap.data() as UserEngagementDocument | undefined) ?? {};
    const watchData = engagementData.watchAndEarn ?? {};

    const lastWatchDate = watchData.lastWatchDate;
    const lastWatchedAtTimestamp = watchData.lastWatchedAt;
    const lastWatchedAt =
      lastWatchedAtTimestamp && typeof lastWatchedAtTimestamp.toDate === "function"
        ? lastWatchedAtTimestamp.toDate()
        : undefined;

    const watchesToday = lastWatchDate === todayId ? watchData.watchesToday ?? 0 : 0;

    if (watchesToday >= config.watchAndEarn.maxViewsPerDay) {
      throw new Error("Daily watch limit reached.");
    }

    if (lastWatchedAt) {
      const availableTime = lastWatchedAt.getTime() + cooldownMs;
      if (availableTime > currentDate.getTime()) {
        const minutesRemaining = Math.ceil((availableTime - currentDate.getTime()) / 60000);
        throw new Error(`Next watch available in ${minutesRemaining} minute(s).`);
      }
    }

    const reward = Math.round(config.watchAndEarn.rewardPerView);
    const nextCount = watchesToday + 1;
    const claimSnap = await transaction.get(claimRef);
    const claimData = (claimSnap.data() as CoinClaimsDocument | undefined) ?? {};
    const claimedEntries = (claimData.claimed ?? {}) as Record<string, CoinClaimRecord>;
    const claimId = `watch-${todayId}-${nextCount}`;

    if (claimedEntries[claimId]) {
      throw new Error("Watch reward already registered for this session.");
    }

    const currentTotal =
      typeof claimData.totalCoins === "number" && Number.isFinite(claimData.totalCoins)
        ? claimData.totalCoins
        : 0;
    const nextTotal = currentTotal + reward;

    transaction.set(
      claimRef,
      {
        totalCoins: nextTotal,
        claimed: {
          ...claimedEntries,
          [claimId]: {
            fragmentId: claimId,
            coins: reward,
            title: "Watch & earn",
            claimedAt: dependencies.serverTimestamp(),
            rarity: "common",
            description: "Coins earned by completing a rewarded session.",
            type: "watchAndEarn"
          } as CoinClaimRecord
        },
        updatedAt: dependencies.serverTimestamp()
      },
      { merge: true }
    );

    const userSnap = await transaction.get(userRef);
    const userData = (userSnap.data() as DocumentData | undefined) ?? {};
    const currentCoins =
      typeof userData.coins === "number" && Number.isFinite(userData.coins) ? userData.coins : 0;

    transaction.set(
      userRef,
      {
        coins: currentCoins + reward,
        updatedAt: dependencies.serverTimestamp(),
        rewardSummary: {
          totalCoins: nextTotal,
          lastFragmentId: claimId,
          lastUpdatedAt: dependencies.serverTimestamp()
        }
      },
      { merge: true }
    );

    transaction.set(
      engagementRef,
      {
        watchAndEarn: {
          lastWatchDate: todayId,
          watchesToday: nextCount,
          totalViews: (watchData.totalViews ?? 0) + 1,
          lastReward: reward,
          lastWatchedAt: dependencies.serverTimestamp()
        },
        updatedAt: dependencies.serverTimestamp()
      },
      { merge: true }
    );

    return {
      reward,
      totalCoins: nextTotal,
      remainingViews: Math.max(0, config.watchAndEarn.maxViewsPerDay - nextCount),
      nextAvailableAt: new Date(currentDate.getTime() + cooldownMs)
    } satisfies WatchRewardClaimResult;
  });
};
