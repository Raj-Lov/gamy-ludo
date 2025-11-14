"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { CalendarDays, Clock, History, Loader2, Plus, RefreshCw, Sparkles } from "lucide-react";

import { GlassCard } from "@/components/primitives/glass-card";
import { GradientButton } from "@/components/primitives/gradient-button";
import { MotionDiv, useFeedback } from "@/components/providers";
import { cn } from "@/components/lib/utils";
import { firebaseFirestore } from "@/lib/firebase/client";
import { createDefaultPuzzle, puzzleDifficulties, type DailyPuzzle, type DailyPuzzleDocument } from "@/lib/puzzles";
import type { DailyPuzzleHistoryEntry } from "@/lib/admin";

const formatDateId = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);

const ensurePuzzle = (puzzle: Partial<DailyPuzzle> | null | undefined, index: number): DailyPuzzle => ({
  id: puzzle?.id && puzzle.id.trim() !== "" ? puzzle.id : `puzzle-${index + 1}`,
  title: puzzle?.title ?? `Puzzle ${index + 1}`,
  difficulty: puzzle?.difficulty ?? "medium",
  objective: puzzle?.objective ?? "Solve the challenge to keep your streak alive.",
  points: Number.isFinite(puzzle?.points) ? Number(puzzle?.points) : 100
});

const toDateTimeValue = (
  value: Date | { seconds: number; nanoseconds?: number } | null | undefined,
  fallback: string
) => {
  if (!value) return fallback;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 16);
  }
  if (typeof value === "object" && typeof value.seconds === "number") {
    const millis = value.seconds * 1000 + (value.nanoseconds ?? 0) / 1_000_000;
    return new Date(millis).toISOString().slice(0, 16);
  }
  return fallback;
};

const buildDefaultRelease = (dateId: string) => `${dateId}T09:00`;

const defaultPuzzleSet = () => [createDefaultPuzzle(0), createDefaultPuzzle(1), createDefaultPuzzle(2)];

