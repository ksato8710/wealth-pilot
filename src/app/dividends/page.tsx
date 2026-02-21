"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  CalendarDays,
  TrendingUp,
  Coins,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { monthlyDividends, dividendRecords, holdings } from "@/data/mock-data";

const monthLabels = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#27272a] bg-[#18181b] p-3 shadow-xl">
      <p className="mb-2 text-sm font-medium text-white">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <div
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#a1a1aa]">
            {entry.dataKey === "actual" ? "実績" : "予測"}:
          </span>
          <span className="font-medium text-white">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DividendsPage() {
  const [selectedYear, setSelectedYear] = useState<2025 | 2026>(2026);

  const yearData = useMemo(() => {
    const prefix = `${selectedYear}-`;
    return monthlyDividends
      .filter((d) => d.month.startsWith(prefix))
      .map((d, i) => ({
        month: monthLabels[i],
        actual: d.amount,
        forecast: d.forecast,
      }));
  }, [selectedYear]);

  const totalDividendsThisYear = useMemo(() => {
    const prefix = `${selectedYear}-`;
    return monthlyDividends
      .filter((d) => d.month.startsWith(prefix))
      .reduce((sum, d) => sum + d.amount + (d.forecast > d.amount ? d.forecast - d.amount : 0), 0);
  }, [selectedYear]);

  const monthlyAverage = useMemo(() => {
    return Math.round(totalDividendsThisYear / 12);
  }, [totalDividendsThisYear]);

  const annualYield = useMemo(() => {
    const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const totalAnnualDividend = holdings.reduce((sum, h) => sum + h.annualDividend, 0);
    return totalMarketValue > 0 ? (totalAnnualDividend / totalMarketValue) * 100 : 0;
  }, []);

  const upcomingDividends = useMemo(() => {
    return dividendRecords
      .filter((d) => d.type === "forecast")
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  }, []);

  const pastDividends = useMemo(() => {
    return dividendRecords
      .filter((d) => d.type === "actual")
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, []);

  const nextPayment = upcomingDividends[0];

  const summaryCards = [
    {
      title: "年間配当金合計",
      value: formatCurrency(totalDividendsThisYear),
      subtitle: `${selectedYear}年 (実績+予測)`,
      icon: Coins,
      color: "#6366f1",
    },
    {
      title: "月平均配当金",
      value: formatCurrency(monthlyAverage),
      subtitle: "12ヶ月平均",
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      title: "次回配当予定",
      value: nextPayment ? formatCurrency(nextPayment.amount) : "-",
      subtitle: nextPayment
        ? `${nextPayment.name} - ${nextPayment.paymentDate}`
        : "予定なし",
      icon: CalendarDays,
      color: "#8b5cf6",
    },
    {
      title: "年間配当利回り",
      value: `${annualYield.toFixed(2)}%`,
      subtitle: "ポートフォリオ加重平均",
      icon: ArrowUpRight,
      color: "#f59e0b",
    },
  ];

  return (
    <div>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[#a1a1aa]">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {card.value}
                      </p>
                      <p className="text-xs text-[#71717a]">{card.subtitle}</p>
                    </div>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${card.color}15` }}
                    >
                      <card.icon
                        className="h-5 w-5"
                        style={{ color: card.color }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Monthly Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">月別配当金推移</CardTitle>
                  <CardDescription>
                    月ごとの配当金実績と予測を表示
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedYear(2025)}
                    disabled={selectedYear === 2025}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[56px] text-center text-sm font-semibold text-white">
                    {selectedYear}年
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedYear(2026)}
                    disabled={selectedYear === 2026}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={yearData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#27272a"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#71717a", fontSize: 12 }}
                      tickFormatter={(value: number) =>
                        value >= 10000
                          ? `${(value / 10000).toFixed(0)}万`
                          : `${value}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Legend
                      formatter={(value: string) =>
                        value === "actual" ? "実績" : "予測"
                      }
                      wrapperStyle={{ paddingTop: "16px" }}
                      iconType="square"
                    />
                    <Bar
                      dataKey="actual"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="forecast"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    >
                      {yearData.map((entry, index) => (
                        <Cell
                          key={`forecast-${index}`}
                          fill={
                            entry.forecast > 0 ? "#6366f160" : "transparent"
                          }
                          stroke={entry.forecast > 0 ? "#6366f1" : "transparent"}
                          strokeWidth={1}
                          strokeDasharray="4 2"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two Column Layout: Upcoming + History */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upcoming Dividends Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#6366f1]" />
                  <div>
                    <CardTitle>配当カレンダー</CardTitle>
                    <CardDescription>今後の配当予定</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingDividends.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                      className="flex items-center justify-between rounded-lg border border-[#27272a] bg-[#09090b] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-[#6366f1]/10">
                          <span className="text-[10px] font-medium text-[#6366f1]">
                            {new Date(record.paymentDate).toLocaleDateString(
                              "ja-JP",
                              { month: "short" }
                            )}
                          </span>
                          <span className="text-xs font-bold text-[#6366f1]">
                            {new Date(record.paymentDate).getDate()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {record.name}
                          </p>
                          <p className="text-xs text-[#71717a]">
                            {record.symbol} / 権利落日:{" "}
                            {record.exDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(record.amount)}
                        </span>
                        <Badge variant="default">予測</Badge>
                      </div>
                    </motion.div>
                  ))}
                  {upcomingDividends.length === 0 && (
                    <p className="py-8 text-center text-sm text-[#71717a]">
                      今後の配当予定はありません
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dividend History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-[#10b981]" />
                  <div>
                    <CardTitle>配当金履歴</CardTitle>
                    <CardDescription>過去の配当金受取実績</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#27272a]">
                        <th className="pb-3 text-left text-xs font-medium text-[#71717a]">
                          支払日
                        </th>
                        <th className="pb-3 text-left text-xs font-medium text-[#71717a]">
                          銘柄
                        </th>
                        <th className="pb-3 text-right text-xs font-medium text-[#71717a]">
                          金額
                        </th>
                        <th className="pb-3 text-right text-xs font-medium text-[#71717a]">
                          ステータス
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastDividends.map((record, index) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.6 + index * 0.05,
                          }}
                          className="border-b border-[#27272a]/50 last:border-0"
                        >
                          <td className="py-3 text-sm text-[#a1a1aa]">
                            {record.paymentDate}
                          </td>
                          <td className="py-3">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {record.name}
                              </p>
                              <p className="text-xs text-[#71717a]">
                                {record.symbol}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 text-right text-sm font-semibold text-[#10b981]">
                            {formatCurrency(record.amount)}
                          </td>
                          <td className="py-3 text-right">
                            <Badge variant="profit">受取済</Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 rounded-lg border border-[#27272a] bg-[#09090b] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a1a1aa]">
                      受取済み合計
                    </span>
                    <span className="text-lg font-bold text-[#10b981]">
                      {formatCurrency(
                        pastDividends.reduce((sum, d) => sum + d.amount, 0)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
