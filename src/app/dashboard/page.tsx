import AssetOverview from "@/components/dashboard/asset-overview";
import AssetChart from "@/components/dashboard/asset-chart";
import PortfolioHeatmap from "@/components/dashboard/portfolio-heatmap";
import AIInsights from "@/components/dashboard/ai-insights";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

// Import mock data as fallback
import {
  holdings as mockHoldings,
  getTotalAsset, getTotalUnrealizedPL, getTotalDayChange,
  assetHistory as mockAssetHistory,
  nisaStatus as mockNisaStatus,
  aiInsights as mockAiInsights,
} from "@/data/mock-data";

export default async function DashboardPage() {
  // For now use mock data, will be replaced with real service calls
  const holdings = mockHoldings;
  const totalAsset = getTotalAsset();
  const unrealizedPL = getTotalUnrealizedPL();
  const dayChange = getTotalDayChange();
  const annualDividend = holdings.reduce((sum, h) => sum + h.annualDividend, 0);
  const nisaStatus = mockNisaStatus;
  const assetHistory = mockAssetHistory;
  const aiInsights = mockAiInsights;

  return (
    <DashboardShell>
      {/* Row 1: Stat cards */}
      <AssetOverview
        totalAsset={totalAsset}
        unrealizedPL={unrealizedPL}
        dayChange={dayChange}
        annualDividend={annualDividend}
        nisaStatus={nisaStatus}
      />

      {/* Row 2: Chart + Heatmap */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AssetChart data={assetHistory} />
        </div>
        <div className="lg:col-span-1">
          <PortfolioHeatmap holdings={holdings} />
        </div>
      </div>

      {/* Row 3: AI Insights */}
      <AIInsights insights={aiInsights} />
    </DashboardShell>
  );
}
