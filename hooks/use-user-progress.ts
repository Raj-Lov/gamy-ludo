"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type FirestoreError
} from "firebase/firestore";

import { firebaseFirestore } from "@/lib/firebase/client";
import type { DailyPuzzle } from "./use-daily-puzzles";

export interface UserBoosts {
  streakFreeze: number;
  xpBoostActive: boolean;
  hintCharges: number;
}

export interface UserProgressState {
  completedPuzzles: string[];
  streakCount: number;
  xp: number;
  lastCompletedDate?: string;
  boosts: UserBoosts;
  updatedAt?: Date;
}

const defaultProgress: UserProgressState = {
  completedPuzzles: [],
  streakCount: 0,
  xp: 0,
  boosts: {
    streakFreeze: 1,
    xpBoostActive: false,
    hintCharges: 2
  }
};

const formatDateId = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);

const computeLevel = (xp: number) => Math.floor(xp / 1200) + 1;

const getXpProgress = (xp: number) => {
  const level = computeLevel(xp);
  const floor = (level - 1) * 1200;
  const ceiling = level * 1200;
  const intoLevel = xp - floor;
  const required = ceiling - floor;

  return {
    level,
    intoLevel,
    required,
    ratio: required === 0 ? 0 : intoLevel / required
  };
};

export interface UseUserProgressResult {
  progress: UserProgressState | null;
  loading: boolean;
  error: FirestoreError | null;
  saving: boolean;
  xp: {
    level: number;
    progressToNext: number;
    xpIntoLevel: number;
    xpRequired: number;
  } | null;
  completePuzzle: (puzzle: DailyPuzzle) => Promise<void>;
  toggleXpBoost: () => Promise<void>;
}

export const useUserProgress = (userId?: string | null) => {
  const [progress, setProgress] = useState<UserProgressState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<FirestoreError | null>(null);
  const todayId = useMemo(() => formatDateId(new Date()), []);
  const lastSnapshotRef = useRef<UserProgressState | null>(null);

  useEffect(() => {
    if (!userId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ref = doc(firebaseFirestore, "userProgress", userId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data();
        if (data) {
          const hydrated: UserProgressState = {
            completedPuzzles: data.completedPuzzles ?? defaultProgress.completedPuzzles,
            streakCount: data.streakCount ?? defaultProgress.streakCount,
            xp: data.xp ?? defaultProgress.xp,
            boosts: {
              streakFreeze: data.boosts?.streakFreeze ?? defaultProgress.boosts.streakFreeze,
              xpBoostActive: data.boosts?.xpBoostActive ?? defaultProgress.boosts.xpBoostActive,
              hintCharges: data.boosts?.hintCharges ?? defaultProgress.boosts.hintCharges
            },
            lastCompletedDate: data.lastCompletedDate ?? undefined,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined
          };
          lastSnapshotRef.current = hydrated;
          setProgress(hydrated);
        } else {
          lastSnapshotRef.current = defaultProgress;
          setProgress(defaultProgress);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to subscribe to user progress", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    lastSnapshotRef.current = progress;
  }, [progress]);

  const xp = useMemo(() => {
    if (!progress) return null;
    const meta = getXpProgress(progress.xp);
    return {
      level: meta.level,
      progressToNext: meta.ratio,
      xpIntoLevel: meta.intoLevel,
      xpRequired: meta.required
    };
  }, [progress]);

  const persistProgress = useCallback(
    async (next: UserProgressState) => {
      if (!userId) return;
      await setDoc(
        doc(firebaseFirestore, "userProgress", userId),
        {
          ...next,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    },
    [userId]
  );

  const completePuzzle = useCallback(
    async (puzzle: DailyPuzzle) => {
      if (!userId || !puzzle?.id) {
        return;
      }

      const previous = lastSnapshotRef.current ?? defaultProgress;
      const alreadyCompleted = previous.completedPuzzles.includes(puzzle.id);
      if (alreadyCompleted) {
        return;
      }

      const xpBonus = previous.boosts.xpBoostActive ? puzzle.points * 2 : puzzle.points;
      const today = todayId;
      const nextState: UserProgressState = {
        ...previous,
        completedPuzzles: [...previous.completedPuzzles, puzzle.id],
        xp: previous.xp + xpBonus,
        lastCompletedDate: today,
        streakCount:
          previous.lastCompletedDate === today
            ? previous.streakCount
            : previous.lastCompletedDate === formatDateId(new Date(Date.now() - 86400000))
              ? previous.streakCount + 1
              : 1
      };

      setProgress(nextState);
      lastSnapshotRef.current = nextState;
      setSaving(true);

      try {
        await persistProgress(nextState);
        setSaving(false);
      } catch (persistError) {
        console.error("Failed to persist puzzle completion", persistError);
        setProgress(previous);
        lastSnapshotRef.current = previous;
        setSaving(false);
        setError(persistError as FirestoreError);
        throw persistError;
      }
    },
    [persistProgress, todayId, userId]
  );

  const toggleXpBoost = useCallback(async () => {
    if (!userId) return;
    const previous = lastSnapshotRef.current ?? defaultProgress;
    const nextState: UserProgressState = {
      ...previous,
      boosts: {
        ...previous.boosts,
        xpBoostActive: !previous.boosts.xpBoostActive
      }
    };

    setProgress(nextState);
    lastSnapshotRef.current = nextState;
    setSaving(true);

    try {
      await persistProgress(nextState);
      setSaving(false);
    } catch (persistError) {
      console.error("Failed to toggle XP boost", persistError);
      setProgress(previous);
      lastSnapshotRef.current = previous;
      setSaving(false);
      setError(persistError as FirestoreError);
      throw persistError;
    }
  }, [persistProgress, userId]);

  return {
    progress,
    loading,
    error,
    saving,
    xp,
    completePuzzle,
    toggleXpBoost
  } satisfies UseUserProgressResult;
};
