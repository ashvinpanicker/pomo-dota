"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimerState, SessionLabel } from "@/types";
import { generateId, playCompletionSound } from "@/lib/utils";

const STORAGE_KEY = "pomo-dota-timer";

const DEFAULT_STATE: TimerState = {
  status: "idle",
  durationMinutes: 25,
  remainingSeconds: 25 * 60,
  label: "Work",
  notes: "",
  startedAt: null,
  sessionId: null,
};

function loadTimerState(): TimerState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // If timer was running, calculate drift
    if (parsed.status === "running" && parsed.startedAt) {
      const startedAt = new Date(parsed.startedAt);
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const original = parsed.durationMinutes * 60;
      const remaining = Math.max(0, original - elapsed);
      if (remaining === 0) {
        return { ...DEFAULT_STATE, durationMinutes: parsed.durationMinutes, label: parsed.label };
      }
      return { ...parsed, remainingSeconds: remaining, startedAt };
    }
    if (parsed.startedAt) {
      parsed.startedAt = new Date(parsed.startedAt);
    }
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveTimerState(state: TimerState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

interface UseTimerOptions {
  onComplete?: (sessionId: string, label: SessionLabel, duration: number, notes: string) => void;
}

export function useTimer({ onComplete }: UseTimerOptions = {}) {
  const [state, setState] = useState<TimerState>(DEFAULT_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Load persisted state on mount
  useEffect(() => {
    const loaded = loadTimerState();
    setState(loaded);
  }, []);

  // Persist state changes
  useEffect(() => {
    saveTimerState(state);
  }, [state]);

  // Countdown interval
  useEffect(() => {
    if (state.status === "running") {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.status !== "running") return prev;
          if (prev.remainingSeconds <= 1) {
            clearInterval(intervalRef.current!);
            playCompletionSound();
            const sessionId = prev.sessionId ?? generateId();
            onCompleteRef.current?.(sessionId, prev.label, prev.durationMinutes, prev.notes);
            return {
              ...DEFAULT_STATE,
              durationMinutes: prev.durationMinutes,
              label: prev.label,
              status: "completed",
            };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.status]);

  const start = useCallback(() => {
    setState((prev) => ({
      status: "running",
      durationMinutes: prev.durationMinutes,
      remainingSeconds: prev.durationMinutes * 60,
      label: prev.label,
      notes: prev.notes,
      startedAt: new Date(),
      sessionId: generateId(),
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => (prev.status === "running" ? { ...prev, status: "paused" } : prev));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => {
      if (prev.status !== "paused") return prev;
      return {
        ...prev,
        status: "running",
        startedAt: new Date(Date.now() - (prev.durationMinutes * 60 - prev.remainingSeconds) * 1000),
      };
    });
  }, []);

  const cancel = useCallback(() => {
    setState((prev) => ({
      ...DEFAULT_STATE,
      durationMinutes: prev.durationMinutes,
      label: prev.label,
      notes: prev.notes,
    }));
  }, []);

  const setDuration = useCallback((minutes: number) => {
    setState((prev) => {
      if (prev.status !== "idle") return prev;
      return { ...prev, durationMinutes: minutes, remainingSeconds: minutes * 60 };
    });
  }, []);

  const setLabel = useCallback((label: SessionLabel) => {
    setState((prev) => ({ ...prev, label }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  const dismissCompleted = useCallback(() => {
    setState((prev) =>
      prev.status === "completed"
        ? { ...DEFAULT_STATE, durationMinutes: prev.durationMinutes, label: prev.label }
        : prev
    );
  }, []);

  const progress =
    state.status === "idle" || state.status === "completed"
      ? 0
      : 1 - state.remainingSeconds / (state.durationMinutes * 60);

  return {
    state,
    progress,
    start,
    pause,
    resume,
    cancel,
    setDuration,
    setLabel,
    setNotes,
    dismissCompleted,
  };
}
