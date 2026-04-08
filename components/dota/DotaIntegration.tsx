"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Clock, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile, DotaSession } from "@/types";
import { dotaBalance, pomodorosToClearDebt, POMODOROS_PER_GAME } from "@/types";
import { cn } from "@/lib/utils";

interface DotaIntegrationProps {
  profile: Profile;
  dotaSessions: DotaSession[];
  onManualRedeem: () => void;
}

function generateGsiConfig(token: string, appUrl: string): string {
  // Dota 2 supports multiple cfg files simultaneously — this runs alongside your existing tool on port 6969
  return `"pomo_dota_tracker"
{
    "uri"       "${appUrl}/api/dota-gsi?token=${token}"
    "timeout"   "5.0"
    "buffer"    "0.1"
    "throttle"  "5.0"
    "heartbeat" "30.0"
    "data"
    {
        "provider"  "1"
        "map"       "1"
    }
}`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function DotaBalance({ profile, onManualRedeem }: { profile: Profile; onManualRedeem: () => void }) {
  const balance = dotaBalance(profile);
  const isDebt = balance < 0;
  const pomosNeeded = pomodorosToClearDebt(profile);

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-all",
        isDebt
          ? "bg-red-950/30 border-red-800/40"
          : balance === 0
          ? "bg-card border-border"
          : "bg-gradient-to-br from-dota/20 to-gold/10 border-dota/30"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl",
            isDebt ? "bg-red-900/40" : "bg-dota/20"
          )}
        >
          {isDebt ? "😬" : balance === 0 ? "⚖️" : "🎮"}
        </div>
        <div>
          <div className="text-sm font-medium text-text-secondary">Game Balance</div>
          <div
            className={cn(
              "text-3xl font-bold",
              isDebt ? "text-red-400" : balance === 0 ? "text-text-secondary" : "text-text-primary"
            )}
          >
            {isDebt ? "" : "+"}
            {balance}
            <span className="text-base font-normal text-text-secondary ml-2">
              {isDebt ? "in debt" : "available"}
            </span>
          </div>
        </div>
      </div>

      {isDebt ? (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-3 mb-4">
          <p className="text-sm text-red-300 font-medium mb-1">⚠️ You're in the red</p>
          <p className="text-xs text-red-400/80">
            You've played {Math.abs(balance)} more {Math.abs(balance) === 1 ? "game" : "games"} than you've earned.
            Complete <span className="font-bold text-red-300">{pomosNeeded} Pomodoro{pomosNeeded !== 1 ? "s" : ""}</span> to clear the debt.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-black/20 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-xp">{profile.dota_games_earned}</div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wide mt-0.5">Earned</div>
        </div>
        <div className="bg-black/20 rounded-xl p-3 text-center">
          <div className={cn("text-lg font-bold", isDebt ? "text-red-400" : "text-text-secondary")}>
            {profile.dota_games_played ?? 0}
          </div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wide mt-0.5">Played</div>
        </div>
        <div className="bg-black/20 rounded-xl p-3 text-center">
          <div className={cn("text-lg font-bold", isDebt ? "text-red-400" : "text-gold")}>
            {balance}
          </div>
          <div className="text-[10px] text-text-secondary uppercase tracking-wide mt-0.5">Balance</div>
        </div>
      </div>

      <button
        onClick={onManualRedeem}
        className={cn(
          "w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 border",
          isDebt
            ? "bg-red-900/30 border-red-800/50 text-red-300 hover:bg-red-900/50"
            : "bg-dota/20 border-dota/40 text-dota hover:bg-dota/30"
        )}
      >
        {isDebt ? "🎮 Record game anyway (add to debt)" : "🎮 Log game manually"}
      </button>
      <p className="text-[10px] text-text-secondary text-center mt-2">
        Auto-tracked via Dota 2 GSI · or log manually above
      </p>
    </div>
  );
}

