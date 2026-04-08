"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Session } from "@/types";
import { LABEL_COLORS } from "@/types";

interface CategoryDonutProps {
  sessions: Session[];
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-sm shadow-xl">
      <div className="font-bold" style={{ color: payload[0].payload.color }}>
        {payload[0].name}
      </div>
      <div className="text-text-secondary">{payload[0].value} Pomodoros</div>
    </div>
  );
};

export function CategoryDonut({ sessions }: CategoryDonutProps) {
  const completed = sessions.filter((s) => s.completed);

  const labelCounts: Record<string, number> = {};
  completed.forEach((s) => {
    labelCounts[s.label] = (labelCounts[s.label] ?? 0) + 1;
  });

  const data = Object.entries(labelCounts)
    .map(([name, value]) => ({
      name,
      value,
      color: LABEL_COLORS[name] ?? "#6b7280",
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Category Breakdown
        </h3>
        <div className="h-32 flex items-center justify-center text-text-secondary text-sm">
          No sessions yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        Category Breakdown
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          {data.map((item) => {
            const pct = Math.round((item.value / completed.length) * 100);
            return (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-primary truncate">{item.name}</span>
                    <span className="text-xs text-text-secondary ml-2 shrink-0">
                      {item.value} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-0.5 h-1 rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
