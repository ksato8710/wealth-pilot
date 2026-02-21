"use client";

import { useMemo, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { assetHistory } from "@/data/mock-data";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";
import type { DailyAsset } from "@/lib/types";

type Period = "1M" | "3M" | "6M" | "1Y" | "ALL";

const periods: Period[] = ["1M", "3M", "6M", "1Y", "ALL"];

function filterByPeriod(data: DailyAsset[], period: Period): DailyAsset[] {
  if (period === "ALL") return data;

  const now = data.length > 0 ? new Date(data[data.length - 1].date) : new Date();
  const monthsMap: Record<Exclude<Period, "ALL">, number> = {
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "1Y": 12,
  };

  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - monthsMap[period]);

  return data.filter((d) => new Date(d.date) >= cutoff);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const totalAsset = payload.find((p) => p.dataKey === "totalAsset")?.value;
  const invested = payload.find((p) => p.dataKey === "invested")?.value;
  const profitLoss =
    totalAsset !== undefined && invested !== undefined
      ? totalAsset - invested
      : undefined;

  return (
    <div className="rounded-lg border border-[#27272a] bg-[#18181b] px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-[#a1a1aa]">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#6366f1]" />
            <span className="text-xs text-[#a1a1aa]">総資産</span>
          </div>
          <span className="text-xs font-semibold text-white">
            {totalAsset !== undefined ? formatCurrency(totalAsset) : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#71717a]" />
            <span className="text-xs text-[#a1a1aa]">投資元本</span>
          </div>
          <span className="text-xs font-semibold text-white">
            {invested !== undefined ? formatCurrency(invested) : "-"}
          </span>
        </div>
        {profitLoss !== undefined && (
          <div className="flex items-center justify-between gap-6 border-t border-[#27272a] pt-1.5">
            <span className="text-xs text-[#a1a1aa]">損益</span>
            <span
              className={`text-xs font-semibold ${
                profitLoss >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
              }`}
            >
              {formatCurrency(profitLoss)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssetChart() {
  const [period, setPeriod] = useState<Period>("1Y");

  const filteredData = useMemo(
    () => filterByPeriod(assetHistory, period),
    [period]
  );

  const yDomain = useMemo(() => {
    if (filteredData.length === 0) return [0, 10_000_000];
    const allValues = filteredData.flatMap((d) => [d.totalAsset, d.invested]);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.08;
    return [Math.floor((min - padding) / 100_000) * 100_000, Math.ceil((max + padding) / 100_000) * 100_000];
  }, [filteredData]);

  const handlePeriodChange = useCallback((p: Period) => {
    setPeriod(p);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>資産推移</CardTitle>
          <div className="flex gap-1 rounded-lg bg-[#09090b] p-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  period === p
                    ? "bg-[#6366f1] text-white shadow-sm"
                    : "text-[#a1a1aa] hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="assetGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={40}
                />
                <YAxis
                  domain={yDomain}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatCompactCurrency(v)}
                  width={72}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="invested"
                  stroke="#71717a"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  fill="none"
                  dot={false}
                  activeDot={false}
                />
                <Area
                  type="monotone"
                  dataKey="totalAsset"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#assetGradient)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: "#6366f1",
                    stroke: "#18181b",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
