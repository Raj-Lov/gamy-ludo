"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Flame, Sparkles, TimerReset, Volume2, VolumeX, Vibrate, Zap } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MotionDiv } from "@/components/providers";
import { GlassCard } from "@/components/primitives/glass-card";
import { GradientButton } from "@/components/primitives/gradient-button";
import { useAuth, useFeedback } from "@/components/providers";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StreakFlame } from "@/components/dashboard/streak-flame";
import { useDailyPuzzles } from "@/hooks/use-daily-puzzles";
import { useUserProgress } from "@/hooks/use-user-progress";
import type { DailyPuzzle } from "@/hooks/use-daily-puzzles";

const Countdown = ({ target }: { target: Date }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const diff = Math.max(0, target.getTime() - now);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const formatted = [hours, minutes, seconds]
    .map((segment) => segment.toString().padStart(2, "0"))
    .join(":");

  return (
    <div className="flex flex-col gap-1 text-center">
      <span className="text-xs uppercase tracking-[0.4em] text-white/50">Next drop in</span>
      <span className="text-3xl font-semibold text-foreground">{formatted}</span>
    </div>
  );
};

const SkeletonLines = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="skeleton h-14 rounded-2xl" />
    ))}
  </div>
);

const difficultyPalette: Record<string, string> = {
  easy: "text-emerald-300 bg-emerald-500/10 border-emerald-500/40",
  medium: "text-sky-300 bg-sky-500/10 border-sky-500/30",
  hard: "text-rose-300 bg-rose-500/10 border-rose-500/30",
  extreme: "text-purple-300 bg-purple-500/10 border-purple-500/40"
};

const getDifficultyTag = (difficulty: DailyPuzzle["difficulty"]) =>
  difficultyPalette[difficulty] ?? difficultyPalette.medium;

const createNextReset = () => {
  const next = new Date();
  next.setHours(24, 0, 0, 0);
  return next;
};