export default function AdminPuzzlesPage() {
  const { notify } = useFeedback();
  const todayId = useMemo(() => formatDateId(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayId);
  const [releaseAt, setReleaseAt] = useState<string>(buildDefaultRelease(todayId));
  const [theme, setTheme] = useState("");
  const [heroHeadline, setHeroHeadline] = useState("");
  const [puzzles, setPuzzles] = useState<DailyPuzzle[]>(() => defaultPuzzleSet());
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState<DailyPuzzleHistoryEntry[]>([]);

  useEffect(() => {
    setLoadingDoc(true);
    const ref = doc(firebaseFirestore, "dailyPuzzles", selectedDate);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.data() as DailyPuzzleDocument | undefined;
        if (data) {
          setTheme(data.theme ?? "");
          setHeroHeadline(data.heroHeadline ?? "");
          const currentPuzzles = Array.isArray(data.puzzles) && data.puzzles.length
            ? data.puzzles.map((puzzle, index) => ensurePuzzle(puzzle, index))
            : defaultPuzzleSet();
          setPuzzles(currentPuzzles);
          setReleaseAt(toDateTimeValue(data.releaseAt ?? null, buildDefaultRelease(selectedDate)));
        } else {
          setTheme("");
          setHeroHeadline("");
          setPuzzles(defaultPuzzleSet());
          setReleaseAt(buildDefaultRelease(selectedDate));
        }
        setDirty(false);
        setLoadingDoc(false);
      },
      (error) => {
        console.error("Failed to load daily puzzle config", error);
        notify({
          title: "Failed to load puzzle",
          description: error instanceof Error ? error.message : "Retry in a moment.",
          variant: "error"
        });
        setLoadingDoc(false);
      }
    );

    return () => unsubscribe();
  }, [notify, selectedDate]);

  useEffect(() => {
    const puzzlesRef = query(collection(firebaseFirestore, "dailyPuzzles"), orderBy("releaseAt", "desc"), limit(8));
    const unsubscribe = onSnapshot(
      puzzlesRef,
      (snapshot) => {
        const entries = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as DailyPuzzleDocument | undefined;
          const releaseAtValue = data?.releaseAt ?? null;
          let releaseDate: Date | undefined;
          if (releaseAtValue instanceof Date) {
            releaseDate = releaseAtValue;
          } else if (
            releaseAtValue &&
            typeof releaseAtValue === "object" &&
            typeof (releaseAtValue as { seconds?: number }).seconds === "number"
          ) {
            releaseDate = new Date(
              (releaseAtValue as { seconds: number; nanoseconds?: number }).seconds * 1000 +
                ((releaseAtValue as { seconds: number; nanoseconds?: number }).nanoseconds ?? 0) / 1_000_000
            );
          }
          return {
            id: docSnapshot.id,
            releaseAt: releaseDate,
            theme: data?.theme,
            heroHeadline: data?.heroHeadline,
            puzzles: Array.isArray(data?.puzzles)
              ? data!.puzzles!.map((puzzle, index) => ensurePuzzle(puzzle, index))
              : defaultPuzzleSet()
          } satisfies DailyPuzzleHistoryEntry;
        });
        setHistory(entries);
        setHistoryLoading(false);
      },
      (error) => {
        console.error("Failed to load puzzle history", error);
        notify({
          title: "History unavailable",
          description: error instanceof Error ? error.message : "Could not load previous drops.",
          variant: "error"
        });
        setHistoryLoading(false);
      }
    );

    return () => unsubscribe();
  }, [notify]);

  const handlePuzzleChange = useCallback(
    <K extends keyof DailyPuzzle>(puzzleId: string, key: K, value: DailyPuzzle[K]) => {
      setPuzzles((current) =>
        current.map((puzzle) => (puzzle.id === puzzleId ? { ...puzzle, [key]: value } : puzzle))
      );
      setDirty(true);
    },
    []
  );

  const handleAddPuzzle = () => {
    setPuzzles((current) => [...current, createDefaultPuzzle(current.length)]);
    setDirty(true);
  };

  const handleRemovePuzzle = (puzzleId: string) => {
    setPuzzles((current) => current.filter((puzzle) => puzzle.id !== puzzleId));
    setDirty(true);
  };

  const handlePublish = async () => {
    if (!puzzles.length) {
      notify({ title: "Add a puzzle", description: "At least one puzzle is required.", variant: "warning" });
      return;
    }

    if (puzzles.some((puzzle) => !puzzle.title.trim())) {
      notify({ title: "Missing titles", description: "Give each puzzle a headline before publishing.", variant: "warning" });
      return;
    }

    setSaving(true);
    try {
      const releaseDate = releaseAt ? new Date(releaseAt) : new Date(`${selectedDate}T09:00`);
      await setDoc(
        doc(firebaseFirestore, "dailyPuzzles", selectedDate),
        {
          theme,
          heroHeadline,
          releaseAt: releaseDate,
          puzzles: puzzles.map((puzzle, index) => ({
            id: puzzle.id || `puzzle-${index + 1}`,
            title: puzzle.title,
            difficulty: puzzle.difficulty,
            objective: puzzle.objective,
            points: Number(puzzle.points) || 0
          })),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      notify({
        title: "Puzzle published",
        description: `Daily puzzle for ${selectedDate} is live for scheduling.`,
        variant: "success"
      });
      setDirty(false);
    } catch (error) {
      console.error("Failed to publish puzzles", error);
      notify({
        title: "Publish failed",
        description: error instanceof Error ? error.message : "Try again shortly.",
        variant: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const activeHistoryId = selectedDate;

  return (
    <div className="flex flex-col gap-10">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-6 lg:grid-cols-[2fr_1fr]"
      >
        <GlassCard className="border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-3 border-b border-white/5 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white">
                  <CalendarDays className="h-4 w-4 text-white/60" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                    }}
                    className="bg-transparent text-white outline-none"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white">
                  <Clock className="h-4 w-4 text-white/60" />
                  <input
                    type="datetime-local"
                    value={releaseAt}
                    onChange={(event) => {
                      setReleaseAt(event.target.value);
                      setDirty(true);
                    }}
                    className="bg-transparent text-white outline-none"
                  />
                </label>
                {dirty && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-amber-200">
                    <RefreshCw className="h-3 w-3 animate-spin" /> Draft changed
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-white">Daily puzzle composer</h2>
                <p className="text-sm text-white/60">
                  Craft streak-driven puzzle drops, control release cadence, and keep headline themes in sync with marketing pulses.
                </p>
              </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-white/70">
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Theme</span>
                <input
                  value={theme}
                  onChange={(event) => {
                    setTheme(event.target.value);
                    setDirty(true);
                  }}
                  placeholder="Neon arcade showdown"
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-white/70">
                <span className="text-xs uppercase tracking-[0.3em] text-white/40">Hero headline</span>
                <input
                  value={heroHeadline}
                  onChange={(event) => {
                    setHeroHeadline(event.target.value);
                    setDirty(true);
                  }}
                  placeholder="Race guilds to the center of the nebula"
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Puzzle lineup</h3>
                <button
                  type="button"
                  onClick={handleAddPuzzle}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:border-white/20 hover:bg-white/15"
                >
                  <Plus className="h-4 w-4" /> Add puzzle
                </button>
              </div>
              <div className="space-y-4">
                {puzzles.map((puzzle, index) => (
                  <div key={puzzle.id} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Puzzle {index + 1}</p>
                        <p className="text-sm text-white/60">{puzzle.id}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePuzzle(puzzle.id)}
                        className="text-xs uppercase tracking-[0.3em] text-rose-200 transition hover:text-rose-100"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-1 text-sm text-white/70">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Title</span>
                        <input
                          value={puzzle.title}
                          onChange={(event) => handlePuzzleChange(puzzle.id, "title", event.target.value)}
                          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm text-white/70">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Difficulty</span>
                        <select
                          value={puzzle.difficulty}
                          onChange={(event) => handlePuzzleChange(puzzle.id, "difficulty", event.target.value as DailyPuzzle["difficulty"])}
                          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                        >
                          {puzzleDifficulties.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                              {difficulty}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="md:col-span-2 flex flex-col gap-1 text-sm text-white/70">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Objective</span>
                        <textarea
                          value={puzzle.objective}
                          onChange={(event) => handlePuzzleChange(puzzle.id, "objective", event.target.value)}
                          className="min-h-[80px] rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm text-white/70">
                        <span className="text-xs uppercase tracking-[0.3em] text-white/40">Points</span>
                        <input
                          type="number"
                          value={puzzle.points}
                          onChange={(event) => handlePuzzleChange(puzzle.id, "points", Number(event.target.value) || 0)}
                          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400/60"
                        />
                      </label>
                    </div>
                  </div>
                ))}
                {!puzzles.length && (
                  <p className="text-center text-sm text-white/50">No puzzles added yet.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setTheme("");
                  setHeroHeadline("");
                  setPuzzles(defaultPuzzleSet());
                  setReleaseAt(buildDefaultRelease(selectedDate));
                  setDirty(true);
                }}
                className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-white/30 hover:text-white"
              >
                Reset draft
              </button>
              <GradientButton type="button" onClick={handlePublish} disabled={saving || loadingDoc}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {saving ? "Publishing" : "Publish daily drop"}
              </GradientButton>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Recent drops</h3>
            <History className="h-5 w-5 text-white/50" />
          </div>
          <div className="mt-4 space-y-4">
            {historyLoading ? (
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Loading timeline…</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-white/50">No puzzle history yet. Publish your first drop to populate the timeline.</p>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "rounded-2xl border border-white/10 bg-black/40 p-4 transition",
                    entry.id === activeHistoryId ? "border-sky-400/60" : "hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between text-sm text-white">
                    <div>
                      <p className="font-semibold">{entry.id}</p>
                      <p className="text-xs text-white/50">
                        {entry.releaseAt ? entry.releaseAt.toLocaleString() : "No release time"}
                      </p>
                    </div>
                    <span className="text-xs text-white/50">{entry.puzzles.length} puzzles</span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs text-white/60">
                    {entry.puzzles.slice(0, 2).map((puzzle) => (
                      <p key={puzzle.id}>
                        {puzzle.title} · {puzzle.difficulty} · {puzzle.points} pts
                      </p>
                    ))}
                    {entry.puzzles.length > 2 && <p>+{entry.puzzles.length - 2} more</p>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(entry.id)}
                      className="flex-1 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/30 hover:text-white"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTheme(entry.theme ?? "");
                        setHeroHeadline(entry.heroHeadline ?? "");
                        setPuzzles(entry.puzzles.map((puzzle, index) => ensurePuzzle(puzzle, index)));
                        setDirty(true);
                      }}
                      className="flex-1 rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-sky-200 transition hover:border-sky-300/60 hover:text-white"
                    >
                      Clone
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </MotionDiv>
    </div>
  );
}
