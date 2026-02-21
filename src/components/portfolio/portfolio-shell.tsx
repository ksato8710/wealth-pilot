"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Hash,
  Trophy,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon, trend, delay = 0 }: StatCardProps) {
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

export { Briefcase, TrendingUp, TrendingDown, Hash, Trophy, AlertTriangle };

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  initial?: Record<string, number>;
  animate?: Record<string, number>;
  transition?: Record<string, number>;
}

export function AnimatedSection({
  children,
  className,
  initial = { opacity: 0, y: 16 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.4, delay: 0.3 },
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PortfolioShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-12">
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
