"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useScroll, useTransform } from "framer-motion";
import {
  Brain,
  LineChart,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowRight
} from "lucide-react";

import { MotionDiv, MotionSpan, useAuth } from "@/components/providers";
import { GradientButton } from "@/components/primitives/gradient-button";
import { GlassCard } from "@/components/primitives/glass-card";
import { ProgressRing } from "@/components/primitives/progress-ring";

const featureHighlights = [
  {
    title: "Co-op Pulse",
    description:
      "Synchronise with your squad in real time, share streaks, and celebrate victories instantly.",
    icon: Users
  },
  {
    title: "Adaptive Challenges",
    description:
      "AI-tuned quests surface at the perfect intensity to keep your players in deep flow.",
    icon: Brain
  },
  {
    title: "Performance Radiant",
    description:
      "Visualise every stat with kinetic charts and gradient feedback that reacts to progress.",
    icon: LineChart
  },
  {
    title: "Secure Matchmaking",
    description:
      "Bank-level security and moderation layers keep your lobbies free from noise.",
    icon: ShieldCheck
  }
];

const momentumMetrics = [
  {
    label: "Squad retention",
    value: "92%",
    delta: "+8%",
    description: "Players stick when your dashboards tell a story."
  },
  {
    label: "Session uplift",
    value: "3.1x",
    delta: "+1.2",
    description: "Immersive overlays drive longer, more meaningful play."
  },
  {
    label: "Quest completion",
    value: "87%",
    delta: "+14%",
    description: "Guided loops keep every objective within reach."
  }
];

function GoogleMark() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-white p-0.5">
      <svg viewBox="0 0 24 24" className="h-full w-full">
        <path
          fill="#EA4335"
          d="M12 10.8v3.66h5.18c-.23 1.2-.9 2.22-1.92 2.9l3.1 2.4c1.81-1.67 2.86-4.13 2.86-7 0-.67-.06-1.32-.18-1.96H12z"
        />
        <path
          fill="#34A853"
          d="M6.54 14.32l-.82.63-2.5 1.95C5.18 19.83 8.36 21.6 12 21.6c2.7 0 4.98-.9 6.64-2.45l-3.1-2.4c-.86.57-1.95.93-3.54.93-2.72 0-5.02-1.84-5.84-4.36z"
        />
        <path
          fill="#4A90E2"
          d="M3.22 7.58A9.57 9.57 0 0 0 2.4 12c0 1.5.36 2.92.82 4.05l3.32-2.56c-.2-.57-.32-1.18-.32-1.82 0-.63.12-1.24.32-1.82z"
        />
        <path
          fill="#FBBC05"
          d="M12 6.4c1.47 0 2.78.5 3.82 1.48l2.86-2.86C16.98 2.9 14.7 2 12 2 8.36 2 5.18 3.77 3.22 7.58l3.32 2.57C6.98 8.24 9.28 6.4 12 6.4z"
        />
      </svg>
    </span>
  );
}

function ParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, index) => ({
        id: index,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 4,
        scale: Math.random() * 0.8 + 0.3
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <MotionSpan
          key={particle.id}
          className="absolute h-2 w-2 rounded-full bg-white/30 blur-[1px] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          style={{
            top: particle.top,
            left: particle.left,
            scale: particle.scale
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0], y: [-12, 6, -12] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

function ParallaxShowcase() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const frontTranslate = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const backTranslate = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  return (
    <div
      ref={ref}
      className="relative isolate overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.06] px-8 py-16 shadow-[0_30px_80px_-40px_rgba(110,221,255,0.45)] md:px-16"
    >
      <MotionSpan
        style={{ translateY: backTranslate }}
        className="pointer-events-none absolute -left-28 top-12 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/30 via-sky-500/20 to-purple-500/30 blur-3xl"
      />
      <MotionSpan
        style={{ translateY: backTranslate }}
        className="pointer-events-none absolute -right-24 bottom-4 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-amber-400/20 blur-3xl"
      />

      <div className="relative grid gap-12 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <MotionSpan
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            kinetic insights
          </MotionSpan>
          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Parallax dashboards that react to your players in real time.
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Layered analytics glide with the scroll, keeping high-priority stats anchored while cinematic cards float in sync with player journeys.
            </p>
          </MotionDiv>
          <div className="grid gap-6 sm:grid-cols-2">
            {momentumMetrics.map((metric) => (
              <MotionDiv
                key={metric.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-500 ease-out hover:border-white/40 hover:shadow-[0_20px_50px_-30px_rgba(110,221,255,0.7)]"
              >
                <span className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">{metric.label}</span>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="text-3xl font-semibold text-foreground md:text-4xl">{metric.value}</p>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]">
                    {metric.delta}
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{metric.description}</p>
                <MotionSpan
                  style={{ translateY: frontTranslate }}
                  className="pointer-events-none absolute -bottom-16 right-0 h-32 w-32 rounded-full bg-gradient-to-t from-cyan-400/30 to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
                />
              </MotionDiv>
            ))}
          </div>
        </div>

        <MotionDiv
          style={{ translateY: frontTranslate }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8 }}
          className="relative flex flex-col items-center gap-6 rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur-xl"
        >
          <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-cyan-400/10 via-transparent to-violet-500/10" />
          <GlassCard className="w-full max-w-xs bg-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Momentum</span>
              <ProgressRing value={86} />
            </div>
            <p className="mt-6 text-2xl font-semibold">Legend tier unlocked</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Your dashboards are surging with live activity.
            </p>
          </GlassCard>
          <GlassCard className="w-full max-w-xs bg-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/60 via-sky-500/60 to-purple-500/60 text-white">
                <Rocket className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">Match queue</p>
                <p className="text-lg font-semibold">3 lobbies ready</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Reserve spots or auto-fill with AI teammates based on chemistry.
            </p>
          </GlassCard>
        </MotionDiv>
      </div>
    </div>
  );
}

function FeatureSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={`skeleton-${idx}`}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <div className="skeleton h-12 w-12 rounded-2xl" />
          <div className="mt-6 space-y-3">
            <div className="skeleton h-5 w-3/4 rounded-lg" />
            <div className="skeleton h-4 w-full rounded-lg" />
            <div className="skeleton h-4 w-2/3 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loadingHighlights, setLoadingHighlights] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadingHighlights(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-24 px-5 pb-24 pt-20 md:px-8">
      <ParticleField />

      <MotionDiv
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
      >
        <div className="space-y-8">
          <MotionSpan className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            gamy ludo beta
          </MotionSpan>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-[3.5rem]">
            Animated command centres for studios who live in the data.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Ignite your experience layer with motion-driven analytics, fluid player journeys, and instant squad syncing. Go from idea to unforgettable live ops in a single sprint.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <GradientButton
              size="lg"
              onClick={() => {
                router.push(user ? "/dashboard" : "/login");
              }}
              className="group flex items-center gap-3 border border-white/10 bg-gradient-to-r from-white/10 via-primary/40 to-secondary/50 text-base shadow-[0_0_25px_-10px_rgba(110,221,255,0.7)] transition duration-300 hover:shadow-[0_0_45px_-10px_rgba(162,87,255,0.8)]"
            >
              <GoogleMark />
              <span>Sign in with Google</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </GradientButton>
            <button
              onClick={() => {
                const featuresSection = document.getElementById("feature-highlights");
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-muted-foreground transition duration-300 hover:border-white/40 hover:text-foreground"
            >
              Explore the playbook
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        <div className="relative grid gap-6">
          <div className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-br from-cyan-500/10 via-primary/20 to-purple-500/10 blur-3xl" />
          <GlassCard className="relative overflow-hidden bg-white/10 p-8 backdrop-blur-xl">
            <MotionSpan
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-between text-sm uppercase tracking-[0.32em] text-muted-foreground"
            >
              squad sync live
              <span className="flex items-center gap-2 text-xs font-normal text-emerald-300">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                online
              </span>
            </MotionSpan>
            <p className="mt-6 text-2xl font-semibold">Daily XP ready to claim</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Realtime momentum updates and collaborative goals.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[82, 64, 93].map((value, index) => (
                <MotionDiv
                  key={`ring-${value}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <ProgressRing value={value} />
                  <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {index === 0 ? "daily xp" : index === 1 ? "squad sync" : "skill uplift"}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </GlassCard>
        </div>
      </MotionDiv>

      <div id="feature-highlights" className="space-y-10">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-3"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            highlight stack
          </span>
          <h2 className="text-3xl font-semibold md:text-4xl">Crafted to electrify your player lifecycle</h2>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            Blend micro-interactions, shimmering skeletons, and hover glows to keep your team on the same page while the data pulses.
          </p>
        </MotionDiv>

        {loadingHighlights ? (
          <FeatureSkeleton />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {featureHighlights.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionDiv
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.06 }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-6 backdrop-blur-md transition duration-500 hover:border-white/40 hover:shadow-[0_25px_60px_-35px_rgba(162,87,255,0.8)]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/40 via-sky-500/40 to-purple-500/40 text-white shadow-[0_0_1px_1px_rgba(255,255,255,0.2)]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
                    learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="pointer-events-none absolute -left-14 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-cyan-500/0 blur-3xl transition group-hover:bg-cyan-400/20" />
                  <div className="pointer-events-none absolute -right-20 bottom-6 h-28 w-28 rounded-full bg-purple-500/0 blur-3xl transition group-hover:bg-purple-500/20" />
                </MotionDiv>
              );
            })}
          </div>
        )}
      </div>

      <ParallaxShowcase />

      <MotionDiv
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-10 text-center backdrop-blur-xl"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(162,87,255,0.25),transparent_55%)]" />
        <h2 className="text-3xl font-semibold md:text-4xl">Ready to animate your next launch?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Invite your team, pipe in your favourite data sources, and let the parallax engine orchestrate every highlight reel.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <GradientButton
            size="lg"
            onClick={() => {
              router.push(user ? "/dashboard" : "/login");
            }}
            className="group flex items-center gap-3 border border-white/10 bg-gradient-to-r from-cyan-500/60 via-primary/50 to-purple-500/60 text-base shadow-[0_0_35px_-18px_rgba(162,87,255,0.8)] transition duration-300 hover:shadow-[0_0_55px_-18px_rgba(110,221,255,0.85)]"
          >
            <GoogleMark />
            <span>Sign in with Google</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </GradientButton>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-muted-foreground transition duration-300 hover:border-white/40 hover:text-foreground"
          >
            View live demo
          </button>
        </div>
      </MotionDiv>
    </section>
  );
}
