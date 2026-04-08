import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0 to 1
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
  showLabel?: boolean;
  label?: string;
  color?: "tomato" | "dota" | "gold" | "xp";
  size?: "sm" | "md" | "lg";
}

export function Progress({
  value,
  className,
  trackClassName,
  fillClassName,
  showLabel,
  label,
  color = "tomato",
  size = "md",
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value * 100));

  const colorClasses = {
    tomato: "bg-tomato",
    dota: "bg-dota",
    gold: "bg-gold",
    xp: "bg-xp",
  };

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-text-secondary">{label}</span>
          <span className="text-xs font-mono text-text-secondary">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-zinc-800 overflow-hidden",
          sizeClasses[size],
          trackClassName
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorClasses[color],
            fillClassName
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
