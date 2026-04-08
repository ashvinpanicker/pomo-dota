"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { PRESET_LABELS, LABEL_COLORS, LABEL_EMOJIS, type SessionLabel } from "@/types";
import { cn } from "@/lib/utils";

interface LabelSelectorProps {
  value: SessionLabel;
  onChange: (label: SessionLabel) => void;
  disabled?: boolean;
  disabled?: boolean;
}

export function LabelSelector({ value, onChange, disabled }: LabelSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleCustomSubmit = () => {
    const trimmed = customValue.trim();
    if (trimmed) {
      onChange(trimmed);
      setCustomValue("");
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {PRESET_LABELS.map((label) => {
          const color = LABEL_COLORS[label] ?? "#ef4444";
          const emoji = LABEL_EMOJIS[label] ?? "🍅";
          const active = value === label;
          return (
            <button
              key={label}
              onClick={() => !disabled && onChange(label)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                active
                  ? "text-white scale-105"
                  : "bg-card text-text-secondary border-border hover:border-zinc-600 hover:text-text-primary",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={
                active
                  ? {
                      backgroundColor: color + "33",
                      borderColor: color + "66",
                      color: color,
                    }
                  : {}
              }
            >
              <span>{emoji}</span>
              <span>{label}</span>
              {active && <Check size={12} />}
            </button>
          );
        })}

        {/* Custom label not in presets */}
        {value && !PRESET_LABELS.includes(value as typeof PRESET_LABELS[number]) && (
          <button
            onClick={() => !disabled && onChange(value)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-zinc-800/50 border-zinc-600 text-text-primary scale-105"
          >
            <span>✨</span>
            <span>{value}</span>
            <Check size={12} />
          </button>
        )}

        {!disabled && (
          <button
            onClick={() => setShowCustomInput((v) => !v)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-text-secondary border border-dashed border-border hover:border-zinc-500 hover:text-text-primary transition-all"
          >
            <Plus size={14} />
            Custom
          </button>
        )}
      </div>

      {showCustomInput && (
        <div className="flex gap-2 animate-slide-up">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder="Label name..."
            maxLength={30}
            autoFocus
            className="flex-1 px-3 py-2 rounded-xl bg-card border border-border text-text-primary placeholder:text-text-secondary text-sm focus:outline-none focus:border-tomato/50 transition-colors"
          />
          <button
            onClick={handleCustomSubmit}
            className="px-3 py-2 rounded-xl bg-tomato/20 border border-tomato/30 text-tomato text-sm font-medium hover:bg-tomato/30 transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
