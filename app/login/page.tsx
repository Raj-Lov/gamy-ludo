"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Radar, ShieldCheck, Sparkles, Users } from "lucide-react";

import { GradientButton } from "@/components/primitives/gradient-button";
import { GlassCard } from "@/components/primitives/glass-card";
import { MotionDiv, MotionSpan, useAuth } from "@/components/providers";

const featureHighlights = [
  {
    title: "Squad presence",
    description: "Coordinate puzzle runs with realtime visibility across every lobby.",
    icon: Users
  },
  {
    title: "Adaptive alerts",
    description: "Trigger cinematic nudges the moment a streak is at risk.",
    icon: Radar
  },
  {
    title: "Shielded access",
    description: "Google-backed security keeps sessions verified and resilient.",
    icon: ShieldCheck
  },
  {
    title: "Spark uptime",
    description: "Deploy new quests without downtime using frictionless auth.",
    icon: Sparkles
  }
];

const trustSignals = [
  { label: "Active squads", value: "200+" },
  { label: "Avg. retention lift", value: "3.2x" },
  { label: "Daily quests cleared", value: "98%" }
];

function GoogleMark() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 p-1 shadow-[0_8px_20px_-12px_rgba(15,23,42,0.55)]">
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

const LoginPage = () => {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  return (
    <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-12 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),transparent_65%)] blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.26),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.4)_0%,rgba(24,24,35,0.55)_40%,rgba(2,6,23,0.2)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:32px_32px] opacity-20" />
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[1.05fr_minmax(0,1fr)]">
        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-10"
        >
          <div className="space-y-6">
            <MotionSpan
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.5em] text-muted-foreground"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Access Layer
            </MotionSpan>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Welcome back to the control room.</h1>
              <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                Sign in to orchestrate puzzle drops, monitor player sentiment, and deliver next-gen motion loops to every squad without friction.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition duration-500 hover:border-white/30 hover:shadow-[0_20px_50px_-30px_rgba(56,189,248,0.65)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-violet-500/30 text-cyan-200">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            {trustSignals.map((signal) => (
              <div
                key={signal.label}
                className="min-w-[160px] rounded-2xl border border-white/10 bg-white/[0.08] px-5 py-4 text-left backdrop-blur"
              >
                <p className="text-[10px] uppercase tracking-[0.55em] text-muted-foreground">{signal.label}</p>
                <p className="mt-3 text-2xl font-semibold text-foreground">{signal.value}</p>
              </div>
            ))}
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: "easeOut" }}
        >
          <GlassCard className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.08] p-10 text-left shadow-[0_30px_80px_-40px_rgba(76,201,240,0.6)]">
            <div className="pointer-events-none absolute -right-20 top-[-120px] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.35),transparent_70%)] blur-3xl" />
            <div className="pointer-events-none absolute -left-24 bottom-[-140px] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(192,132,252,0.25),transparent_65%)] blur-3xl" />

            <div className="relative space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                  Secure Gateway
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Enter your gaming hub</h2>
                  <p className="text-sm text-muted-foreground">
                    Continue with Google to sync squads, deploy puzzles, and unlock the admin dashboard in seconds.
                  </p>
                </div>
              </div>

              <GradientButton
                size="lg"
                className="w-full justify-between gap-4 rounded-2xl px-6 py-6 text-base"
                onClick={() => {
                  void signInWithGoogle();
                }}
                disabled={loading}
              >
                <span className="flex items-center gap-3 text-left font-semibold">
                  <GoogleMark />
                  Continue with Google
                </span>
                <ArrowRight className="h-5 w-5" />
              </GradientButton>

              <p className="text-xs text-muted-foreground">
                By continuing, you agree to the squad guidelines and consent to puzzle analytics that elevate your experience.
              </p>
            </div>
          </GlassCard>
        </MotionDiv>
      </div>
    </section>
  );
};

export default LoginPage;
