"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import type { Holding } from "@/lib/types";

interface HeatmapCell {
  symbol: string;
  name: string;
  marketValue: number;
  dayChangePercent: number;
  proportion: number;
}

function getHeatColor(percent: number): string {
  if (percent >= 1.0) return "bg-[#059669]";
  if (percent >= 0.5) return "bg-[#10b981]/80";
  if (percent >= 0.0) return "bg-[#10b981]/40";
  if (percent >= -0.5) return "bg-[#ef4444]/40";
  if (percent >= -1.0) return "bg-[#ef4444]/80";
  return "bg-[#dc2626]";
}

function getTextColor(percent: number): string {
  if (Math.abs(percent) >= 0.5) return "text-white";
  return "text-[#d4d4d8]";
}

interface PortfolioHeatmapProps {
  holdings: Holding[];
}

export default function PortfolioHeatmap({ holdings }: PortfolioHeatmapProps) {
  const cells: HeatmapCell[] = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    return holdings
      .map((h) => ({
        symbol: h.symbol,
        name: h.name,
        marketValue: h.marketValue,
        dayChangePercent: h.dayChangePercent,
        proportion: totalValue > 0 ? h.marketValue / totalValue : 0,
      }))
      .sort((a, b) => b.marketValue - a.marketValue);
  }, [holdings]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle>ポートフォリオ ヒートマップ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid auto-rows-[minmax(64px,1fr)] grid-cols-4 gap-1">
            {cells.map((cell, index) => {
              const span = cell.proportion >= 0.15 ? 2 : 1;

              return (
                <motion.div
                  key={cell.symbol}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.45 + index * 0.04,
                  }}
                  className={`${getHeatColor(
                    cell.dayChangePercent
                  )} col-span-${span} flex flex-col items-center justify-center rounded-md p-2 transition-all hover:brightness-110 cursor-default`}
                  style={{
                    gridColumn: `span ${span}`,
                  }}
                  title={`${cell.name} (${cell.symbol})`}
                >
                  <span
                    className={`text-sm font-bold leading-tight ${getTextColor(
                      cell.dayChangePercent
                    )}`}
                  >
                    {cell.symbol}
                  </span>
                  <span
                    className={`text-xs font-medium ${getTextColor(
                      cell.dayChangePercent
                    )} opacity-90`}
                  >
                    {formatPercent(cell.dayChangePercent)}
                  </span>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span className="text-[10px] text-[#a1a1aa]">損失</span>
            <div className="flex gap-0.5">
              <span className="inline-block h-2.5 w-5 rounded-sm bg-[#dc2626]" />
              <span className="inline-block h-2.5 w-5 rounded-sm bg-[#ef4444]/80" />
              <span className="inline-block h-2.5 w-5 rounded-sm bg-[#ef4444]/40" />
              <span className="inline-block h-2.5 w-5 rounded-sm bg-[#10b981]/40" />
              <span className="inline-block h-2.5 w-5 rounded-sm bg-[#10b981]/80" />
              <span className="inline-block h-2.5 w-5 rounded-sm bg-[#059669]" />
            </div>
            <span className="text-[10px] text-[#a1a1aa]">利益</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
