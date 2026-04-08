"use client";

import { AchievementsGrid } from "@/components/gamification/AchievementCard";
import { DotaIntegration } from "@/components/dota/DotaIntegration";
import { useUser } from "@/hooks/useUser";
import { useGameState } from "@/hooks/useGameState";

export default function RewardsPage() {
  const { user } = useUser();
  const { gameState, loading, redeemGame } = useGameState(user?.id ?? null);
  const { profile, achievements, dotaSessions } = gameState;

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-6">
        <div className="h-7 w-28 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="h-48 bg-zinc-800/40 rounded-2xl animate-pulse" />
        <div className="h-7 w-36 bg-zinc-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Rewards 🎮</h1>
        <p className="text-text-secondary text-sm">Track your gaming balance</p>
      </div>

      {profile ? (
        <DotaIntegration
          profile={profile}
          dotaSessions={dotaSessions}
          onManualRedeem={redeemGame}
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-text-secondary">
          Complete a Pomodoro to start earning games!
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-text-primary mb-3">
          Achievements{" "}
          <span className="text-sm font-normal text-text-secondary">
            {achievements.length}/12 unlocked
          </span>
        </h2>
        <AchievementsGrid earned={achievements} />
      </div>
    </div>
  );
}
