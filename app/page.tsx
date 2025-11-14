"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Flame,
  Gift,
  LineChart,
  Medal,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";

import { MotionDiv, MotionSpan, useAuth } from "@/components/providers";
import { GradientButton } from "@/components/primitives/gradient-button";
import { GlassCard } from "@/components/primitives/glass-card";
import { ProgressRing } from "@/components/primitives/progress-ring";

const rewardBlueprints = [
  {
    title: "Adaptive reward streams",
    description:
      "AI-tailored challenges sequence rewards to every persona, keeping your grind irresistible and fair.",
    signal: "+38% session uplift",
    icon: Trophy
  },
  {
    title: "Squad synergy vaults",
    description:
      "Dynamic team goals level up together with streak multipliers that pulse when collaboration peaks.",
    signal: "+24% squad return",
    icon: Users
  },
  {
    title: "Live loot marketplace",
    description:
      "Event-driven drops slide into a shimmering marketplace where rarity adapts to player intent in real time.",
    signal: "3.8x claim velocity",
    icon: Gift
  },
  {
    title: "Momentum journey maps",
    description:
      "Cinematic progress paths light up as players climb tiers, celebrating every milestone with kinetic glow.",
    signal: "92% path completion",
    icon: LineChart
  },
  {
    title: "Creator-fueled quests",
    description:
      "Top creators design layered quests with shareable templates, while moderation shields every loop.",
    signal: "+41% referral spread",
    icon: Sparkles
  },
  {
    title: "Mythic prestige cycles",
    description:
      "Rotating prestige cycles re-skin your economy each season so rewards stay fresh without losing balance.",
    signal: "-28% churn dip",
    icon: Medal
  }
];

const engagementSignals = [
  {
    label: "Prime retention",
    value: "96%",
    delta: "+12%",
    description: "Players stay when rewards glow with intent."
  },
  {
    label: "Live session lift",
    value: "3.4x",
    delta: "+1.5",
    description: "Tiered boosts keep the lobby electric."
  },
  {
    label: "Creator cadence",
    value: "58",
    delta: "+9",
    description: "Weekly drops curated with your community."
  }
];

