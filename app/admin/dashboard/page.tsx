"use client";

import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, GaugeCircle, Users, Zap } from "lucide-react";

import { GlassCard } from "@/components/primitives/glass-card";
import { MotionDiv } from "@/components/providers";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const Sparkline = ({ values }: { values: number[] }) => {
  const normalized = useMemo(() => {
    if (!values.length) return "";
    const max = Math.max(...values);
    const min = Math.min(...values);
    if (max === min) {
      return values
        .map((_, index) => `${(index / Math.max(values.length - 1, 1)) * 100},50`)
        .join(" ");
    }
    return values
      .map((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * 100;
        const y = ((max - value) / (max - min)) * 70 + 10;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values]);

  if (!normalized) {
    return <div className="h-24 w-full rounded-lg bg-white/5" />;
  }

  const areaPath = useMemo(() => {
    if (!values.length) return "";
    const points = normalized.split(" ").map((point) => point.split(",").map(Number));
    if (!points.length) return "";
    const start = points[0];
    const end = points[points.length - 1];
    const baseline = `L ${end[0]} 90 L ${start[0]} 90 Z`;
    const polyline = points.map(([x, y]) => `${x} ${y}`).join(" L ");
    return `M ${polyline} ${baseline}`;
  }, [normalized, values.length]);

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-24 w-full">
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(56,189,248,0.6)" />
          <stop offset="100%" stopColor="rgba(217,70,239,0.7)" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparklineGradient)" opacity={0.2} />
      <polyline
        points={normalized}
        fill="none"
        stroke="url(#sparklineGradient)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const EngagementBars = ({ values }: { values: number[] }) => {
  const max = useMemo(() => Math.max(...values, 1), [values]);

  return (
    <div className="flex h-32 items-end gap-2">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex-1">
          <div
            className="rounded-t-xl bg-gradient-to-t from-sky-500/30 via-sky-400/50 to-sky-300/80"
            style={{ height: `${(value / max) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboardPage() {
  const { analytics, loading, lastUpdated } = useAdminAnalytics();

  const RevenueDeltaIcon = analytics.revenueDelta >= 0 ? ArrowUpRight : ArrowDownRight;
  const ConversionDeltaIcon = analytics.conversionDelta >= 0 ? ArrowUpRight : ArrowDownRight;
  const revenueDeltaTone = analytics.revenueDelta >= 0 ? "text-emerald-300" : "text-rose-300";
  const conversionDeltaTone = analytics.conversionDelta >= 0 ? "text-emerald-300" : "text-rose-300";

  return (
    <div className="flex flex-col gap-10">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 md:grid-cols-3"
      >
        <GlassCard className="space-y-3 border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-sky-500/20 p-3 text-sky-300">
              <Users className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Players online</p>
              <p className="text-2xl font-semibold text-white">{formatNumber(analytics.playersOnline)}</p>
            </div>
          </div>
          <p className="text-xs text-white/60">Live session count refreshes in real-time from Firebase presence signals.</p>
        </GlassCard>
        <GlassCard className="space-y-3 border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-500/15 p-3 text-emerald-300">
              <Zap className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Coins minted today</p>
              <p className="text-2xl font-semibold text-white">{formatNumber(analytics.coinsMinted)}</p>
            </div>
          </div>
          <p className="text-xs text-white/60">Token distribution aggregated across unlocks, vault drops, and manual grants.</p>
        </GlassCard>
        <GlassCard className="space-y-3 border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-purple-500/20 p-3 text-purple-200">
              <GaugeCircle className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Active lobbies</p>
              <p className="text-2xl font-semibold text-white">{formatNumber(analytics.activeRooms)}</p>
            </div>
          </div>
          <p className="text-xs text-white/60">Real-time concurrency across ranked, private, and practice modes.</p>
        </GlassCard>
      </MotionDiv>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Revenue today</p>
              <p className="text-3xl font-semibold text-white">{formatCurrency(analytics.dailyRevenue)}</p>
            </div>
            <div className={`flex items-center gap-2 text-sm ${revenueDeltaTone}`}>
              <RevenueDeltaIcon className="h-4 w-4" />
              <span>{analytics.revenueDelta.toFixed(1)}%</span>
              <span className="text-white/50">vs yesterday</span>
            </div>
          </div>
          <div className="mt-6">
            <Sparkline values={analytics.mintSparkline} />
          </div>
        </GlassCard>
        <GlassCard className="space-y-4 border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Conversion rate</p>
              <p className="text-3xl font-semibold text-white">{analytics.conversionRate.toFixed(2)}%</p>
            </div>
            <div className={conversionDeltaTone}>
              <ConversionDeltaIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-white/60">Guild invites, leaderboard prompts, and Razorpay nudges funnel into this rate.</p>
          <EngagementBars values={analytics.hourlyEngagement} />
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="space-y-4 border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Retention cohorts</h3>
            <span className="text-xs text-white/50">Avg session: {analytics.avgSessionMinutes.toFixed(1)}m</span>
          </div>
          <div className="space-y-3">
            {analytics.retention.map((entry) => (
              <div key={entry.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{entry.label}</span>
                  <span>{entry.percentage.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400"
                    style={{ width: `${Math.min(entry.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="space-y-4 border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Regional mix</h3>
          <ul className="space-y-3 text-sm text-white/70">
            {analytics.regions.map((region) => (
              <li key={region.region} className="flex items-center justify-between">
                <span>{region.region}</span>
                <span>{region.percentage.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard className="space-y-4 border-white/10 bg-white/[0.03] p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Creator economy</h3>
          <ul className="space-y-3 text-sm text-white/70">
            {analytics.topCreators.map((creator) => (
              <li key={creator.name} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{creator.name}</p>
                  <p className="text-xs text-white/50">{creator.drops} drops</p>
                </div>
                <span>{formatCurrency(creator.revenue)}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.4em] text-white/60">Monetisation snapshot</h3>
          {lastUpdated && (
            <p className="text-xs text-white/50">Updated {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-white/70">
            <thead>
              <tr className="text-xs uppercase tracking-[0.3em] text-white/50">
                <th className="pb-2 pr-6 font-medium">Plan</th>
                <th className="pb-2 pr-6 font-medium">Conversions</th>
                <th className="pb-2 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {analytics.monetization.map((plan) => (
                <tr key={plan.plan} className="hover:bg-white/5">
                  <td className="py-3 pr-6 text-white">{plan.plan}</td>
                  <td className="py-3 pr-6">{formatNumber(plan.conversions)}</td>
                  <td className="py-3">{formatCurrency(plan.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {loading && (
        <p className="text-center text-xs uppercase tracking-[0.4em] text-white/40">Syncing live metrics…</p>
      )}
    </div>
  );
}
