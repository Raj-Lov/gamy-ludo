import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { type FirestoreDependencies, defaultCoinRewardConfig, reserveCoinReward } from "../rewards.ts";

type FirestoreDocs = Map<string, unknown>;

interface FakeFirestore {
  documents: FirestoreDocs;
}

const createFakeFirestore = (): FakeFirestore => ({
  documents: new Map()
});

let db: FakeFirestore;
let serverTimestampCalls = 0;

const getDocData = (path: string) => db.documents.get(path);

const setDocData = (path: string, value: unknown, merge?: boolean) => {
  if (!merge || typeof value !== "object" || value === null) {
    db.documents.set(path, value);
    return;
  }

  const existing = db.documents.get(path);
  if (existing && typeof existing === "object") {
    db.documents.set(path, { ...(existing as Record<string, unknown>), ...(value as Record<string, unknown>) });
  } else {
    db.documents.set(path, value);
  }
};

const runTransactionStub: FirestoreDependencies["runTransaction"] = async (_db, updateFunction) => {
  const transaction = {
    async get(ref: { path: string }) {
      const snapshot = getDocData(ref.path);
      return {
        data: () => snapshot,
        exists: () => snapshot !== undefined
      };
    },
    set(ref: { path: string }, value: unknown, options?: { merge?: boolean }) {
      setDocData(ref.path, value, options?.merge);
    },
    update: () => {
      throw new Error("Not implemented in test stub");
    },
    delete: () => {
      throw new Error("Not implemented in test stub");
    }
  };

  return updateFunction(transaction as never);
};

const docStub = (_db: unknown, ...segments: string[]) => ({ path: segments.join("/") } as any);

const serverTimestampStub = () => {
  serverTimestampCalls += 1;
  return "timestamp" as any;
};

const dependencies = {
  runTransaction: runTransactionStub,
  doc: docStub,
  serverTimestamp: serverTimestampStub
} as unknown as FirestoreDependencies;

describe("reserveCoinReward", () => {
  beforeEach(() => {
    db = createFakeFirestore();
    serverTimestampCalls = 0;

    db.documents.set("config/coinRewards", defaultCoinRewardConfig);
    db.documents.set("coinClaims/test-user", { totalCoins: 200, claimed: {} });
    db.documents.set("users/test-user", { coins: 50 });
  });

  it("throws when the selected fragment no longer exists", async () => {
    db.documents.set("config/coinRewards", { fragments: [], cashout: defaultCoinRewardConfig.cashout });

    await assert.rejects(reserveCoinReward("test-user", "missing", db as never, dependencies), /no longer available/i);
  });

  it("prevents claiming the same fragment twice", async () => {
    db.documents.set("coinClaims/test-user", {
      totalCoins: 200,
      claimed: {
        "aurora-prism": {
          fragmentId: "aurora-prism"
        }
      }
    });

    await assert.rejects(
      reserveCoinReward("test-user", "aurora-prism", db as never, dependencies),
      /already claimed/i
    );
  });

  it("persists coin totals and user rewards for a successful claim", async () => {
    const result = await reserveCoinReward("test-user", "aurora-prism", db as never, dependencies);

    assert.equal(result.fragment.id, "aurora-prism");
    assert.equal(result.coinsAwarded, 120);
    assert.equal(result.totalCoins, 320);

    const claimDocument = db.documents.get("coinClaims/test-user") as Record<string, unknown>;
    assert.equal(claimDocument.totalCoins, 320);

    const claimed = (claimDocument.claimed as Record<string, unknown>)["aurora-prism"] as Record<string, unknown>;
    assert.equal(claimed.fragmentId, "aurora-prism");
    assert.ok(serverTimestampCalls > 0);

    const userDocument = db.documents.get("users/test-user") as Record<string, unknown>;
    assert.equal(userDocument.coins, 170);
    assert.equal((userDocument.rewardSummary as Record<string, unknown>).totalCoins, 320);
  });
});
