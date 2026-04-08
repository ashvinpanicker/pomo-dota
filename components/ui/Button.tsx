import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold";
  size?: "sm" | "md" | "lg" | "xl";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
          {
            "bg-tomato hover:bg-tomato-dark text-white focus:ring-tomato shadow-lg shadow-tomato/20":
              variant === "primary",
            "bg-card hover:bg-zinc-700 text-text-primary border border-border focus:ring-zinc-500":
              variant === "secondary",
            "hover:bg-card text-text-secondary hover:text-text-primary focus:ring-zinc-500":
              variant === "ghost",
            "bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 focus:ring-red-500":
              variant === "danger",
            "bg-gold hover:bg-gold-dark text-black font-bold focus:ring-gold shadow-lg shadow-gold/20":
              variant === "gold",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-4 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
            "px-8 py-4 text-lg": size === "xl",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
