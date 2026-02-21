import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  holdings as mockHoldings,
  getTotalUnrealizedPL,
  sectorAllocations as mockSectorAllocations,
  assetAllocation as mockAssetAllocation,
} from "@/data/mock-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { SectorChart } from "@/components/portfolio/sector-chart";
import { AllocationChart } from "@/components/portfolio/allocation-chart";
import {
  PortfolioShell,
  StatCard,
  AnimatedSection,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Hash,
  Trophy,
  AlertTriangle,
} from "@/components/portfolio/portfolio-shell";

export default async function PortfolioPage() {
  const holdings = mockHoldings;
  const sectorAllocations = mockSectorAllocations;
  const assetAllocation = mockAssetAllocation;

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

  return (
    <PortfolioShell>
      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="保有資産総額"
          value={formatCurrency(totalMarketValue)}
          subtitle={`${holdings.length} 銘柄`}
          icon={<Briefcase className="h-5 w-5" />}
          delay={0}
        />
        <StatCard
          title="含み損益"
          value={
            (totalPL >= 0 ? "+" : "") +
            formatCurrency(totalPL)
          }
          subtitle={formatPercent(totalPLPercent)}
          icon={
            totalPL >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )
          }
          trend={totalPL >= 0 ? "up" : "down"}
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
          value={formatPercent(best.unrealizedPLPercent)}
          subtitle={`${best.symbol} ${best.name}`}
          icon={<Trophy className="h-5 w-5" />}
          trend="up"
          delay={0.15}
        />
        <StatCard
          title="最劣後銘柄"
          value={formatPercent(worst.unrealizedPLPercent)}
          subtitle={`${worst.symbol} ${worst.name}`}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend="down"
          delay={0.2}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sector chart - left 1/3 */}
        <AnimatedSection
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
              <SectorChart data={sectorAllocations} />
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Allocation chart - right 2/3 */}
        <AnimatedSection
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
              <AllocationChart data={assetAllocation} />
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>

      {/* Holdings table - full width */}
      <AnimatedSection
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>保有銘柄一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <HoldingsTable holdings={holdings} />
          </CardContent>
        </Card>
      </AnimatedSection>
    </PortfolioShell>
  );
}
