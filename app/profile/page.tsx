"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { GlassCard } from "@/components/primitives/glass-card";
import { GradientButton } from "@/components/primitives/gradient-button";
import { MotionDiv, useAuth, useFeedback } from "@/components/providers";
import { useCoinClaims } from "@/hooks/use-coin-claims";
import { useUserProgress } from "@/hooks/use-user-progress";

const formatDateId = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);

const parseDateId = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.split("-");
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const AnimatedMetric = ({
  label,
  value,
  suffix,
  accent
}: {
  label: string;
  value: number;
  suffix?: string;
  accent: string;
}) => {
  const [displayValue, setDisplayValue] = useState(() => Math.round(value));
  useEffect(() => {
    let animationFrame: number;
    const duration = 550;
    const start = performance.now();
    const startValue = displayValue;
    const delta = value - startValue;

    const tick = (timestamp: number) => {
      const elapsed = Math.min(1, (timestamp - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplayValue(Math.round(startValue + delta * eased));
      if (elapsed < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.4em] text-white/50">{label}</p>
      <p className={`text-3xl font-semibold ${accent}`}>
        {displayValue.toLocaleString()}
        {suffix ? <span className="ml-1 text-base text-white/60">{suffix}</span> : null}
      </p>
    </div>
  );
};

const buildHeatmap = (streakCount: number, lastCompletedDate?: string | null) => {
  const today = new Date();
  const days = Array.from({ length: 28 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (27 - index));
    return date;
  });

  const activeSet = new Set<string>();
  if (streakCount > 0 && lastCompletedDate) {
    const lastDate = parseDateId(lastCompletedDate);
    if (lastDate) {
      for (let i = 0; i < streakCount; i += 1) {
        const streakDate = new Date(lastDate);
        streakDate.setDate(lastDate.getDate() - i);
        activeSet.add(formatDateId(streakDate));
      }
    }
  }

  return days.map((date) => {
    const id = formatDateId(date);
    return {
      id,
      date,
      active: activeSet.has(id)
    };
  });
};

const achievementsCatalogue = [
  {
    id: "streak-5",
    title: "Ember Runner",
    description: "Maintain a 5-day streak.",
    type: "streak",
    threshold: 5
  },
  {
    id: "streak-14",
    title: "Constellation Keeper",
    description: "Keep the streak alive for two weeks straight.",
    type: "streak",
    threshold: 14
  },
  {
    id: "xp-5000",
    title: "XP Ascendant",
    description: "Accumulate 5,000 XP across puzzles.",
    type: "xp",
    threshold: 5000
  },
  {
    id: "coins-2500",
    title: "Vault Whisperer",
    description: "Secure 2,500 coins across all fragments.",
    type: "coins",
    threshold: 2500
  }
] as const;

const determineAchievementStatus = (
  value: (typeof achievementsCatalogue)[number],
  streak: number,
  xp: number,
  coins: number
) => {
  const progressValue = value.type === "streak" ? streak : value.type === "xp" ? xp : coins;
  return {
    unlocked: progressValue >= value.threshold,
    progress: Math.min(1, progressValue / value.threshold)
  };
};

const createLeaderboard = (
  userName: string,
  streak: number,
  xp: number,
  coins: number
) => {
  const seed = [
    { name: "Nova", streak: 21, xp: 8900, coins: 3200 },
    { name: "Quill", streak: 16, xp: 6400, coins: 2700 },
    { name: "Echo", streak: 11, xp: 5200, coins: 1950 }
  ];
  const roster = [
    ...seed,
    { name: userName, streak, xp, coins }
  ];
  return roster
    .sort((a, b) => b.xp - a.xp)
    .map((entry, index) => ({ rank: index + 1, ...entry }));
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { notify } = useFeedback();
  const { progress, xp } = useUserProgress(user?.uid);
  const { totalCoins } = useCoinClaims(user?.uid);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const shareGeneratingRef = useRef(false);

  const heatmap = useMemo(
    () => buildHeatmap(progress?.streakCount ?? 0, progress?.lastCompletedDate),
    [progress?.lastCompletedDate, progress?.streakCount]
  );

  const leaderboard = useMemo(
    () =>
      createLeaderboard(
        user?.displayName || user?.email || "You",
        progress?.streakCount ?? 0,
        progress?.xp ?? 0,
        totalCoins
      ),
    [progress?.streakCount, progress?.xp, totalCoins, user?.displayName, user?.email]
  );

  const handleGenerateShare = useCallback(() => {
    if (shareGeneratingRef.current) return;
    shareGeneratingRef.current = true;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext("2d");
    if (!context) {
      shareGeneratingRef.current = false;
      return;
    }

    const gradient = context.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#312e81");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1200, 630);

    context.fillStyle = "rgba(148, 163, 184, 0.2)";
    for (let i = 0; i < 12; i += 1) {
      context.fillRect(i * 100, 0, 1, 630);
    }

    context.fillStyle = "#e0f2fe";
    context.font = "48px 'Plus Jakarta Sans'";
    context.fillText("Gamy Ludo Profile", 80, 120);

    context.font = "36px 'Plus Jakarta Sans'";
    context.fillStyle = "#a5b4fc";
    context.fillText(user?.displayName || user?.email || "Vault Runner", 80, 190);

    context.fillStyle = "#f8fafc";
    context.font = "bold 72px 'Plus Jakarta Sans'";
    context.fillText(`${progress?.streakCount ?? 0} day streak`, 80, 300);

    context.font = "bold 64px 'Plus Jakarta Sans'";
    context.fillStyle = "#facc15";
    context.fillText(`${progress?.xp ?? 0} XP`, 80, 390);

    context.fillStyle = "#34d399";
    context.fillText(`${totalCoins} coins`, 80, 470);

    context.font = "28px 'Plus Jakarta Sans'";
    context.fillStyle = "#cbd5f5";
    context.fillText("Share your streak & invite your crew.", 80, 540);

    const imageUrl = canvas.toDataURL("image/png");
    setShareImage(imageUrl);

    if (navigator.share) {
      navigator
        .share({
          title: "Gamy Ludo profile",
          text: "Check out my latest Gamy Ludo streak!",
          url: window.location.href
        })
        .catch(() => {
          /* ignored */
        });
    }

    notify({
      title: "Share card ready",
      description: "Tap and hold to save the image or share directly from supported browsers.",
      variant: "success"
    });

    shareGeneratingRef.current = false;
  }, [notify, progress?.streakCount, progress?.xp, totalCoins, user?.displayName, user?.email]);

  return (
    <ProtectedRoute redirectTo="/login">
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(167,139,250,0.2),_transparent_55%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-24">
          <header className="space-y-4">
            <MotionDiv initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                Profile synced
              </span>
            </MotionDiv>
            <h1 className="text-4xl font-semibold md:text-5xl">Command center</h1>
            <p className="max-w-2xl text-base text-white/70">
              Monitor streak momentum, chase achievements, challenge the crew leaderboard, and share your highlight reel.
            </p>
          </header>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <GlassCard className="border-white/5 bg-white/5 p-6">
              <AnimatedMetric label="Streak" value={progress?.streakCount ?? 0} suffix="days" accent="text-emerald-200" />
            </GlassCard>
            <GlassCard className="border-white/5 bg-white/5 p-6">
              <AnimatedMetric label="Experience" value={progress?.xp ?? 0} suffix="XP" accent="text-sky-200" />
            </GlassCard>
            <GlassCard className="border-white/5 bg-white/5 p-6">
              <AnimatedMetric label="Level" value={xp?.level ?? 1} accent="text-amber-200" />
            </GlassCard>
            <GlassCard className="border-white/5 bg-white/5 p-6">
              <AnimatedMetric label="Vault" value={totalCoins} suffix="coins" accent="text-violet-200" />
            </GlassCard>
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <GlassCard className="border-white/5 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Streak heatmap</h2>
                  <p className="text-sm text-white/60">Recent 28-day cadence. Bright tiles mark active puzzle completions.</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
                  {progress?.streakCount ?? 0} streak
                </span>
              </div>
              <div className="mt-6 grid grid-cols-7 gap-2">
                {heatmap.map((day) => (
                  <div
                    key={day.id}
                    className={`aspect-square w-full rounded-lg border border-white/10 transition duration-300 ${
                      day.active ? "bg-emerald-400/80 shadow-[0_0_18px_rgba(16,185,129,0.6)]" : "bg-white/5"
                    }`}
                    title={`${day.id}${day.active ? " — completed" : " — idle"}`}
                  />
                ))}
              </div>
            </GlassCard>
            <GlassCard className="border-white/5 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Boost status</h2>
              <p className="mt-2 text-sm text-white/60">
                Track consumables and XP modifiers that influence your daily run.
              </p>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span>Streak freeze</span>
                  <span>{progress?.boosts.streakFreeze ?? 0}</span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span>XP boost</span>
                  <span>{progress?.boosts.xpBoostActive ? "Active" : "Dormant"}</span>
                </li>
                <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span>Hint charges</span>
                  <span>{progress?.boosts.hintCharges ?? 0}</span>
                </li>
              </ul>
            </GlassCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <GlassCard className="border-white/5 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Achievements</h2>
                <span className="text-sm text-white/60">
                  {achievementsCatalogue.filter((item) =>
                    determineAchievementStatus(item, progress?.streakCount ?? 0, progress?.xp ?? 0, totalCoins).unlocked
                  ).length}
                  /{achievementsCatalogue.length} unlocked
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {achievementsCatalogue.map((achievement) => {
                  const status = determineAchievementStatus(
                    achievement,
                    progress?.streakCount ?? 0,
                    progress?.xp ?? 0,
                    totalCoins
                  );
                  return (
                    <div
                      key={achievement.id}
                      className={`rounded-2xl border p-4 transition ${
                        status.unlocked
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{achievement.title}</h3>
                        <span className="text-sm text-white/60">{achievement.threshold}</span>
                      </div>
                      <p className="mt-1 text-sm text-white/60">{achievement.description}</p>
                      <div className="mt-3 h-2 rounded-full bg-white/10">
                        <div
                          className={`h-2 rounded-full ${status.unlocked ? "bg-emerald-400" : "bg-sky-400"}`}
                          style={{ width: `${status.progress * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
            <GlassCard className="border-white/5 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Leaderboard pulse</h2>
                <span className="text-sm text-white/60">Sorted by XP</span>
              </div>
              <div className="mt-4 space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.rank}-${entry.name}`}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                      entry.name === (user?.displayName || user?.email || "You")
                        ? "border-violet-500/40 bg-violet-500/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base font-semibold text-white/80">
                        #{entry.rank}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{entry.name}</p>
                        <p className="text-xs text-white/60">{entry.streak} day streak</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-white/70">
                      <p className="text-sm font-semibold text-white">{entry.xp.toLocaleString()} XP</p>
                      <p>{entry.coins.toLocaleString()} coins</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>

          <section>
            <GlassCard className="border-white/5 bg-white/5 p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Shareable highlight</h2>
                  <p className="text-sm text-white/60">
                    Generate an instant social-ready image with your latest streak, XP and vault totals.
                  </p>
                </div>
                <GradientButton type="button" onClick={handleGenerateShare}>
                  Craft share card
                </GradientButton>
              </div>
              {shareImage ? (
                <div className="mt-6 flex flex-col items-start gap-4">
                  <img
                    src={shareImage}
                    alt="Shareable profile snapshot"
                    className="w-full max-w-2xl rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(79,70,229,0.35)]"
                  />
                  <div className="flex flex-wrap gap-3 text-sm text-white/70">
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = shareImage;
                        link.download = "gamy-ludo-share.png";
                        link.click();
                      }}
                      className="rounded-full border border-white/10 bg-white/10 px-4 py-2 transition hover:border-white/30 hover:bg-white/20"
                    >
                      Download image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(shareImage)
                          .then(() =>
                            notify({
                              title: "Share card copied",
                              description: "Image URL copied to clipboard.",
                              variant: "success"
                            })
                          )
                          .catch(() =>
                            notify({
                              title: "Copy failed",
                              description: "Browser blocked clipboard access.",
                              variant: "error"
                            })
                          );
                      }}
                      className="rounded-full border border-violet-400/40 bg-violet-500/10 px-4 py-2 transition hover:border-violet-400/60 hover:bg-violet-500/20"
                    >
                      Copy image URL
                    </button>
                  </div>
                </div>
              ) : null}
            </GlassCard>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
