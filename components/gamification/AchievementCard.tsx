"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { AchievementDef } from "@/types";
import { ACHIEVEMENTS } from "@/lib/gamification";
import type { Achievement } from "@/types";

interface AchievementUnlockProps {
  achievements: AchievementDef[];
  onDismiss: () => void;
}

export function AchievementUnlock({ achievements, onDismiss }: AchievementUnlockProps) {
  if (achievements.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center pb-24 md:items-center md:pb-0 px-4"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-card border border-gold/40 rounded-3xl p-6 w-full max-w-sm shadow-2xl shadow-gold/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gold font-bold uppercase tracking-wider">
              🏆 Achievement Unlocked!
            </span>
            <button onClick={onDismiss} className="text-text-secondary hover:text-text-primary">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {achievements.map((ach) => (
              <div key={ach.key} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center text-2xl shrink-0">
                  {ach.icon}
                </div>
                <div>
                  <div className="font-bold text-text-primary">{ach.title}</div>
                  <div className="text-sm text-text-secondary">{ach.description}</div>
                  <div className="text-xs text-gold font-semibold mt-0.5">+{ach.xpReward} XP</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface AchievementsGridProps {
  earned: Achievement[];
}

export function AchievementsGrid({ earned }: AchievementsGridProps) {
  const earnedKeys = new Set(earned.map((a) => a.achievement_key));

  return (
    <div className="grid grid-cols-2 gap-3">
      {ACHIEVEMENTS.map((ach) => {
        const isEarned = earnedKeys.has(ach.key);
        return (
          <div
            key={ach.key}
            className={`rounded-2xl p-4 border transition-all ${
              isEarned
                ? "bg-card border-gold/30 shadow-sm shadow-gold/10"
                : "bg-card/40 border-border opacity-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                  isEarned ? "bg-gold/20" : "bg-zinc-800 grayscale"
                }`}
              >
                {ach.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-text-primary truncate">{ach.title}</div>
                <div className="text-[11px] text-text-secondary mt-0.5 leading-tight">
                  {ach.description}
                </div>
                <div className={`text-xs font-semibold mt-1.5 ${isEarned ? "text-gold" : "text-zinc-600"}`}>
                  +{ach.xpReward} XP
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
