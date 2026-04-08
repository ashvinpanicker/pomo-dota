"use client";

import { Flame } from "lucide-react";
import { getStreakMessage } from "@/lib/gamification";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  longestStreak?: number;
  compact?: boolean;
}

export function StreakBadge({ streak, longestStreak, compact }: StreakBadgeProps) {
  const message = getStreakMessage(streak);

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Flame
          size={16}
          className={cn(
            streak > 0 ? "text-orange-400 fill-orange-400" : "text-zinc-600"
          )}
        />
        <span className={cn("text-sm font-bold", streak > 0 ? "text-orange-400" : "text-zinc-600")}>
          {streak}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl",
              streak > 0 ? "bg-orange-500/20" : "bg-zinc-800"
            )}
          >
            {streak > 0 ? "🔥" : "💤"}
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">
              {streak}
              <span className="text-base font-normal text-text-secondary ml-1">days</span>
            </div>
            <div className="text-xs text-text-secondary">{message}</div>
          </div>
        </div>
        {longestStreak !== undefined && longestStreak > 0 && (
          <div className="text-right">
            <div className="text-sm font-bold text-text-primary">{longestStreak}</div>
            <div className="text-xs text-text-secondary">best</div>
          </div>
        )}
      </div>
    </div>
  );
}
