import type { DailyPuzzle } from "./puzzles";

export type CoinCodeStatus = "active" | "redeemed" | "expired" | "disabled";

export interface AdminAnalytics {
  playersOnline: number;
  coinsMinted: number;
  activeRooms: number;
  conversionRate: number;
  conversionDelta: number;
  dailyRevenue: number;
  revenueDelta: number;
  avgSessionMinutes: number;
  hourlyEngagement: number[];
  mintSparkline: number[];
  retention: { label: string; percentage: number }[];
  regions: { region: string; percentage: number }[];
  monetization: { plan: string; conversions: number; revenue: number }[];
  topCreators: { name: string; drops: number; revenue: number }[];
  updatedAt?: Date | { seconds: number; nanoseconds: number } | null;
}

export const defaultAdminAnalytics: AdminAnalytics = {
  playersOnline: 0,
  coinsMinted: 0,
  activeRooms: 0,
  conversionRate: 0,
  conversionDelta: 0,
  dailyRevenue: 0,
  revenueDelta: 0,
  avgSessionMinutes: 0,
  hourlyEngagement: [20, 30, 25, 40, 35, 60, 55, 70, 68, 80, 76, 90],
  mintSparkline: [5, 9, 6, 12, 10, 14, 16, 12, 18, 22, 19, 25],
  retention: [
    { label: "Day 1", percentage: 82 },
    { label: "Day 3", percentage: 64 },
    { label: "Day 7", percentage: 48 },
    { label: "Day 14", percentage: 36 }
  ],
  regions: [
    { region: "IN", percentage: 58 },
    { region: "US", percentage: 22 },
    { region: "BR", percentage: 12 },
    { region: "AE", percentage: 8 }
  ],
  monetization: [
    { plan: "Starter", conversions: 148, revenue: 118400 },
    { plan: "Pro", conversions: 86, revenue: 154800 },
    { plan: "Guild", conversions: 32, revenue: 96000 }
  ],
  topCreators: [
    { name: "Aurora Squad", drops: 18, revenue: 62400 },
    { name: "Nebula Guild", drops: 11, revenue: 45200 },
    { name: "Quantum Legends", drops: 9, revenue: 38800 }
  ],
  updatedAt: null
};

export interface CoinCode {
  id: string;
  code: string;
  amount: number;
  priceInr: number;
  status: CoinCodeStatus;
  usageCount: number;
  maxUses: number;
  planId?: string;
  notes?: string;
  expiresAt?: Date | { seconds: number; nanoseconds: number } | null;
  createdAt?: Date | { seconds: number; nanoseconds: number } | null;
  updatedAt?: Date | { seconds: number; nanoseconds: number } | null;
}

export const createEmptyCoinCode = (): CoinCode => ({
  id: "",
  code: "",
  amount: 0,
  priceInr: 0,
  status: "active",
  usageCount: 0,
  maxUses: 1,
  planId: "",
  notes: "",
  expiresAt: null,
  createdAt: null,
  updatedAt: null
});

export interface RazorpayPricingConfig {
  basePriceInr: number;
  gstPercent: number;
  convenienceFeePercent: number;
  discountPercent: number;
  razorpayKey: string;
  razorpaySecret: string;
  plans: Array<{
    id: string;
    label: string;
    coins: number;
    amountInr: number;
    active: boolean;
  }>;
  updatedAt?: Date | { seconds: number; nanoseconds: number } | null;
}

export const defaultRazorpayPricing: RazorpayPricingConfig = {
  basePriceInr: 79,
  gstPercent: 18,
  convenienceFeePercent: 2.5,
  discountPercent: 0,
  razorpayKey: "",
  razorpaySecret: "",
  plans: [
    { id: "starter", label: "Starter", coins: 1200, amountInr: 79, active: true },
    { id: "streak", label: "Streak", coins: 3400, amountInr: 199, active: true },
    { id: "legend", label: "Legend", coins: 7200, amountInr: 399, active: true }
  ],
  updatedAt: null
};

export interface DailyPuzzleHistoryEntry {
  id: string;
  releaseAt?: Date | { seconds: number; nanoseconds: number } | null;
  puzzles: DailyPuzzle[];
  theme?: string;
  heroHeadline?: string;
}
