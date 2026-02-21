"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn, formatCurrency, formatPercent, formatNumber, formatQuantity } from "@/lib/utils";
import type { Holding } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type SortKey = keyof Holding;
type SortDirection = "asc" | "desc";

type AssetTypeFilter = "all" | "stock" | "crypto";

interface ColumnDef {
  key: SortKey;
  label: string;
  shortLabel?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  minWidth?: string;
}

const columns: ColumnDef[] = [
  { key: "symbol", label: "銘柄", align: "left", sortable: true, minWidth: "min-w-[180px]" },
  { key: "market", label: "市場", align: "center", sortable: true, minWidth: "min-w-[80px]" },
  { key: "shares", label: "保有数", align: "right", sortable: true, minWidth: "min-w-[80px]" },
  { key: "avgCost", label: "平均取得単価", align: "right", sortable: true, minWidth: "min-w-[100px]" },
  { key: "currentPrice", label: "現在価格", align: "right", sortable: true, minWidth: "min-w-[100px]" },
  { key: "marketValue", label: "評価額", align: "right", sortable: true, minWidth: "min-w-[120px]" },
  { key: "unrealizedPL", label: "含み損益", align: "right", sortable: true, minWidth: "min-w-[140px]" },
  { key: "dayChange", label: "前日比", align: "right", sortable: true, minWidth: "min-w-[120px]" },
  { key: "account", label: "口座", align: "center", sortable: true, minWidth: "min-w-[100px]" },
  { key: "nisaType", label: "NISA", align: "center", sortable: true, minWidth: "min-w-[90px]" },
];

const STOCK_MARKETS: Holding["market"][] = ["TSE", "NYSE", "NASDAQ", "FUND"];
const CRYPTO_MARKETS: Holding["market"][] = ["BINANCE", "BITFLYER"];

