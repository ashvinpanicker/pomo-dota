"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTimer } from "@/hooks/useTimer";
import type { SessionLabel } from "@/types";

type TimerContextValue = ReturnType<typeof useTimer>;

const TimerContext = createContext<TimerContextValue | null>(null);

interface TimerProviderProps {
  children: ReactNode;
  onComplete?: (sessionId: string, label: SessionLabel, duration: number, notes: string) => void;
}

export function TimerProvider({ children, onComplete }: TimerProviderProps) {
  const timer = useTimer({ onComplete });
  return <TimerContext.Provider value={timer}>{children}</TimerContext.Provider>;
}

export function useTimerContext(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimerContext must be used inside TimerProvider");
  return ctx;
}
