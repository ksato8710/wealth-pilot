"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingDown,
  Shield,
  Clock,
  ArrowRight,
  Calculator,
  PiggyBank,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { taxSimulation as mockTaxSimulation, nisaStatus as mockNisaStatus } from "@/data/mock-data";
import type { TaxRecommendation } from "@/lib/types";

const typeIcons: Record<TaxRecommendation["type"], typeof TrendingDown> = {
  loss_harvest: TrendingDown,
  nisa_optimize: Shield,
  timing: Clock,
};

const typeLabels: Record<TaxRecommendation["type"], string> = {
  loss_harvest: "損出し",
  nisa_optimize: "NISA最適化",
  timing: "タイミング",
};

const typeColors: Record<TaxRecommendation["type"], string> = {
  loss_harvest: "#ef4444",
  nisa_optimize: "#6366f1",
  timing: "#f59e0b",
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" as const },
};

export default function TaxOptimizerPage() {
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  const taxSimulation = mockTaxSimulation;
  const nisaStatus = mockNisaStatus;

  const profitBarWidth =
    (taxSimulation.realizedProfit /
      (taxSimulation.realizedProfit + Math.abs(taxSimulation.realizedLoss))) *
    100;

  const nisaQuotas = [
    {
      label: "成長投資枠",
      used: nisaStatus.growthUsed,
      limit: nisaStatus.growthLimit,
      color: "#6366f1",
    },
    {
      label: "つみたて投資枠",
      used: nisaStatus.tsumitateUsed,
      limit: nisaStatus.tsumitateLimit,
      color: "#8b5cf6",
    },
    {
      label: "生涯投資枠",
      used: nisaStatus.lifetimeUsed,
      limit: nisaStatus.lifetimeLimit,
      color: "#a78bfa",
    },
  ];

  return (
    <div>
      <div className="space-y-6">
        {/* Tax Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#6366f1]" />
                <div>
                  <CardTitle className="text-lg">損益・税金サマリー</CardTitle>
                  <CardDescription>
                    今年度の実現損益と推定税額
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Numbers */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#a1a1aa]">実現利益</p>
                  <p className="text-xl font-bold text-[#10b981]">
                    {formatCurrency(taxSimulation.realizedProfit)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#a1a1aa]">実現損失</p>
                  <p className="text-xl font-bold text-[#ef4444]">
                    {formatCurrency(taxSimulation.realizedLoss)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#a1a1aa]">純利益</p>
                  <p className="text-xl font-bold text-white">
                    {formatCurrency(taxSimulation.netProfit)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#a1a1aa]">
                    推定税額 ({taxSimulation.taxRate}%)
                  </p>
                  <p className="text-xl font-bold text-[#f59e0b]">
                    {formatCurrency(taxSimulation.estimatedTax)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#a1a1aa]">
                    節税可能額
                  </p>
                  <p className="text-xl font-bold text-[#6366f1]">
                    {formatCurrency(taxSimulation.potentialTaxSaving)}
                  </p>
                </div>
              </div>

              {/* Profit vs Tax Breakdown Bar */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#a1a1aa]">
                  利益・損失内訳
                </p>
                <div className="relative h-8 w-full overflow-hidden rounded-lg bg-[#27272a]">
                  <motion.div
                    className="absolute left-0 top-0 flex h-full items-center justify-center rounded-l-lg bg-[#10b981]"
                    initial={{ width: 0 }}
                    animate={{ width: `${profitBarWidth}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  >
                    <span className="px-2 text-xs font-semibold text-white">
                      利益 {formatCurrency(taxSimulation.realizedProfit)}
                    </span>
                  </motion.div>
                  <motion.div
                    className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-lg bg-[#ef4444]"
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - profitBarWidth}%` }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  >
                    <span className="px-2 text-xs font-semibold text-white">
                      損失 {formatCurrency(Math.abs(taxSimulation.realizedLoss))}
                    </span>
                  </motion.div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#71717a]">
                  <span>
                    手取り予想:{" "}
                    <span className="font-medium text-white">
                      {formatCurrency(
                        taxSimulation.netProfit - taxSimulation.estimatedTax
                      )}
                    </span>
                  </span>
                  <span>
                    税金負担:{" "}
                    <span className="font-medium text-[#f59e0b]">
                      {formatCurrency(taxSimulation.estimatedTax)}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* NISA Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#6366f1]" />
                <div>
                  <CardTitle className="text-lg">NISA枠ステータス</CardTitle>
                  <CardDescription>
                    2026年度のNISA利用状況
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {nisaQuotas.map((quota, index) => {
                  const remaining = quota.limit - quota.used;
                  const percentage = (quota.used / quota.limit) * 100;
                  return (
                    <motion.div
                      key={quota.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      className="space-y-3 rounded-lg border border-[#27272a] bg-[#09090b] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          {quota.label}
                        </span>
                        <span className="text-xs text-[#71717a]">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={quota.used}
                        max={quota.limit}
                        indicatorColor={quota.color}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#a1a1aa]">
                          使用:{" "}
                          <span className="font-medium text-white">
                            {formatCurrency(quota.used)}
                          </span>
                        </span>
                        <span className="text-[#a1a1aa]">
                          上限:{" "}
                          <span className="font-medium text-white">
                            {formatCurrency(quota.limit)}
                          </span>
                        </span>
                      </div>
                      <div className="rounded-md bg-[#18181b] p-2 text-center">
                        <p className="text-[10px] text-[#71717a]">残り枠</p>
                        <p
                          className="text-base font-bold"
                          style={{ color: quota.color }}
                        >
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tax Optimization Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-[#10b981]" />
                <div>
                  <CardTitle className="text-lg">節税提案</CardTitle>
                  <CardDescription>
                    AIが分析した税金最適化の提案
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxSimulation.recommendations.map((rec, index) => {
                  const Icon = typeIcons[rec.type];
                  const color = typeColors[rec.type];
                  const isSimulating = simulatingId === rec.id;

                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    >
                      <div className="rounded-lg border border-[#27272a] bg-[#09090b] p-4 transition-colors hover:border-[#3f3f46]">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${color}15` }}
                            >
                              <Icon
                                className="h-5 w-5"
                                style={{ color }}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-white">
                                  {rec.name} ({rec.symbol})
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                  style={{
                                    borderColor: color,
                                    color,
                                  }}
                                >
                                  {typeLabels[rec.type]}
                                </Badge>
                              </div>
                              <p className="text-sm text-[#a1a1aa]">
                                {rec.action}
                              </p>
                              <p className="text-xs text-[#71717a]">
                                {rec.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                            <div className="text-right">
                              <p className="text-[10px] text-[#71717a]">
                                推定節税額
                              </p>
                              <p className="text-lg font-bold text-[#10b981]">
                                {formatCurrency(rec.estimatedSaving)}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={isSimulating ? "outline" : "default"}
                              onClick={() =>
                                setSimulatingId(isSimulating ? null : rec.id)
                              }
                              className="shrink-0"
                            >
                              {isSimulating ? (
                                <>
                                  <X className="mr-1 h-3 w-3" />
                                  閉じる
                                </>
                              ) : (
                                <>
                                  <BarChart3 className="mr-1 h-3 w-3" />
                                  シミュレーション
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Simulation Before/After */}
                        <AnimatePresence>
                          {isSimulating && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 border-t border-[#27272a] pt-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                  {/* Before */}
                                  <div className="rounded-lg bg-[#18181b] p-3 text-center">
                                    <p className="mb-2 text-xs font-medium text-[#71717a]">
                                      現在の税額
                                    </p>
                                    <p className="text-xl font-bold text-[#f59e0b]">
                                      {formatCurrency(
                                        taxSimulation.estimatedTax
                                      )}
                                    </p>
                                    <p className="mt-1 text-[10px] text-[#52525b]">
                                      純利益{" "}
                                      {formatCurrency(taxSimulation.netProfit)}{" "}
                                      x {taxSimulation.taxRate}%
                                    </p>
                                  </div>

                                  {/* Arrow */}
                                  <div className="flex items-center justify-center">
                                    <div className="flex items-center gap-2">
                                      <ArrowRight className="h-5 w-5 text-[#6366f1]" />
                                      <div className="text-center">
                                        <p className="text-xs font-bold text-[#10b981]">
                                          -{formatCurrency(rec.estimatedSaving)}
                                        </p>
                                        <p className="text-[10px] text-[#71717a]">
                                          節約
                                        </p>
                                      </div>
                                      <ArrowRight className="h-5 w-5 text-[#6366f1]" />
                                    </div>
                                  </div>

                                  {/* After */}
                                  <div className="rounded-lg border border-[#10b981]/30 bg-[#10b981]/5 p-3 text-center">
                                    <p className="mb-2 text-xs font-medium text-[#71717a]">
                                      最適化後の税額
                                    </p>
                                    <p className="text-xl font-bold text-[#10b981]">
                                      {formatCurrency(
                                        taxSimulation.estimatedTax -
                                          rec.estimatedSaving
                                      )}
                                    </p>
                                    <div className="mt-1 flex items-center justify-center gap-1">
                                      <CheckCircle2 className="h-3 w-3 text-[#10b981]" />
                                      <p className="text-[10px] text-[#10b981]">
                                        {rec.estimatedSaving > 0
                                          ? `${((rec.estimatedSaving / taxSimulation.estimatedTax) * 100).toFixed(1)}% 削減`
                                          : "変更なし"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Total Potential Savings */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="mt-6 rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/5 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-6 w-6 text-[#6366f1]" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        全提案の合計節税可能額
                      </p>
                      <p className="text-xs text-[#a1a1aa]">
                        上記の全施策を実行した場合の推定節税額
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#6366f1]">
                      {formatCurrency(
                        taxSimulation.recommendations.reduce(
                          (sum, r) => sum + r.estimatedSaving,
                          0
                        )
                      )}
                    </p>
                    <p className="text-xs text-[#71717a]">
                      最適化後税額:{" "}
                      {formatCurrency(
                        taxSimulation.estimatedTax -
                          taxSimulation.recommendations.reduce(
                            (sum, r) => sum + r.estimatedSaving,
                            0
                          )
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