function SortIcon({ column, sortKey, sortDirection }: {
  column: SortKey;
  sortKey: SortKey | null;
  sortDirection: SortDirection;
}) {
  if (sortKey !== column) {
    return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 text-[#52525b]" />;
  }
  return sortDirection === "asc" ? (
    <ArrowUp className="ml-1 inline h-3.5 w-3.5 text-[#6366f1]" />
  ) : (
    <ArrowDown className="ml-1 inline h-3.5 w-3.5 text-[#6366f1]" />
  );
}

function NisaBadge({ nisaType }: { nisaType: Holding["nisaType"] }) {
  if (!nisaType) return <span className="text-[#52525b]">-</span>;

  const label = nisaType === "growth" ? "成長投資枠" : "つみたて枠";
  const variant = nisaType === "growth" ? "default" : "profit";

  return <Badge variant={variant}>{label}</Badge>;
}

function MarketBadge({ market }: { market: Holding["market"] }) {
  if (market === "BINANCE") {
    return <Badge variant="crypto">Binance</Badge>;
  }
  if (market === "BITFLYER") {
    return <Badge className="bg-[#1DA2B4]/10 text-[#1DA2B4]">bitFlyer</Badge>;
  }
  return <Badge variant="outline">{market}</Badge>;
}

function SourceBadge({ source }: { source?: Holding["source"] }) {
  if (source === "binance") {
    return <Badge variant="crypto" className="ml-1.5 text-[10px] px-1.5 py-0">Binance</Badge>;
  }
  if (source === "bitflyer") {
    return <Badge className="ml-1.5 text-[10px] px-1.5 py-0 bg-[#1DA2B4]/10 text-[#1DA2B4]">bitFlyer</Badge>;
  }
  return null;
}

function isCryptoMarket(market: Holding["market"]): boolean {
  return CRYPTO_MARKETS.includes(market);
}

interface HoldingsTableProps {
  holdings: Holding[];
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>("marketValue");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let result = holdings.filter((h) => {
      // Asset type filter
      if (assetTypeFilter === "stock" && !STOCK_MARKETS.includes(h.market)) {
        return false;
      }
      if (assetTypeFilter === "crypto" && !CRYPTO_MARKETS.includes(h.market)) {
        return false;
      }

      // Search filter
      if (!query) return true;
      return (
        h.symbol.toLowerCase().includes(query) ||
        h.name.toLowerCase().includes(query) ||
        (h.nameEn && h.nameEn.toLowerCase().includes(query))
      );
    });

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let comparison = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [holdings, searchQuery, sortKey, sortDirection, assetTypeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-lg border border-[#27272a] bg-[#09090b] p-0.5">
          <button
            onClick={() => setAssetTypeFilter("all")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              assetTypeFilter === "all"
                ? "bg-[#27272a] text-white"
                : "text-[#a1a1aa] hover:text-white"
            )}
          >
            すべて
          </button>
          <button
            onClick={() => setAssetTypeFilter("stock")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              assetTypeFilter === "stock"
                ? "bg-[#27272a] text-white"
                : "text-[#a1a1aa] hover:text-white"
            )}
          >
            株式
          </button>
          <button
            onClick={() => setAssetTypeFilter("crypto")}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              assetTypeFilter === "crypto"
                ? "bg-[#27272a] text-white"
                : "text-[#a1a1aa] hover:text-white"
            )}
          >
            暗号資産
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525b]" />
          <Input
            placeholder="銘柄名またはシンボルで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#27272a]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#27272a] bg-[#09090b]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#a1a1aa]",
                    col.minWidth,
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.align === "left" && "text-left",
                    col.sortable && "cursor-pointer select-none hover:text-white transition-colors"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && (
                    <SortIcon
                      column={col.key}
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {filteredAndSorted.map((holding, index) => {
                const isProfit = holding.unrealizedPL >= 0;
                const isDayPositive = holding.dayChange >= 0;
                const isCrypto = isCryptoMarket(holding.market);

                return (
                  <motion.tr
                    key={holding.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                    className={cn(
                      "border-b border-[#27272a] transition-colors hover:bg-[#27272a]/50",
                      index % 2 === 0 ? "bg-[#18181b]" : "bg-[#18181b]/60",
                      isCrypto && "border-l-2 border-[#F0B90B]/40"
                    )}
                  >
                    {/* Symbol / Name */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {holding.symbol}
                        </span>
                        <span className="text-xs text-[#a1a1aa]">
                          {holding.name}
                          <SourceBadge source={holding.source} />
                        </span>
                      </div>
                    </td>

                    {/* Market */}
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <MarketBadge market={holding.market} />
                    </td>

                    {/* Shares */}
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[#e4e4e7]">
                      {holding.currency === "CRYPTO"
                        ? formatQuantity(holding.shares, "crypto", holding.symbol)
                        : formatNumber(holding.shares)}
                    </td>

                    {/* Avg Cost */}
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[#a1a1aa]">
                      {formatCurrency(holding.avgCost, holding.currency)}
                    </td>

                    {/* Current Price */}
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[#e4e4e7]">
                      {formatCurrency(holding.currentPrice, holding.currency)}
                    </td>

                    {/* Market Value */}
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-medium text-white">
                      {formatCurrency(holding.marketValue)}
                    </td>

                    {/* Unrealized P&L */}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "font-mono font-medium",
                            isProfit ? "text-[#10b981]" : "text-[#ef4444]"
                          )}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(holding.unrealizedPL)}
                        </span>
                        <span
                          className={cn(
                            "flex items-center gap-0.5 text-xs font-mono",
                            isProfit ? "text-[#10b981]/80" : "text-[#ef4444]/80"
                          )}
                        >
                          {isProfit ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercent(holding.unrealizedPLPercent)}
                        </span>
                      </div>
                    </td>

                    {/* Day Change */}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "font-mono text-xs",
                            isDayPositive ? "text-[#10b981]" : "text-[#ef4444]"
                          )}
                        >
                          {isDayPositive ? "+" : ""}
                          {formatCurrency(holding.dayChange)}
                        </span>
                        <span
                          className={cn(
                            "font-mono text-xs",
                            isDayPositive
                              ? "text-[#10b981]/70"
                              : "text-[#ef4444]/70"
                          )}
                        >
                          {formatPercent(holding.dayChangePercent)}
                        </span>
                      </div>
                    </td>

                    {/* Account */}
                    <td className="whitespace-nowrap px-4 py-3 text-center text-xs text-[#a1a1aa]">
                      {holding.account}
                    </td>

                    {/* NISA */}
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      {isCrypto ? (
                        <span className="text-xs text-[#52525b]">対象外</span>
                      ) : (
                        <NisaBadge nisaType={holding.nisaType} />
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>

            {filteredAndSorted.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-[#a1a1aa]"
                >
                  「{searchQuery}」に一致する銘柄が見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
        <span>
          {filteredAndSorted.length} / {holdings.length} 銘柄
        </span>
        <span>特に記載がない限り日本円表示</span>
      </div>
    </div>
  );
}
