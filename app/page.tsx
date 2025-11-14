"use client";

import { useRouter } from "next/navigation";

import { MotionDiv, useAuth } from "@/components/providers";
import { GradientButton } from "@/components/primitives/gradient-button";
import { GlassCard } from "@/components/primitives/glass-card";
import { ProgressRing } from "@/components/primitives/progress-ring";

const cardData = [
  {
    title: "Daily XP",
    description: "Track your current streak and experience momentum.",
    value: 82
  },
  {
    title: "Squad Sync",
    description: "Keep tabs on your crew's cooperative quests.",
    value: 64
  },
  {
    title: "Skill Uplift",
    description: "Watch your mastery level climb with each challenge.",
    value: 93
  }
];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-8 py-16">
      <div className="flex flex-col gap-6 text-center">
        <MotionDiv
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl"
        >
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            Neon-coded energy
          </span>
          <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
            Shape your next level gaming experience
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A head start for immersive dashboards that blend glassmorphism, gradient driven CTAs, and motion-powered feedback.
          </p>
        </MotionDiv>
        <div className="flex flex-wrap justify-center gap-4">
          <GradientButton
            size="lg"
            onClick={() => {
              router.push(user ? "/dashboard" : "/login");
            }}
          >
            Launch the arena
          </GradientButton>
          <GradientButton size="lg" variant="outline">
            Learn more
          </GradientButton>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {cardData.map((card) => (
          <MotionDiv
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <GlassCard className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              </div>
              <ProgressRing value={card.value} />
            </GlassCard>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
}
