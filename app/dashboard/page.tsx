"use client";

import Link from "next/link";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { MotionDiv } from "@/components/providers";
import { GlassCard } from "@/components/primitives/glass-card";
import { GradientButton } from "@/components/primitives/gradient-button";
import { useAuth } from "@/components/providers";

const DashboardPage = () => {
  const { user, role, isAdmin } = useAuth();

  return (
    <ProtectedRoute>
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-8 py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-4xl font-semibold text-foreground">
            Welcome back, {user?.displayName ?? user?.email ?? "player"}
          </h2>
          <p className="text-muted-foreground">
            You are signed in as <strong className="text-foreground">{role}</strong>. {isAdmin ? "Use the admin tools to moderate arenas." : "Keep climbing the leaderboard and request admin access if needed."}
          </p>
        </MotionDiv>

        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">Player profile</h3>
            <p className="text-sm text-muted-foreground">
              Email: {user?.email ?? "Unknown"}
            </p>
            <p className="text-sm text-muted-foreground">UID: {user?.uid}</p>
          </GlassCard>
          <GlassCard className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">Admin Console</h3>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "You have elevated privileges. Review moderation queues and system analytics."
                : "Admin tools are locked. Reach out to the core team for elevated access."}
            </p>
            {isAdmin ? (
              <Link href="/admin" className="inline-flex">
                <GradientButton size="sm">Open admin control center</GradientButton>
              </Link>
            ) : null}
          </GlassCard>
        </div>
      </section>
    </ProtectedRoute>
  );
};

export default DashboardPage;
