"use client";

import type { Profile } from "@/types";
import { calculateLevel } from "@/types";
import { getLevelTitle } from "@/lib/gamification";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  profile: Profile;
  todayCount: number;
}

export function StatsCards({ profile, todayCount }: StatsCardsProps) {
  const { level } = calculateLevel(profile.total_xp);
  const available = profile.dota_games_earned - (profile.dota_games_played ?? 0);

  const cards = [
    {
      icon: "🍅",
      label: "Today",
      value: todayCount,
      sub: "Pomodoros",
      color: "text-tomato",
      bg: "bg-tomato/10",
      border: "border-tomato/20",
    },
    {
      icon: "🔥",
      label: "Streak",
      value: profile.current_streak,
      sub: "days",
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      border: "border-orange-400/20",
    },
    {
      icon: "⚡",
      label: "Level",
      value: level,
      sub: getLevelTitle(level),
      color: "text-dota",
      bg: "bg-dota/10",
      border: "border-dota/20",
    },
    {
      icon: "🎮",
      label: "Games",
      value: available < 0 ? available : `+${available}`,
      sub: available < 0 ? "in debt" : "available",
      color: available < 0 ? "text-red-400" : "text-gold",
      bg: available < 0 ? "bg-red-500/10" : "bg-gold/10",
      border: available < 0 ? "border-red-500/20" : "border-gold/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-2xl p-4 border",
            card.bg,
            card.border
          )}
        >
          <div className="text-2xl mb-2">{card.icon}</div>
          <div className={cn("text-2xl font-bold", card.color)}>{card.value}</div>
          <div className="text-xs text-text-secondary mt-0.5">{card.sub}</div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wider mt-1 font-semibold">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
