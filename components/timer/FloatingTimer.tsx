"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, Square, Timer } from "lucide-react";
import { useTimerContext } from "@/contexts/TimerContext";
import { formatTime } from "@/lib/utils";
import { LABEL_COLORS } from "@/types";

export function FloatingTimer() {
  const { state, pause, resume, cancel } = useTimerContext();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = state.status === "running" || state.status === "paused";
  // Don't show on dashboard (full timer is already visible there)
  const isOnDashboard = pathname === "/dashboard";

  const labelColor = LABEL_COLORS[state.label] ?? "#ef4444";
  const progress = isActive
    ? 1 - state.remainingSeconds / (state.durationMinutes * 60)
    : 0;
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <AnimatePresence>
      {isActive && !isOnDashboard && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 md:left-auto md:translate-x-0 md:right-6"
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl"
            style={{
              background: `${labelColor}18`,
              borderColor: `${labelColor}40`,
              boxShadow: `0 8px 32px ${labelColor}30`,
            }}
          >
            {/* Ring progress */}
            <button
              onClick={() => router.push("/dashboard")}
              className="relative flex items-center justify-center w-9 h-9 shrink-0"
              title="Go to timer"
            >
              <svg width={36} height={36} className="-rotate-90 absolute inset-0">
                <circle cx={18} cy={18} r={16} fill="none" stroke="#27272a" strokeWidth={3} />
                <circle
                  cx={18}
                  cy={18}
                  r={16}
                  fill="none"
                  stroke={labelColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <Timer size={13} style={{ color: labelColor }} />
            </button>

            {/* Time + label */}
            <button
              onClick={() => router.push("/dashboard")}
              className="text-left"
            >
              <div className="font-mono font-bold text-text-primary text-base leading-none tabular-nums">
                {formatTime(state.remainingSeconds)}
              </div>
              <div className="text-[10px] font-medium mt-0.5" style={{ color: labelColor }}>
                {state.label}
              </div>
            </button>

            {/* Controls */}
            <div className="flex items-center gap-1.5 ml-1">
              {state.status === "running" ? (
                <button
                  onClick={pause}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 hover:bg-white/10"
                  style={{ color: labelColor }}
                  title="Pause"
                >
                  <Pause size={15} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={resume}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 hover:bg-white/10"
                  style={{ color: labelColor }}
                  title="Resume"
                >
                  <Play size={15} fill="currentColor" />
                </button>
              )}
              <button
                onClick={cancel}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-400 transition-all active:scale-90 hover:bg-white/10"
                title="Cancel"
              >
                <Square size={13} fill="currentColor" />
              </button>
            </div>
          </div>

          {/* Pulse ring when running */}
          {state.status === "running" && (
            <div
              className="absolute inset-0 rounded-2xl animate-ping opacity-20 pointer-events-none"
              style={{ backgroundColor: labelColor }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