const loyaltyMoments = [
  {
    stage: "Day 1 ignition",
    copy: "Welcome players with instant streaks, shimmering loot previews, and squad invites ready to fire.",
    metric: "78% activation",
    color: "from-sky-400/30 via-sky-500/20 to-transparent"
  },
  {
    stage: "Flow-state mastery",
    copy: "Adaptive milestones pivot in real time, rewarding micro-wins with cinematic motion feedback.",
    metric: "2.9x daily quests",
    color: "from-purple-400/30 via-fuchsia-500/20 to-transparent"
  },
  {
    stage: "Mythic loyalty",
    copy: "Prestige tracks loop seamlessly, unlocking legacy cosmetics and co-op rituals for veteran squads.",
    metric: "94 loyalty NPS",
    color: "from-amber-400/30 via-orange-500/20 to-transparent"
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
      Array.from({ length: 18 }).map((_, index) => ({
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
          className="absolute h-2 w-2 rounded-full bg-white/25 blur-[1px] drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
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

function MomentumShowcase() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const gridTranslate = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const auraTranslate = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);

  return (
    <div
      ref={ref}
      className="relative isolate overflow-hidden rounded-[44px] border border-white/10 bg-white/[0.05] px-8 py-16 shadow-[0_40px_120px_-70px_rgba(93,211,255,0.6)] md:px-16"
    >
      <MotionSpan
        style={{ translateY: auraTranslate }}
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-gradient-to-br from-sky-400/30 via-cyan-500/20 to-purple-400/20 blur-3xl"
      />
      <MotionSpan
        style={{ translateY: auraTranslate }}
        className="pointer-events-none absolute -right-20 bottom-6 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-amber-400/20 blur-3xl"
      />

      <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <MotionSpan
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.32em] text-muted-foreground"
          >
            <Flame className="h-3.5 w-3.5 text-amber-300" />
            live momentum
          </MotionSpan>
          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Grid intelligence fuels every loyalty ritual.
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              Stack your reward layers, monitor halo effects, and orchestrate prestige moments—all while the dashboard breathes with your players.
            </p>
          </MotionDiv>
          <div className="grid gap-6 sm:grid-cols-2">
            {engagementSignals.map((signal) => (
              <MotionDiv
                key={signal.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-500 ease-out hover:border-white/40 hover:shadow-[0_25px_65px_-40px_rgba(93,211,255,0.75)]"
              >
                <span className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{signal.label}</span>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <p className="text-3xl font-semibold text-foreground md:text-4xl">{signal.value}</p>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]">
                    {signal.delta}
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{signal.description}</p>
                <MotionSpan
                  style={{ translateY: gridTranslate }}
                  className="pointer-events-none absolute -bottom-14 right-0 h-28 w-28 rounded-full bg-gradient-to-t from-cyan-400/30 to-transparent opacity-0 transition duration-500 group-hover:opacity-100"
                />
              </MotionDiv>
            ))}
          </div>
        </div>

        <MotionDiv
          style={{ translateY: gridTranslate }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="relative grid gap-6 rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 backdrop-blur-xl"
        >
          <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-cyan-400/15 via-transparent to-violet-500/15" />
          <GlassCard className="w-full bg-white/10 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Mythic tier</span>
              <ProgressRing value={92} />
            </div>
            <p className="mt-6 text-2xl font-semibold">Glow status unlocked</p>
            <p className="mt-3 text-sm text-muted-foreground">Your squads are surging toward prestige rituals.</p>
          </GlassCard>
          <GlassCard className="w-full bg-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/60 via-sky-500/60 to-purple-500/60 text-white">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Squad queue</p>
                <p className="text-lg font-semibold">5 teams calibrating</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Auto-match chemistry engines keep every drop collaborative.
            </p>
          </GlassCard>
          <GlassCard className="w-full bg-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/60 via-emerald-500/60 to-cyan-500/60 text-white">
                <Flame className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Boost window</p>
                <p className="text-lg font-semibold">2:18 remaining</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Trigger legendary multipliers when squads clear streak thresholds.
            </p>
          </GlassCard>
        </MotionDiv>
      </div>
    </div>
  );
}

function BlueprintSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
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
  const [loadingBlueprints, setLoadingBlueprints] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoadingBlueprints(false), 900);
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
            rewards engine
          </MotionSpan>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl lg:text-[3.5rem]">
            Build a powerful, modern reward grid that shines with every interaction.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Compose cinematic experiences with glassmorphism, gradient-powered tiers, and adaptive incentives that respond instantly to your players.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <GradientButton
              size="lg"
              onClick={() => {
                router.push(user ? "/dashboard" : "/login");
              }}
              className="group flex items-center gap-3 border border-white/10 bg-gradient-to-r from-white/10 via-primary/40 to-secondary/50 text-base shadow-[0_0_28px_-12px_rgba(110,221,255,0.7)] transition duration-300 hover:shadow-[0_0_48px_-12px_rgba(162,87,255,0.8)]"
            >
              <GoogleMark />
              <span>Sign in with Google</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </GradientButton>
            <button
              onClick={() => {
                const blueprintsSection = document.getElementById("reward-blueprints");
                if (blueprintsSection) {
                  blueprintsSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="group inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium text-muted-foreground transition duration-300 hover:border-white/40 hover:text-foreground"
            >
              Explore the grid
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
              className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-muted-foreground"
            >
              streak runway
              <span className="flex items-center gap-2 text-xs font-normal text-emerald-300">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                live
              </span>
            </MotionSpan>
            <p className="mt-6 text-2xl font-semibold">Legendary drop incoming</p>
            <p className="mt-3 text-sm text-muted-foreground">Real-time vaults prime your community for the next reward wave.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[84, 72, 95].map((value, index) => (
                <MotionDiv
                  key={`ring-${value}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.08, duration: 0.5 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center"
                >
                  <ProgressRing value={value} />
                  <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {index === 0 ? "daily spark" : index === 1 ? "squad sync" : "vault charge"}
                  </p>
                </MotionDiv>
              ))}
            </div>
          </GlassCard>
        </div>
      </MotionDiv>

      <div id="reward-blueprints" className="space-y-10">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-3"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            blueprint grid
          </span>
          <h2 className="text-3xl font-semibold md:text-4xl">Design rewards with luminous, layered cards</h2>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            Each card responds to hover, carries live stats, and snaps perfectly into your modular dashboard layout.
          </p>
        </MotionDiv>

        {loadingBlueprints ? (
          <BlueprintSkeleton />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rewardBlueprints.map((blueprint, index) => {
              const Icon = blueprint.icon;
              return (
                <MotionDiv
                  key={blueprint.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  whileHover={{ y: -10 }}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-transparent p-6 backdrop-blur-md transition duration-500 hover:border-white/40 hover:shadow-[0_28px_70px_-40px_rgba(162,87,255,0.85)]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/40 via-sky-500/40 to-purple-500/40 text-white shadow-[0_0_1px_1px_rgba(255,255,255,0.2)]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold">{blueprint.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{blueprint.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200/80">
                    {blueprint.signal}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="pointer-events-none absolute -left-16 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-cyan-500/0 blur-3xl transition group-hover:bg-cyan-400/25" />
                  <div className="pointer-events-none absolute -right-20 bottom-8 h-28 w-28 rounded-full bg-purple-500/0 blur-3xl transition group-hover:bg-purple-500/25" />
                </MotionDiv>
              );
            })}
          </div>
        )}
      </div>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="grid gap-8 rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-10 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr] lg:items-center"
      >
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            loyalty runway
          </span>
          <h2 className="text-3xl font-semibold md:text-4xl">Choreograph every milestone in an illuminated grid.</h2>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Map onboarding to prestige without friction. Each column tracks outcomes, so your designers and analysts move in lockstep.
          </p>
        </div>
        <div className="grid gap-6">
          {loyaltyMoments.map((moment, index) => (
            <MotionDiv
              key={moment.stage}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg"
            >
              <div className={`pointer-events-none absolute -right-16 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-gradient-to-br ${moment.color} blur-3xl`} />
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{moment.stage}</p>
              <p className="mt-4 text-base text-muted-foreground">{moment.copy}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                {moment.metric}
              </p>
            </MotionDiv>
          ))}
        </div>
      </MotionDiv>

      <MomentumShowcase />

      <MotionDiv
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[44px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-10 text-center backdrop-blur-xl"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(162,87,255,0.28),transparent_55%)]" />
        <h2 className="text-3xl font-semibold md:text-4xl">Ready to launch a breathtaking reward hub?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Invite your team, stitch in your economy data, and light up a responsive grid that keeps momentum at the centre.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <GradientButton
            size="lg"
            onClick={() => {
              router.push(user ? "/dashboard" : "/login");
            }}
            className="group flex items-center gap-3 border border-white/10 bg-gradient-to-r from-cyan-500/60 via-primary/50 to-purple-500/60 text-base shadow-[0_0_35px_-18px_rgba(162,87,255,0.85)] transition duration-300 hover:shadow-[0_0_55px_-18px_rgba(110,221,255,0.85)]"
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
