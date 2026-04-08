"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DailyStats } from "@/types";
import { formatDayLabel, getDayKey } from "@/lib/utils";

interface ActivityChartProps {
  data: DailyStats[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-3 py-2 text-sm shadow-xl">
      <div className="text-text-secondary text-xs mb-1">{label}</div>
      <div className="font-bold text-tomato">{payload[0].value} 🍅</div>
    </div>
  );
};

export function ActivityChart({ data }: ActivityChartProps) {
  const today = getDayKey();
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const chartData = data.map((d) => ({
    name: formatDayLabel(d.date),
    count: d.count,
    isToday: d.date === today,
  }));

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Activity (7 days)
        </h3>
        <div className="text-sm font-bold text-tomato">
          {data.reduce((s, d) => s + d.count, 0)} total
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 5, right: 0, bottom: 0, left: -30 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, maxCount + 1]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isToday ? "#ef4444" : entry.count > 0 ? "#ef444480" : "#27272a"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
