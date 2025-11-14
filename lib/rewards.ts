import {
  doc,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type Firestore
} from "firebase/firestore";


export type CoinFragmentRarity = "common" | "rare" | "epic" | "legendary";

export interface CoinFragment {
  id: string;
  title: string;
  description: string;
  value: number;
  rarity: CoinFragmentRarity;
  accent: string;
  glow: string;
}

export interface CoinRewardConfig {
  fragments: CoinFragment[];
  cashout: {
    minCoins: number;
    exchangeRate: number;
    currency: string;
  };
  updatedAt?: unknown;
}

export const defaultCoinRewardConfig: CoinRewardConfig = {
  fragments: [
    {
      id: "aurora-prism",
      title: "Aurora Prism",
      description: "Shimmers with polar light and unlocks a burst of squad energy.",
      value: 120,
      rarity: "rare",
      accent: "from-cyan-400 via-sky-500 to-blue-600",
      glow: "shadow-[0_0_60px_rgba(56,189,248,0.45)]"
    },
    {
      id: "solstice-core",
      title: "Solstice Core",
      description: "A molten fragment forged at the height of a solar flare.",
      value: 260,
      rarity: "epic",
      accent: "from-amber-400 via-orange-500 to-rose-500",
      glow: "shadow-[0_0_70px_rgba(251,191,36,0.4)]"
    },
    {
      id: "lunar-quartz",
      title: "Lunar Quartz",
      description: "Captured moonlight that amplifies your co-op resonance.",
      value: 80,
      rarity: "common",
      accent: "from-slate-200 via-indigo-300 to-sky-400",
      glow: "shadow-[0_0_45px_rgba(129,140,248,0.35)]"
    },
    {
      id: "eclipse-vein",
      title: "Eclipse Vein",
      description: "Rare alloy balanced between dark and radiant energy.",
      value: 400,
      rarity: "legendary",
      accent: "from-purple-500 via-fuchsia-500 to-violet-600",
      glow: "shadow-[0_0_80px_rgba(168,85,247,0.45)]"
    }
  ],
  cashout: {
    minCoins: 1000,
    exchangeRate: 0.5,
    currency: "INR"
  }
};

export interface CoinClaimRecord extends DocumentData {
  fragmentId?: string;
  coins?: number;
  rarity?: CoinFragmentRarity;
  title?: string;
  redemptionCode?: string;
  receiptUrl?: string;
  claimedAt?: unknown;
  description?: string;
  type?: string;
}

interface CoinClaimsDocument extends DocumentData {
  totalCoins?: number;
  claimed?: Record<string, CoinClaimRecord>;
}

export interface ReserveCoinResult {
  fragment: CoinFragment;
  coinsAwarded: number;
  totalCoins: number;
}

const getFragmentById = (config: CoinRewardConfig, fragmentId: string): CoinFragment | undefined =>
  config.fragments.find((fragment) => fragment.id === fragmentId);

export interface FirestoreDependencies {
  runTransaction: typeof runTransaction;
  doc: typeof doc;
  serverTimestamp: typeof serverTimestamp;
}

const defaultFirestoreDependencies: FirestoreDependencies = {
  runTransaction,
  doc,
  serverTimestamp
};

let cachedFirestore: Firestore | null = null;

const getDefaultFirestore = async (): Promise<Firestore> => {
  if (!cachedFirestore) {
    const module = await import("./firebase/client.ts");
    cachedFirestore = module.firebaseFirestore;
  }

  return cachedFirestore;
};

export const reserveCoinReward = async (
  userId: string,
  fragmentId: string,
  db?: Firestore,
  dependencies: FirestoreDependencies = defaultFirestoreDependencies
): Promise<ReserveCoinResult> => {
  const activeDb = db ?? (await getDefaultFirestore());
  const configRef = dependencies.doc(activeDb, "config", "coinRewards");
  const claimRef = dependencies.doc(activeDb, "coinClaims", userId);
  const userRef = dependencies.doc(activeDb, "users", userId);

  return dependencies.runTransaction(activeDb, async (transaction) => {
    const configSnap = await transaction.get(configRef);
    const config = (configSnap.data() as CoinRewardConfig | undefined) ?? defaultCoinRewardConfig;
    const fragment = getFragmentById(config, fragmentId);

    if (!fragment) {
      throw new Error("Selected fragment is no longer available.");
    }

    const claimSnap = await transaction.get(claimRef);
    const claimData = (claimSnap.data() as CoinClaimsDocument | undefined) ?? {};
    const alreadyClaimed = claimData.claimed?.[fragmentId];

    if (alreadyClaimed) {
      throw new Error("Fragment already claimed.");
    }

    const coinsAwarded = fragment.value;
    const currentTotalRaw = claimData.totalCoins;
    const currentTotal =
      typeof currentTotalRaw === "number" && Number.isFinite(currentTotalRaw) ? currentTotalRaw : 0;
    const nextTotal = currentTotal + coinsAwarded;

    const nextClaimPayload: CoinClaimsDocument = {
      totalCoins: nextTotal,
      claimed: {
        ...(claimData.claimed ?? {}),
        [fragmentId]: {
          fragmentId,
          coins: coinsAwarded,
          rarity: fragment.rarity,
          title: fragment.title,
          claimedAt: dependencies.serverTimestamp()
        }
      },
      updatedAt: dependencies.serverTimestamp()
    };

    transaction.set(claimRef, nextClaimPayload, { merge: true });

    const userSnap = await transaction.get(userRef);
    const userData = userSnap.data() as DocumentData | undefined;
    const userCoinsRaw = userData?.coins;
    const userCoins = typeof userCoinsRaw === "number" && Number.isFinite(userCoinsRaw) ? userCoinsRaw : 0;

    transaction.set(
      userRef,
      {
        coins: userCoins + coinsAwarded,
        updatedAt: dependencies.serverTimestamp(),
        rewardSummary: {
          totalCoins: nextTotal,
          lastFragmentId: fragmentId,
          lastUpdatedAt: dependencies.serverTimestamp()
        }
      },
      { merge: true }
    );

    return {
      fragment,
      coinsAwarded,
      totalCoins: nextTotal
    };
  });
};
