"use client";

import { LABEL_COLORS, LABEL_EMOJIS } from "@/types";
import type { Session } from "@/types";
import { formatDuration } from "@/lib/utils";

interface RecentSessionsProps {
  sessions: Session[];
  limit?: number;
}

export function RecentSessions({ sessions, limit = 10 }: RecentSessionsProps) {
  const completed = sessions.filter((s) => s.completed).slice(0, limit);

  if (completed.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Recent Sessions
        </h3>
        <p className="text-text-secondary text-sm text-center py-4">
          No sessions yet. Start your first Pomodoro!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        Recent Sessions
      </h3>
      <div className="space-y-2">
        {completed.map((session) => {
          const color = LABEL_COLORS[session.label] ?? "#6b7280";
          const emoji = LABEL_EMOJIS[session.label] ?? "🍅";
          const date = new Date(session.started_at);
          const timeStr = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={session.id}
              className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                style={{ backgroundColor: color + "20" }}
              >
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text-primary truncate">
                    {session.label}
                  </span>
                  <span className="text-xs font-bold text-xp shrink-0">+{session.xp_earned} XP</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                  <span>{formatDuration(session.duration)}</span>
                  <span>·</span>
                  <span>{dateStr} at {timeStr}</span>
                </div>
                {session.notes && (
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {session.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
