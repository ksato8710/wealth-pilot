"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

interface StockHolding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  account: string;
  nisaType?: string | null;
}

interface ManualStockListProps {
  holdings: StockHolding[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function NisaBadge({ nisaType }: { nisaType?: string | null }) {
  if (!nisaType) return null;

  const label =
    nisaType === "growth" || nisaType === "成長投資枠"
      ? "成長投資枠"
      : "つみたて枠";
  const variant =
    nisaType === "growth" || nisaType === "成長投資枠" ? "default" : "profit";

  return <Badge variant={variant}>{label}</Badge>;
}

export function ManualStockList({
  holdings,
  onEdit,
  onDelete,
}: ManualStockListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>手動登録銘柄</CardTitle>
            <Badge variant="neutral">{holdings.length}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {holdings.length === 0 ? (
          <EmptyHoldings />
        ) : (
          <div className="space-y-2">
            {holdings.map((holding) => (
              <HoldingRow
                key={holding.id}
                holding={holding}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Holding Row                                                        */
/* ------------------------------------------------------------------ */

function HoldingRow({
  holding,
  onEdit,
  onDelete,
}: {
  holding: StockHolding;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#27272a] bg-[#09090b] px-4 py-3 transition-colors hover:border-[#3f3f46]">
      <div className="flex items-center gap-4">
        {/* Symbol + Name */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {holding.symbol}
          </span>
          <span className="text-xs text-[#a1a1aa]">{holding.name}</span>
        </div>

        {/* Shares */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-[#a1a1aa]">保有数</span>
          <span className="text-sm font-mono text-[#e4e4e7]">
            {formatNumber(holding.shares)}
          </span>
        </div>

        {/* Avg Cost */}
        <div className="flex flex-col items-end">
          <span className="text-xs text-[#a1a1aa]">平均取得単価</span>
          <span className="text-sm font-mono text-[#e4e4e7]">
            {formatCurrency(holding.avgCost)}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5">
          <Badge variant="outline">{holding.account}</Badge>
          <NisaBadge nisaType={holding.nisaType} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(holding.id)}
          className="h-8 w-8"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(holding.id)}
          className="h-8 w-8 text-[#a1a1aa] hover:text-[#ef4444]"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyHoldings() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-[#27272a] p-3 mb-3">
        <Plus className="h-6 w-6 text-[#a1a1aa]" />
      </div>
      <p className="text-sm text-[#a1a1aa]">手動登録された銘柄はありません</p>
    </div>
  );
}
