"use client";

import { StatsCards } from "@/components/analytics/StatsCards";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { CategoryDonut } from "@/components/analytics/CategoryDonut";
import { RecentSessions } from "@/components/analytics/RecentSessions";
import { StreakBadge } from "@/components/gamification/StreakBadge";
import { useUser } from "@/hooks/useUser";
import { useGameState } from "@/hooks/useGameState";

export default function AnalyticsPage() {
  const { user } = useUser();
  const { gameState, loading } = useGameState(user?.id ?? null);

  const { profile, sessions, weeklyStats, todaySessions } = gameState;

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-5">
        <div className="h-7 w-32 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-36 bg-zinc-800/40 rounded-2xl animate-pulse" />
        <div className="h-48 bg-zinc-800/40 rounded-2xl animate-pulse" />
        <div className="h-48 bg-zinc-800/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics 📊</h1>
          <p className="text-text-secondary text-sm">Your productivity story</p>
        </div>

        {/* Stats cards */}
        {profile && (
          <StatsCards profile={profile} todayCount={todaySessions.length} />
        )}

        {/* Streak */}
        {profile && (
          <StreakBadge
            streak={profile.current_streak}
            longestStreak={profile.longest_streak}
          />
        )}

        {/* Activity chart */}
        <ActivityChart data={weeklyStats} />

        {/* Category donut */}
        <CategoryDonut sessions={sessions} />

        {/* Recent sessions */}
        <RecentSessions sessions={sessions} limit={20} />
      </div>
  );
}
