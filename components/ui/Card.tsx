import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "tomato" | "dota" | "gold" | "none";
}

export function Card({ className, glow = "none", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4",
        {
          "shadow-lg shadow-tomato/10 border-tomato/20": glow === "tomato",
          "shadow-lg shadow-dota/10 border-dota/20": glow === "dota",
          "shadow-lg shadow-gold/10 border-gold/20": glow === "gold",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3", className)} {...props}>
      {children}
    </h3>
  );
}