export function DotaIntegration({ profile, dotaSessions, onManualRedeem }: DotaIntegrationProps) {
  const [copied, setCopied] = useState<"config" | "path" | null>(null);
  const [showSetup, setShowSetup] = useState(!profile.gsi_token ? true : dotaSessions.length === 0);
  const [showSessions, setShowSessions] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const gsiConfig = profile.gsi_token ? generateGsiConfig(profile.gsi_token, appUrl) : "";
  const cfgPath = "Steam/steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration/";
  const cfgFilename = "gamestate_integration_pomo_dota.cfg";

  const handleCopy = (type: "config" | "path", text: string) => {
    copyToClipboard(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const completedSessions = dotaSessions.filter((s) => s.ended_at);
  const activeSessions = dotaSessions.filter((s) => !s.ended_at);

  return (
    <div className="space-y-4">
      <DotaBalance profile={profile} onManualRedeem={onManualRedeem} />

      {/* GSI Setup */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowSetup((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Swords size={16} className="text-dota" />
            <span className="text-sm font-semibold text-text-primary">Auto-track via Dota 2 GSI</span>
            {activeSessions.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-xp/20 text-xp text-[10px] font-bold animate-pulse">
                LIVE
              </span>
            )}
          </div>
          {showSetup ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
        </button>

        <AnimatePresence>
          {showSetup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Drop one config file into Dota's folder and every game you finish gets auto-logged.
                  Works <span className="text-text-primary font-medium">alongside</span> your existing sound-effects tool — Dota 2 broadcasts to multiple cfg endpoints simultaneously.
                </p>

                {/* Step 1 */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Step 1 — Copy the config content
                  </p>
                  <div className="relative">
                    <pre className="bg-background border border-border rounded-xl p-3 text-xs text-text-secondary font-mono overflow-x-auto leading-relaxed whitespace-pre">
                      {gsiConfig}
                    </pre>
                    <button
                      onClick={() => handleCopy("config", gsiConfig)}
                      className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-text-secondary hover:text-text-primary transition-all"
                    >
                      {copied === "config" ? <Check size={12} className="text-xp" /> : <Copy size={12} />}
                      {copied === "config" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Step 2 — Save as <code className="text-dota">{cfgFilename}</code> in:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-text-secondary font-mono break-all leading-relaxed">
                      {cfgPath}
                    </code>
                    <button
                      onClick={() => handleCopy("path", cfgPath + cfgFilename)}
                      className="shrink-0 p-2.5 rounded-xl bg-card border border-border text-text-secondary hover:text-text-primary transition-all"
                    >
                      {copied === "path" ? <Check size={14} className="text-xp" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    On macOS: <code className="text-text-primary">~/Library/Application Support/Steam/steamapps/...</code>
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-dota/10 border border-dota/20 rounded-xl p-3">
                  <p className="text-xs font-bold text-dota mb-1">Step 3 — Restart Dota 2</p>
                  <p className="text-xs text-text-secondary">
                    Launch a match and your balance will automatically update when the game ends.
                    Make sure pomo-dota is running at <code className="text-text-primary">{appUrl}</code>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Dota Sessions */}
      {dotaSessions.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowSessions((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-text-secondary" />
              <span className="text-sm font-semibold text-text-primary">
                Recent Games
              </span>
              <span className="text-xs text-text-secondary">({completedSessions.length} tracked)</span>
            </div>
            {showSessions ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
          </button>

          <AnimatePresence>
            {showSessions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border divide-y divide-border/50">
                  {activeSessions.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-2 h-2 rounded-full bg-xp animate-pulse shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-xp">Game in progress</div>
                        <div className="text-xs text-text-secondary">
                          Match {s.match_id} · Started {new Date(s.started_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {completedSessions.slice(0, 8).map((s) => {
                    const date = new Date(s.started_at);
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="text-lg shrink-0">🎮</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-text-primary">
                              {s.duration_minutes ? `${s.duration_minutes} min game` : "Game played"}
                            </span>
                            <span className="text-xs text-red-400 font-semibold shrink-0">−1</span>
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">
                            {isToday ? "Today" : date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
