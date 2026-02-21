"use client";

import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import type { AssetAllocation } from "@/lib/types";
import { assetAllocation } from "@/data/mock-data";

const TARGET_ALLOCATION: Record<string, number> = {
  "日本株式": 35.0,
  "米国株式": 20.0,
  "グローバル株式": 30.0,
  "現金": 15.0,
};

function AllocationBar({ data }: { data: AssetAllocation[] }) {
  return (
    <div className="flex h-8 w-full overflow-hidden rounded-full">
      {data.map((item, index) => (
        <motion.div
          key={item.category}
          className="relative h-full"
          style={{ backgroundColor: item.color }}
          initial={{ width: 0 }}
          animate={{ width: `${item.percentage}%` }}
          transition={{
            duration: 0.6,
            delay: index * 0.1,
            ease: "easeOut",
          }}
        >
          {item.percentage > 8 && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white/90">
              {item.percentage}%
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function TargetComparisonBar({ data }: { data: AssetAllocation[] }) {
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-[#27272a]">
      {data.map((item, index) => {
        const target = TARGET_ALLOCATION[item.category] ?? 0;
        return (
          <motion.div
            key={item.category}
            className="relative h-full opacity-40"
            style={{ backgroundColor: item.color }}
            initial={{ width: 0 }}
            animate={{ width: `${target}%` }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}

interface AllocationRowProps {
  item: AssetAllocation;
  index: number;
  target: number;
}

function AllocationRow({ item, index, target }: AllocationRowProps) {
  const diff = item.percentage - target;
  const isOver = diff > 0;
  const hasDiff = Math.abs(diff) >= 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.06 }}
      className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-[#27272a]/50"
    >
      <div
        className="h-3.5 w-3.5 shrink-0 rounded-full"
        style={{ backgroundColor: item.color }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            {item.category}
          </span>
          <span className="font-mono text-sm font-medium text-white">
            {formatCurrency(item.value)}
          </span>
        </div>

        {/* Progress bar: actual vs target */}
        <div className="mt-2 space-y-1">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#27272a]">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ backgroundColor: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.percentage / 50) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            />
            {/* Target marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-white/60"
              style={{ left: `${(target / 50) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#a1a1aa]">
                実際 {item.percentage}%
              </span>
              <span className="text-[#52525b]">/</span>
              <span className="font-mono text-[#52525b]">
                目標 {target}%
              </span>
            </div>
            {hasDiff && (
              <span
                className={cn(
                  "font-mono",
                  isOver ? "text-[#f59e0b]" : "text-[#10b981]"
                )}
              >
                {isOver ? "+" : ""}
                {diff.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function AllocationChart() {
  const totalValue = assetAllocation.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className="space-y-5">
      {/* Stacked bars */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
          <span>実際の配分</span>
          <span className="font-mono">{formatCurrency(totalValue)}</span>
        </div>
        <AllocationBar data={assetAllocation} />

        <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
          <span>目標配分</span>
          <span className="text-[#52525b]">参考値</span>
        </div>
        <TargetComparisonBar data={assetAllocation} />
      </div>

      {/* Detail rows */}
      <div className="space-y-1">
        {assetAllocation.map((item, index) => {
          const target = TARGET_ALLOCATION[item.category] ?? 0;
          return (
            <AllocationRow
              key={item.category}
              item={item}
              index={index}
              target={target}
            />
          );
        })}
      </div>
    </div>
  );
}
