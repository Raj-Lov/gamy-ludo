"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { GradientButton } from "@/components/primitives/gradient-button";
import { GlassCard } from "@/components/primitives/glass-card";
import { useAuth } from "@/components/providers";

const LoginPage = () => {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-8 py-16">
      <GlassCard className="w-full max-w-xl space-y-6 text-center">
        <h2 className="text-3xl font-semibold text-foreground">Access your arena</h2>
        <p className="text-sm text-muted-foreground">
          Sign in with your Google account to sync squads, track quests, and unlock the admin console.
        </p>
        <GradientButton
          size="lg"
          onClick={() => {
            void signInWithGoogle();
          }}
          disabled={loading}
        >
          Continue with Google
        </GradientButton>
      </GlassCard>
    </section>
  );
};

export default LoginPage;
