"use client";

import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { FloatingTimer } from "@/components/timer/FloatingTimer";
import { TimerProvider } from "@/contexts/TimerContext";
import type { Profile, SessionLabel } from "@/types";

interface AppShellProps {
  children: React.ReactNode;
  profile: Profile | null;
  onTimerComplete?: (sessionId: string, label: SessionLabel, duration: number) => void;
}

export function AppShell({ children, profile, onTimerComplete }: AppShellProps) {
  return (
    <TimerProvider onComplete={onTimerComplete}>
      <div className="min-h-screen bg-background text-text-primary">
        <Sidebar profile={profile} />
        <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
        <FloatingTimer />
      </div>
    </TimerProvider>
  );
}
