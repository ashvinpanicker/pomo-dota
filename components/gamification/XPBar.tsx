"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { calculateLevel, XP_PER_LEVEL } from "@/types";
import { getLevelTitle } from "@/lib/gamification";
import { Progress } from "@/components/ui/Progress";

interface XPBarProps {
  totalXp: number;
  compact?: boolean;
}

export function XPBar({ totalXp, compact }: XPBarProps) {
  const { level, xpInLevel, xpForNext } = calculateLevel(totalXp);
  const title = getLevelTitle(level);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-dota">
          <Zap size={14} className="fill-current" />
          <span className="text-xs font-bold">Lv.{level}</span>
        </div>
        <Progress value={xpInLevel / xpForNext} color="dota" size="sm" className="flex-1" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-dota/20 flex items-center justify-center">
            <Zap size={16} className="text-dota fill-current" />
          </div>
          <div>
            <div className="text-sm font-bold text-text-primary">Level {level}</div>
            <div className="text-xs text-dota">{title}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-text-primary">{totalXp.toLocaleString()}</div>
          <div className="text-xs text-text-secondary">total XP</div>
        </div>
      </div>
      <Progress
        value={xpInLevel / xpForNext}
        color="dota"
        size="md"
        showLabel
        label={`${xpInLevel} / ${xpForNext} XP to Level ${level + 1}`}
      />
    </div>
  );
}
