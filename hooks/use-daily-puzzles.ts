"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, type FirestoreError } from "firebase/firestore";

import { firebaseFirestore } from "@/lib/firebase/client";
import type { DailyPuzzle, DailyPuzzleDocument } from "@/lib/puzzles";

const formatDateId = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);

export const useDailyPuzzles = () => {
  const [puzzles, setPuzzles] = useState<DailyPuzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const todayId = useMemo(() => formatDateId(new Date()), []);

  useEffect(() => {
    setLoading(true);
    const dailyDoc = doc(firebaseFirestore, "dailyPuzzles", todayId);
    const unsubscribe = onSnapshot(
      dailyDoc,
      (snapshot) => {
        const data = snapshot.data() as DailyPuzzleDocument | undefined;
        if (data?.puzzles && Array.isArray(data.puzzles)) {
          setPuzzles(
            data.puzzles.map((item, index) => ({
              id: item.id ?? `${todayId}-${index}`,
              title: item.title ?? `Puzzle #${index + 1}`,
              difficulty: item.difficulty ?? "medium",
              objective: item.objective ?? "Solve the challenge to keep your streak alive.",
              points: Number.isFinite(item.points) ? item.points : 100
            }))
          );
        } else {
          setPuzzles([]);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to subscribe to daily puzzles", err);
        setError(err);
        setPuzzles([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [todayId]);

  return { puzzles, loading, error, todayId } as const;
};
