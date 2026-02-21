"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import type { SectorAllocation } from "@/lib/types";
import { sectorAllocations } from "@/data/mock-data";

const SECTOR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#475569",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: SectorAllocation & { color: string };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3 shadow-xl">
      <p className="mb-1 text-sm font-semibold text-white">{data.sector}</p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-6">
          <span className="text-[#a1a1aa]">評価額</span>
          <span className="font-mono text-white">
            {formatCurrency(data.value)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-[#a1a1aa]">配分</span>
          <span className="font-mono text-white">{data.percentage}%</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-[#a1a1aa]">騰落率</span>
          <span
            className={cn(
              "font-mono",
              data.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
            )}
          >
            {formatPercent(data.change)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface CenterLabelProps {
  cx: number;
  cy: number;
  totalValue: number;
}

function CenterLabel({ cx, cy, totalValue }: CenterLabelProps) {
  return (
    <g>
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-[#a1a1aa] text-xs"
      >
        Total Value
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-white text-base font-semibold"
      >
        {formatCurrency(totalValue)}
      </text>
    </g>
  );
}

export function SectorChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalValue = sectorAllocations.reduce((sum, s) => sum + s.value, 0);

  const chartData = sectorAllocations.map((sector, i) => ({
    ...sector,
    color: SECTOR_COLORS[i % SECTOR_COLORS.length],
  }));

  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              dataKey="value"
              nameKey="sector"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.sector}
                  fill={entry.color}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.4
                  }
                  style={{
                    transition: "opacity 0.2s ease",
                    cursor: "pointer",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
            {/* Recharts does not natively support center labels for Pie;
                we render it as a custom SVG element via the chart's children */}
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#a1a1aa"
              fontSize={12}
            >
              合計額
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize={15}
              fontWeight={600}
            >
              {formatCurrency(totalValue)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {chartData.map((sector, index) => (
          <motion.div
            key={sector.sector}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 transition-colors",
              activeIndex === index
                ? "bg-[#27272a]"
                : "hover:bg-[#27272a]/50"
            )}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: sector.color }}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-xs font-medium text-white">
                {sector.sector}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#a1a1aa]">
                  {sector.percentage}%
                </span>
                <span className="font-mono text-xs text-[#a1a1aa]">
                  {formatCurrency(sector.value)}
                </span>
              </div>
            </div>
            <span
              className={cn(
                "shrink-0 font-mono text-xs",
                sector.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
              )}
            >
              {formatPercent(sector.change)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
