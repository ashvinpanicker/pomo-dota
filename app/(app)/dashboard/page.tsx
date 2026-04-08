"use client";

import { PomodoroTimer } from "@/components/timer/PomodoroTimer";
import { XPBar } from "@/components/gamification/XPBar";
import { useUser } from "@/hooks/useUser";
import { useGameState } from "@/hooks/useGameState";
import { dotaBalance } from "@/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useUser();
  const { gameState, loading } = useGameState(user?.id ?? null);

  if (loading) {
    return (
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-7 w-36 bg-zinc-800 rounded-xl animate-pulse" />
            <div className="h-4 w-48 bg-zinc-800/60 rounded-lg animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-zinc-800 rounded-xl animate-pulse" />
        </div>
        <div className="h-6 w-full bg-zinc-800/60 rounded-full animate-pulse" />
        <div className="h-80 bg-zinc-800/40 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Quest Timer 🍅</h1>
          <p className="text-text-secondary text-sm">
            {gameState.todaySessions.length === 0
              ? "Start your first Pomodoro today"
              : `${gameState.todaySessions.length} done today — keep going!`}
          </p>
        </div>
        {gameState.profile && (() => {
          const balance = dotaBalance(gameState.profile!);
          return (
            <div className="text-right">
              <div className="text-xs text-text-secondary">{balance < 0 ? "In debt" : "Available"}</div>
              <div className={cn("text-xl font-bold", balance < 0 ? "text-red-400" : "text-gold")}>
                {balance < 0 ? balance : `+${balance}`} 🎮
              </div>
            </div>
          );
        })()}
      </div>

      {gameState.profile && (
        <div className="mb-6">
          <XPBar totalXp={gameState.profile.total_xp} />
        </div>
      )}

      <PomodoroTimer profile={gameState.profile} />
    </div>
  );
}
