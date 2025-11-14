import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  claimDailyLoginBonus,
  claimWatchReward,
  computeDailyBonusReward,
  defaultEngagementConfig,
  type EngagementDependencies
} from "../engagement.ts";

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

const runTransactionStub: EngagementDependencies["runTransaction"] = async (_db, updateFunction) => {
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
} as unknown as EngagementDependencies;

describe("engagement rewards", () => {
  beforeEach(() => {
    db = createFakeFirestore();
    serverTimestampCalls = 0;

    db.documents.set("coinClaims/test-user", { totalCoins: 0, claimed: {} });
    db.documents.set("users/test-user", { coins: 0 });
  });

  describe("computeDailyBonusReward", () => {
    it("applies streak multipliers and caps at the configured maximum", () => {
      const config = {
        ...defaultEngagementConfig.dailyBonus,
        streakMultipliers: [1, 2],
        capStreak: 3
      };

      assert.equal(computeDailyBonusReward(config, 1), config.baseReward * 1);
      assert.equal(computeDailyBonusReward(config, 2), config.baseReward * 2);
      assert.equal(computeDailyBonusReward(config, 5), config.baseReward * 2);
    });
  });

  describe("claimDailyLoginBonus", () => {
    it("awards coins and records the streak for a new day", async () => {
      const date = new Date("2024-05-01T10:00:00.000Z");
      const result = await claimDailyLoginBonus(
        "test-user",
        defaultEngagementConfig,
        db as never,
        dependencies,
        date
      );

      assert.equal(result.reward, 120);
      assert.equal(result.streak, 1);
      assert.equal(result.totalCoins, 120);

      const claimDocument = db.documents.get("coinClaims/test-user") as Record<string, unknown>;
      assert.equal(claimDocument.totalCoins, 120);
      const claimed = claimDocument.claimed as Record<string, unknown>;
      assert.ok(claimed["daily-2024-05-01"]);

      const engagementDoc = db.documents.get("userEngagement/test-user") as Record<string, any>;
      assert.equal(engagementDoc.dailyBonus.lastClaimDate, "2024-05-01");
      assert.equal(engagementDoc.dailyBonus.streak, 1);
      assert.ok(serverTimestampCalls > 0);
    });

    it("prevents double claims on the same calendar day", async () => {
      const date = new Date("2024-05-01T10:00:00.000Z");
      await claimDailyLoginBonus("test-user", defaultEngagementConfig, db as never, dependencies, date);

      await assert.rejects(
        claimDailyLoginBonus("test-user", defaultEngagementConfig, db as never, dependencies, date),
        /already claimed/i
      );
    });

    it("extends the streak when claiming consecutive days", async () => {
      const firstDay = new Date("2024-05-01T10:00:00.000Z");
      const secondDay = new Date("2024-05-02T09:30:00.000Z");
      await claimDailyLoginBonus("test-user", defaultEngagementConfig, db as never, dependencies, firstDay);

      const result = await claimDailyLoginBonus(
        "test-user",
        defaultEngagementConfig,
        db as never,
        dependencies,
        secondDay
      );

      assert.equal(result.streak, 2);
      assert.ok(result.reward > 120);
    });
  });

  describe("claimWatchReward", () => {
    beforeEach(() => {
      db.documents.set("userEngagement/test-user", { watchAndEarn: { watchesToday: 0 } });
    });

    it("awards the configured coins and enforces cooldown", async () => {
      const date = new Date("2024-05-01T10:00:00.000Z");
      const config = {
        ...defaultEngagementConfig,
        watchAndEarn: { ...defaultEngagementConfig.watchAndEarn, cooldownMinutes: 30, maxViewsPerDay: 2, rewardPerView: 100 }
      };

      const first = await claimWatchReward("test-user", config, db as never, dependencies, date);
      assert.equal(first.reward, 100);
      assert.equal(first.remainingViews, 1);

      const engagementAfterFirst = db.documents.get("userEngagement/test-user") as Record<string, any>;
      engagementAfterFirst.watchAndEarn.lastWatchedAt = { toDate: () => date };
      assert.equal(typeof engagementAfterFirst.watchAndEarn.lastWatchedAt.toDate, "function");

      await assert.rejects(
        claimWatchReward("test-user", config, db as never, dependencies, date),
        /next watch available/i
      );

      const later = new Date(date.getTime() + 31 * 60 * 1000);
      const second = await claimWatchReward("test-user", config, db as never, dependencies, later);
      assert.equal(second.remainingViews, 0);

      const engagementAfterSecond = db.documents.get("userEngagement/test-user") as Record<string, any>;
      engagementAfterSecond.watchAndEarn.lastWatchedAt = { toDate: () => later };
      assert.equal(typeof engagementAfterSecond.watchAndEarn.lastWatchedAt.toDate, "function");

      await assert.rejects(
        claimWatchReward("test-user", config, db as never, dependencies, later),
        /daily watch limit/i
      );
    });
  });
});