const DashboardPage = () => {
  const { user, role, loading } = useAuth();
  const { notify, soundEnabled, hapticsEnabled, toggleSound, toggleHaptics } = useFeedback();
  const { puzzles, loading: puzzlesLoading, todayId, error: puzzlesError } = useDailyPuzzles();
  const {
    progress,
    loading: progressLoading,
    saving,
    xp,
    completePuzzle,
    toggleXpBoost,
    error: progressError
  } = useUserProgress(user?.uid);

  const totalPuzzles = puzzles.length;
  const completedPuzzles = progress?.completedPuzzles.length ?? 0;
  const completionRatio = totalPuzzles === 0 ? 0 : completedPuzzles / totalPuzzles;
  const streakCount = progress?.streakCount ?? 0;
  const weeklyGoal = 7;
  const weeklyProgress = weeklyGoal === 0 ? 0 : Math.min(streakCount, weeklyGoal) / weeklyGoal;
  const xpRatio = xp?.progressToNext ?? 0;
  const isBusy = puzzlesLoading || progressLoading;

  const nextReset = useMemo(createNextReset, [todayId]);

  useEffect(() => {
    if (!loading && !user) {
      notify({
        title: "Sign in to track progress",
        description: "Create an account or sign in to sync your puzzle streaks.",
        variant: "info",
        vibrate: false
      });
    }
  }, [loading, notify, user]);

  useEffect(() => {
    if (!isBusy && totalPuzzles === 0) {
      notify({
        title: "No puzzles yet",
        description: "Check back later today for fresh arena drops!",
        variant: "info",
        vibrate: false
      });
    }
  }, [isBusy, notify, totalPuzzles]);

  useEffect(() => {
    if (puzzlesError) {
      notify({
        title: "Unable to load puzzles",
        description: puzzlesError.message,
        variant: "error",
        vibrate: true
      });
    }
  }, [notify, puzzlesError]);

  useEffect(() => {
    if (progressError) {
      notify({
        title: "Progress sync issue",
        description: progressError.message,
        variant: "error",
        vibrate: true
      });
    }
  }, [notify, progressError]);

  const handleCompletePuzzle = async (puzzle: DailyPuzzle) => {
    if (!user) {
      notify({
        title: "Sign in required",
        description: "You need to be logged in to record progress.",
        variant: "error",
        vibrate: true
      });
      return;
    }

    if (progress?.completedPuzzles.includes(puzzle.id)) {
      notify({
        title: "Already completed",
        description: "This puzzle is already locked in for today.",
        variant: "info",
        vibrate: false
      });
      return;
    }

    try {
      await completePuzzle(puzzle);
      notify({
        title: `+${puzzle.points} XP gained`,
        description: `${puzzle.title} cleared. Keep the streak alive!`,
        variant: "success",
        vibrate: true
      });
    } catch (error) {
      notify({
        title: "Unable to save progress",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
        vibrate: true
      });
    }
  };

  const handleToggleXpBoost = async () => {
    if (!user) {
      notify({
        title: "Sign in required",
        description: "Boosts are tied to your profile.",
        variant: "error",
        vibrate: true
      });
      return;
    }
    const nextState = !(progress?.boosts.xpBoostActive ?? false);
    try {
      await toggleXpBoost();
      notify({
        title: nextState ? "XP boost engaged" : "XP boost paused",
        description: nextState
          ? "Earn double XP on your next completions."
          : "XP boost disabled. Progress reverts to standard gains.",
        variant: "success",
        vibrate: true
      });
    } catch (error) {
      notify({
        title: "Unable to toggle boost",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
        vibrate: true
      });
    }
  };

  const handleToggleSound = () => {
    toggleSound();
  };

  const handleToggleHaptics = () => {
    toggleHaptics();
  };

  return (
    <ProtectedRoute>
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-8 py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-4xl font-semibold text-foreground">
                Welcome back, {user?.displayName ?? user?.email ?? "explorer"}
              </h2>
              <p className="text-sm text-muted-foreground">
                You&apos;re playing as <span className="font-medium text-foreground">{role}</span>. Track your streak, rally your boosts,
                and crush today&apos;s puzzles.
              </p>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">Daily slate {todayId}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSound}
                className={clsx(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition",
                  soundEnabled
                    ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {soundEnabled ? "Sound on" : "Sound muted"}
              </button>
              <button
                type="button"
                onClick={handleToggleHaptics}
                className={clsx(
                  "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition",
                  hapticsEnabled
                    ? "border-orange-400/40 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                )}
              >
                <Vibrate className="h-4 w-4" />
                {hapticsEnabled ? "Haptics on" : "Haptics off"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <GlassCard className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Today&apos;s puzzle queue</h3>
                  <p className="text-sm text-muted-foreground">Sharpen your instincts with curated tactical drills.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                  <Sparkles className="h-4 w-4" /> {totalPuzzles} tasks
                </div>
              </div>

              {isBusy ? (
                <SkeletonLines rows={3} />
              ) : totalPuzzles === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-muted-foreground">
                  The puzzle masters are still prepping today&apos;s arenas. Check back soon.
                </div>
              ) : (
                <div className="space-y-4">
                  {puzzles.map((puzzle) => {
                    const completed = progress?.completedPuzzles.includes(puzzle.id) ?? false;
                    return (
                      <div
                        key={puzzle.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20"
                      >
                        <div className="space-y-1">
                          <p className="text-lg font-semibold text-foreground">{puzzle.title}</p>
                          <p className="text-sm text-white/70">{puzzle.objective}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={clsx(
                                "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                                getDifficultyTag(puzzle.difficulty)
                              )}
                            >
                              {puzzle.difficulty}
                            </span>
                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-sky-200">
                              {puzzle.points} XP
                            </span>
                          </div>
                        </div>
                        <GradientButton
                          disabled={completed || saving || progressLoading}
                          size="sm"
                          onClick={() => handleCompletePuzzle(puzzle)}
                        >
                          {completed ? "Locked in" : saving ? "Saving..." : "Mark complete"}
                        </GradientButton>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>

            <div className="grid gap-6">
              <GlassCard className="flex flex-col items-center gap-6">
                <Countdown target={nextReset} />
                <StreakFlame streak={streakCount} />
                <GradientButton
                  size="sm"
                  onClick={handleToggleXpBoost}
                  disabled={saving || progressLoading}
                  className={clsx(
                    "transition-colors",
                    progress?.boosts.xpBoostActive &&
                      "!from-emerald-500/70 !via-emerald-400/70 !to-teal-500/70 text-emerald-100 hover:brightness-110"
                  )}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  {progress?.boosts.xpBoostActive ? "Disable XP boost" : "Activate XP boost"}
                </GradientButton>
                <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                  <p className="font-semibold text-white/80">Boost status</p>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-center justify-between">
                      <span>XP boost</span>
                      <span className={progress?.boosts.xpBoostActive ? "text-emerald-300" : "text-white/60"}>
                        {progress?.boosts.xpBoostActive ? "Active" : "Idle"}
                      </span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Streak freeze</span>
                      <span className="text-white/80">{progress?.boosts.streakFreeze ?? 0} charges</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Hint charges</span>
                      <span className="text-white/80">{progress?.boosts.hintCharges ?? 0} remaining</span>
                    </li>
                  </ul>
                </div>
              </GlassCard>
            </div>
          </div>

          <GlassCard>
            <div className="grid gap-6 md:grid-cols-3">
              <ProgressRing
                label={`${completedPuzzles} / ${totalPuzzles || "-"} daily puzzles cleared`}
                value={completionRatio}
                metric="Daily"
                accent="#38bdf8"
              />
              <ProgressRing
                label={`Level ${xp?.level ?? 1} • ${xp?.xpIntoLevel ?? 0}/${xp?.xpRequired ?? 1200} XP`}
                value={xpRatio}
                metric="XP"
                accent="#a855f7"
              />
              <ProgressRing
                label={`${streakCount} day streak • Weekly target ${weeklyGoal}`}
                value={weeklyProgress}
                metric="Streak"
                accent="#f97316"
              />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                <div className="mb-2 flex items-center gap-2 text-white/80">
                  <Flame className="h-4 w-4 text-orange-300" />
                  <span className="font-semibold uppercase tracking-widest text-xs text-white/70">Streak insights</span>
                </div>
                <p>
                  Keep your streak alive by clearing at least one puzzle each day. Streak freeze charges protect you from
                  missing a day—use them wisely before long weekends.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                <div className="mb-2 flex items-center gap-2 text-white/80">
                  <TimerReset className="h-4 w-4 text-sky-300" />
                  <span className="font-semibold uppercase tracking-widest text-xs text-white/70">Reset cadence</span>
                </div>
                <p>
                  A fresh collection of arenas unlocks at midnight local time. Finish today&apos;s puzzles before the countdown
                  hits zero to secure your streak bonuses.
                </p>
              </div>
            </div>
          </GlassCard>
        </MotionDiv>
      </section>
    </ProtectedRoute>
  );
};

export default DashboardPage;
