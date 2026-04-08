"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, ChevronUp, ChevronDown, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useTimerContext } from "@/contexts/TimerContext";
import { LabelSelector } from "./LabelSelector";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/utils";
import { LABEL_COLORS } from "@/types";
import type { Profile } from "@/types";
import { getPomodorosUntilNextGame } from "@/lib/gamification";

interface PomodoroTimerProps {
  profile: Profile | null;
}

const DURATION_PRESETS = [15, 25, 30, 45, 50, 60];

export function PomodoroTimer({ profile }: PomodoroTimerProps) {
  const { state, progress, start, pause, resume, cancel, setDuration, setLabel, setNotes, dismissCompleted } =
    useTimerContext();
  const [showCompleted, setShowCompleted] = useState(false);
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);
  const labelColor = LABEL_COLORS[state.label] ?? "#ef4444";
  const pomosUntilGame = getPomodorosUntilNextGame(profile?.pomodoros_completed ?? 0);

  useEffect(() => {
    if (state.status === "completed") {
      setShowCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ef4444", "#f59e0b", "#8b5cf6", "#22c55e"],
      });
    }
  }, [state.status]);

  const handleDismissCompleted = () => {
    setShowCompleted(false);
    dismissCompleted();
  };

  const isIdle = state.status === "idle";
  const isRunning = state.status === "running";
  const isPaused = state.status === "paused";
  const isCompleted = state.status === "completed";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* Completion overlay */}
      <AnimatePresence>
        {isCompleted && showCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleDismissCompleted}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-xs w-full mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🍅</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Pomodoro Complete!</h2>
              <p className="text-text-secondary text-sm mb-1">
                +{50 + (profile?.current_streak ?? 0 > 0 ? 10 : 0)} XP earned
              </p>
              {pomosUntilGame === 1 ? (
                <p className="text-gold font-semibold text-sm mb-6">
                  🎮 One more for a Dota game!
                </p>
              ) : pomosUntilGame === 2 ? (
                <p className="text-text-secondary text-sm mb-6">
                  {pomosUntilGame} Pomodoros until next game
                </p>
              ) : (
                <p className="text-xp font-semibold text-sm mb-6">
                  🎮 Dota game unlocked!
                </p>
              )}
              <Button variant="primary" size="lg" className="w-full" onClick={handleDismissCompleted}>
                Awesome! 🔥
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer ring */}
      <div className="relative flex items-center justify-center">
        <svg width={280} height={280} className="-rotate-90">
          {/* Track */}
          <circle
            cx={140}
            cy={140}
            r={120}
            fill="none"
            stroke="#27272a"
            strokeWidth={10}
          />
          {/* Progress arc */}
          <circle
            cx={140}
            cy={140}
            r={120}
            fill="none"
            stroke={labelColor}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: isRunning ? `drop-shadow(0 0 8px ${labelColor}80)` : "none",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.remainingSeconds}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="font-mono text-5xl font-bold text-text-primary tracking-tight tabular-nums"
            >
              {formatTime(state.remainingSeconds)}
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: labelColor }}>
            <span>{state.label}</span>
            {isRunning && <Flame size={14} className="animate-pulse" />}
          </div>
          {isRunning && (
            <div className="text-xs text-text-secondary mt-1">
              {Math.round(progress * 100)}% complete
            </div>
          )}
        </div>
      </div>

      {/* Duration adjuster (only when idle) */}
      {isIdle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => setDuration(Math.max(1, state.durationMinutes - 5))}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-zinc-600 transition-all active:scale-95"
          >
            <ChevronDown size={18} />
          </button>
          <div className="flex gap-2">
            {DURATION_PRESETS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  state.durationMinutes === d
                    ? "bg-tomato/20 border border-tomato/40 text-tomato"
                    : "bg-card border border-border text-text-secondary hover:border-zinc-600"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDuration(Math.min(120, state.durationMinutes + 5))}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-zinc-600 transition-all active:scale-95"
          >
            <ChevronUp size={18} />
          </button>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3 w-full">
        {isIdle && (
          <Button
            variant="primary"
            size="xl"
            className="flex-1"
            onClick={() => start()}
          >
            <Play size={20} fill="currentColor" />
            Start
          </Button>
        )}

        {isRunning && (
          <>
            <Button variant="secondary" size="lg" className="flex-1" onClick={pause}>
              <Pause size={18} />
              Pause
            </Button>
            <Button variant="danger" size="lg" onClick={cancel}>
              <Square size={18} />
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button variant="primary" size="lg" className="flex-1" onClick={resume}>
              <Play size={18} fill="currentColor" />
              Resume
            </Button>
            <Button variant="danger" size="lg" onClick={cancel}>
              <Square size={18} />
            </Button>
          </>
        )}
      </div>

      {/* Label selector — always visible */}
      <div className="w-full">
        <p className="text-xs text-text-secondary uppercase tracking-wider mb-2 font-semibold">
          Session Type
        </p>
        <LabelSelector value={state.label} onChange={setLabel} />
      </div>

      {/* Notes — always editable */}
      <div className="w-full">
        <p className="text-xs text-text-secondary uppercase tracking-wider mb-2 font-semibold">
          Notes <span className="normal-case font-normal">(optional)</span>
        </p>
        <textarea
          value={state.notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What are you working on?"
          rows={2}
          maxLength={500}
          className="w-full px-3 py-2.5 rounded-xl bg-card border border-border text-text-primary placeholder:text-zinc-600 text-sm resize-none focus:outline-none focus:border-tomato/40 transition-colors leading-relaxed"
        />
        {state.notes.length > 400 && (
          <p className="text-xs text-text-secondary text-right mt-1">
            {state.notes.length}/500
          </p>
        )}
      </div>

      {/* Streak & rewards hint */}
      {profile && (profile.current_streak > 0 || profile.pomodoros_completed > 0) && (
        <div className="w-full grid grid-cols-2 gap-3">
          {profile.current_streak > 0 && (
            <div className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-xl">🔥</div>
              <div className="text-lg font-bold text-text-primary">{profile.current_streak}</div>
              <div className="text-[10px] text-text-secondary uppercase tracking-wide">Day Streak</div>
            </div>
          )}
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="text-xl">🍅</div>
            <div className="text-lg font-bold text-text-primary">{profile.pomodoros_completed}</div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wide">Total Pomos</div>
          </div>
        </div>
      )}
    </div>
  );
}
