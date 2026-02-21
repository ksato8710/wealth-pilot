"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Hash,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { holdings, getTotalUnrealizedPL } from "@/data/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { SectorChart } from "@/components/portfolio/sector-chart";
import { AllocationChart } from "@/components/portfolio/allocation-chart";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

function StatCard({ title, value, subtitle, icon, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">
                {title}
              </p>
              <p
                className={cn(
                  "font-mono text-xl font-bold",
                  trend === "up" && "text-[#10b981]",
                  trend === "down" && "text-[#ef4444]",
                  trend === "neutral" && "text-white",
                  !trend && "text-white"
                )}
              >
                {value}
              </p>
              {subtitle && (
                <p className="text-xs text-[#a1a1aa]">{subtitle}</p>
              )}
            </div>
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                trend === "up" && "bg-[#10b981]/10 text-[#10b981]",
                trend === "down" && "bg-[#ef4444]/10 text-[#ef4444]",
                (!trend || trend === "neutral") &&
                  "bg-[#6366f1]/10 text-[#6366f1]"
              )}
            >
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PortfolioPage() {
  const stats = useMemo(() => {
    const totalMarketValue = holdings.reduce(
      (sum, h) => sum + h.marketValue,
      0
    );
    const totalPL = getTotalUnrealizedPL();
    const totalPLPercent =
      totalMarketValue - totalPL > 0
        ? (totalPL / (totalMarketValue - totalPL)) * 100
        : 0;

    const best = holdings.reduce((prev, curr) =>
      curr.unrealizedPLPercent > prev.unrealizedPLPercent ? curr : prev
    );
    const worst = holdings.reduce((prev, curr) =>
      curr.unrealizedPLPercent < prev.unrealizedPLPercent ? curr : prev
    );

    return { totalMarketValue, totalPL, totalPLPercent, best, worst };
  }, []);

  return (
    <div className="pb-12">
      <div className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="保有資産総額"
            value={formatCurrency(stats.totalMarketValue)}
            subtitle={`${holdings.length} 銘柄`}
            icon={<Briefcase className="h-5 w-5" />}
            delay={0}
          />
          <StatCard
            title="含み損益"
            value={
              (stats.totalPL >= 0 ? "+" : "") +
              formatCurrency(stats.totalPL)
            }
            subtitle={formatPercent(stats.totalPLPercent)}
            icon={
              stats.totalPL >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )
            }
            trend={stats.totalPL >= 0 ? "up" : "down"}
            delay={0.05}
          />
          <StatCard
            title="保有銘柄数"
            value={String(holdings.length)}
            subtitle="複数市場に分散"
            icon={<Hash className="h-5 w-5" />}
            trend="neutral"
            delay={0.1}
          />
          <StatCard
            title="最優秀銘柄"
            value={formatPercent(stats.best.unrealizedPLPercent)}
            subtitle={`${stats.best.symbol} ${stats.best.name}`}
            icon={<Trophy className="h-5 w-5" />}
            trend="up"
            delay={0.15}
          />
          <StatCard
            title="最劣後銘柄"
            value={formatPercent(stats.worst.unrealizedPLPercent)}
            subtitle={`${stats.worst.symbol} ${stats.worst.name}`}
            icon={<AlertTriangle className="h-5 w-5" />}
            trend="down"
            delay={0.2}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sector chart - left 1/3 */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>セクター配分</CardTitle>
              </CardHeader>
              <CardContent>
                <SectorChart />
              </CardContent>
            </Card>
          </motion.div>

          {/* Allocation chart - right 2/3 */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>資産配分</CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationChart />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Holdings table - full width */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>保有銘柄一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <HoldingsTable />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
