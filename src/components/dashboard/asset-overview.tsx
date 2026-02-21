"use client";

import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  holdings,
  getTotalAsset,
  getTotalUnrealizedPL,
  getTotalDayChange,
  nisaStatus,
} from "@/data/mock-data";
import { formatCurrency, formatPercent } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function AssetOverview() {
  const totalAsset = useMemo(() => getTotalAsset(), []);
  const unrealizedPL = useMemo(() => getTotalUnrealizedPL(), []);
  const dayChange = useMemo(() => getTotalDayChange(), []);

  const dayChangePercent = useMemo(() => {
    const previousTotal = totalAsset - dayChange;
    return previousTotal !== 0 ? (dayChange / previousTotal) * 100 : 0;
  }, [totalAsset, dayChange]);

  const annualDividend = useMemo(
    () => holdings.reduce((sum, h) => sum + h.annualDividend, 0),
    []
  );

  const dividendYield = useMemo(() => {
    const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    return totalMarketValue > 0 ? (annualDividend / totalMarketValue) * 100 : 0;
  }, [annualDividend]);

  const unrealizedPLPercent = useMemo(() => {
    const totalInvested = totalAsset - unrealizedPL;
    return totalInvested !== 0 ? (unrealizedPL / totalInvested) * 100 : 0;
  }, [totalAsset, unrealizedPL]);

  const nisaUsedTotal = nisaStatus.growthUsed + nisaStatus.tsumitateUsed;
  const nisaLimitTotal = nisaStatus.growthLimit + nisaStatus.tsumitateLimit;
  const nisaUsagePercent =
    nisaLimitTotal > 0 ? (nisaUsedTotal / nisaLimitTotal) * 100 : 0;

  const cards = [
    {
      icon: Wallet,
      iconColor: "text-[#6366f1]",
      iconBg: "bg-[#6366f1]/10",
      title: "総資産",
  value: formatCurrency(totalAsset),
      sub: (
        <span
          className={
            dayChange >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
          }
        >
          {formatCurrency(dayChange)} ({formatPercent(dayChangePercent)}) 本日
        </span>
      ),
    },
    {
      icon: TrendingUp,
      iconColor: unrealizedPL >= 0 ? "text-[#10b981]" : "text-[#ef4444]",
      iconBg:
        unrealizedPL >= 0 ? "bg-[#10b981]/10" : "bg-[#ef4444]/10",
      title: "含み損益",
      value: (
        <span
          className={
            unrealizedPL >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
          }
        >
          {formatCurrency(unrealizedPL)}
        </span>
      ),
      sub: (
        <span
          className={
            unrealizedPL >= 0 ? "text-[#10b981]/70" : "text-[#ef4444]/70"
          }
        >
          {formatPercent(unrealizedPLPercent)}
        </span>
      ),
    },
    {
      icon: Banknote,
      iconColor: "text-[#10b981]",
      iconBg: "bg-[#10b981]/10",
      title: "年間配当金",
      value: formatCurrency(annualDividend),
      sub: (
        <span className="text-[#a1a1aa]">
          利回り {dividendYield.toFixed(2)}%
        </span>
      ),
    },
    {
      icon: ShieldCheck,
      iconColor: "text-[#6366f1]",
      iconBg: "bg-[#6366f1]/10",
      title: "NISA利用率",
      value: `${nisaUsagePercent.toFixed(1)}%`,
      sub: (
        <span className="text-[#a1a1aa]">
          {formatCurrency(nisaUsedTotal)} / {formatCurrency(nisaLimitTotal)}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.title} variants={itemVariants}>
            <Card className="h-full transition-colors hover:border-[#3f3f46]">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <p className="text-sm font-medium text-[#a1a1aa]">
                    {card.title}
                  </p>
                </div>
                <div className="mt-3 text-2xl font-bold tracking-tight">
                  {card.value}
                </div>
                <div className="mt-1 text-xs">{card.sub}</div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
