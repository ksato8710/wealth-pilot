"use client";

import { motion } from "framer-motion";
import AssetOverview from "@/components/dashboard/asset-overview";
import AssetChart from "@/components/dashboard/asset-chart";
import PortfolioHeatmap from "@/components/dashboard/portfolio-heatmap";
import AIInsights from "@/components/dashboard/ai-insights";

export default function DashboardPage() {
  return (
    <div className="text-white">
      <div>
        <div className="space-y-6">
          {/* Row 1: Stat cards */}
          <AssetOverview />

          {/* Row 2: Chart + Heatmap */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AssetChart />
            </div>
            <div className="lg:col-span-1">
              <PortfolioHeatmap />
            </div>
          </div>

          {/* Row 3: AI Insights */}
          <AIInsights />
        </div>
      </div>
    </div>
  );
}
