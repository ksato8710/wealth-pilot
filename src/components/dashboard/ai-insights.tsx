"use client";

import { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  Shield,
  TrendingUp,
  RefreshCcw,
  Calculator,
  Coins,
  Brain,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiInsights } from "@/data/mock-data";
import type { AIInsight } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

const typeIconMap: Record<AIInsight["type"], LucideIcon> = {
  risk: Shield,
  opportunity: TrendingUp,
  rebalance: RefreshCcw,
  tax: Calculator,
  dividend: Coins,
  behavioral: Brain,
};

const typeColorMap: Record<AIInsight["type"], { icon: string; bg: string }> = {
  risk: { icon: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
  opportunity: { icon: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  rebalance: { icon: "text-[#6366f1]", bg: "bg-[#6366f1]/10" },
  tax: { icon: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  dividend: { icon: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  behavioral: { icon: "text-[#a78bfa]", bg: "bg-[#a78bfa]/10" },
};

const priorityVariantMap: Record<
  AIInsight["priority"],
  "loss" | "neutral" | "profit"
> = {
  high: "loss",
  medium: "neutral",
  low: "profit",
};

const priorityLabelMap: Record<AIInsight["priority"], string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export default function AIInsights() {
  const insights = useMemo(() => aiInsights, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366f1]/10">
              <Brain className="h-4 w-4 text-[#6366f1]" />
            </div>
            <CardTitle>AIインサイト</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {insights.map((insight) => {
              const Icon = typeIconMap[insight.type];
              const colors = typeColorMap[insight.type];

              return (
                <motion.div key={insight.id} variants={itemVariants}>
                  <div className="group flex h-full flex-col rounded-lg border border-[#27272a] bg-[#09090b] p-4 transition-all hover:border-[#3f3f46] hover:bg-[#0f0f12]">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}
                      >
                        <Icon className={`h-4.5 w-4.5 ${colors.icon}`} />
                      </div>
                      <Badge variant={priorityVariantMap[insight.priority]}>
                        {priorityLabelMap[insight.priority]}
                      </Badge>
                    </div>

                    <h4 className="mb-1.5 text-sm font-semibold leading-snug text-white">
                      {insight.title}
                    </h4>

                    <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-[#a1a1aa]">
                      {insight.description}
                    </p>

                    <div className="mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-0 text-xs text-[#818cf8] hover:text-[#6366f1] hover:bg-transparent"
                      >
                        詳細
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
