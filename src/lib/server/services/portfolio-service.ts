import { getAllHoldings } from "@/lib/server/services/holdings-service";
import type { Holding, AssetAllocation, SectorAllocation } from "@/lib/types";

interface PortfolioSummary {
  totalAsset: number;
  totalCash: number;
  totalUnrealizedPL: number;
  totalDayChange: number;
  annualDividend: number;
  holdingsCount: number;
}

const ASSET_CATEGORY_COLORS: Record<string, string> = {
  日本株式: "#3B82F6",
  米国株式: "#10B981",
  グローバル株式: "#8B5CF6",
  暗号資産: "#F0B90B",
  現金: "#6B7280",
};

const SECTOR_COLORS: Record<string, string> = {
  情報通信: "#3B82F6",
  電気機器: "#10B981",
  サービス業: "#8B5CF6",
  小売業: "#F59E0B",
  医薬品: "#EF4444",
  銀行業: "#06B6D4",
  機械: "#84CC16",
  化学: "#F97316",
  食料品: "#EC4899",
  輸送用機器: "#14B8A6",
  不動産業: "#A855F7",
  建設業: "#78716C",
  金属製品: "#64748B",
  Technology: "#3B82F6",
  Healthcare: "#EF4444",
  "Financial Services": "#06B6D4",
  "Consumer Cyclical": "#F59E0B",
  "Consumer Defensive": "#EC4899",
  "Communication Services": "#8B5CF6",
  Energy: "#F97316",
  Industrials: "#84CC16",
  "Real Estate": "#A855F7",
  Utilities: "#78716C",
  "Basic Materials": "#64748B",
  暗号資産: "#F0B90B",
};

function classifyAssetCategory(holding: Holding): string {
  if (
    holding.market === "BINANCE" ||
    holding.market === "BITFLYER" ||
    holding.currency === "CRYPTO"
  ) {
    return "暗号資産";
  }
  if (holding.market === "TSE") {
    return "日本株式";
  }
  if (holding.market === "NYSE" || holding.market === "NASDAQ") {
    return "米国株式";
  }
  if (holding.market === "FUND") {
    return "グローバル株式";
  }
  return "グローバル株式";
}

export async function getPortfolioSummary(
  userId: string
): Promise<PortfolioSummary> {
  const holdings = await getAllHoldings(userId);

  let totalAsset = 0;
  let totalCash = 0;
  let totalUnrealizedPL = 0;
  let totalDayChange = 0;
  let annualDividend = 0;

  for (const h of holdings) {
    totalAsset += h.marketValue;
    totalUnrealizedPL += h.unrealizedPL;
    totalDayChange += h.dayChange;
    annualDividend += h.annualDividend;
  }

  return {
    totalAsset,
    totalCash,
    totalUnrealizedPL,
    totalDayChange,
    annualDividend,
    holdingsCount: holdings.length,
  };
}

export function getAssetAllocation(holdings: Holding[]): AssetAllocation[] {
  const categoryMap = new Map<string, number>();

  for (const h of holdings) {
    const category = classifyAssetCategory(h);
    const current = categoryMap.get(category) ?? 0;
    categoryMap.set(category, current + h.marketValue);
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

  if (totalValue === 0) {
    return [];
  }

  const allocations: AssetAllocation[] = [];

  for (const [category, value] of categoryMap.entries()) {
    allocations.push({
      category,
      value,
      percentage: (value / totalValue) * 100,
      color: ASSET_CATEGORY_COLORS[category] ?? "#6B7280",
    });
  }

  allocations.sort((a, b) => b.value - a.value);

  return allocations;
}

export function getSectorAllocation(
  holdings: Holding[]
): SectorAllocation[] {
  const sectorMap = new Map<string, { value: number; dayChange: number }>();

  for (const h of holdings) {
    const current = sectorMap.get(h.sector) ?? { value: 0, dayChange: 0 };
    current.value += h.marketValue;
    current.dayChange += h.dayChange;
    sectorMap.set(h.sector, current);
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

  if (totalValue === 0) {
    return [];
  }

  const allocations: SectorAllocation[] = [];

  for (const [sector, data] of sectorMap.entries()) {
    allocations.push({
      sector,
      value: data.value,
      percentage: (data.value / totalValue) * 100,
      change: data.dayChange,
    });
  }

  allocations.sort((a, b) => b.value - a.value);

  return allocations;
}
