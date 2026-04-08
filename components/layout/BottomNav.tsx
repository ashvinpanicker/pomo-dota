"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer, BarChart3, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Timer, label: "Timer" },
  { href: "/analytics", icon: BarChart3, label: "Stats" },
  { href: "/rewards", icon: Gift, label: "Rewards" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-border safe-area-pb md:hidden">
      <div className="grid grid-cols-4 h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 transition-all duration-200",
                active ? "text-tomato" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Icon
                size={22}
                className={cn(
                  "transition-all duration-200",
                  active && "drop-shadow-[0_0_8px_#ef4444]"
                )}
              />
              <span className="text-[10px] font-medium">{label}</span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-tomato rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
