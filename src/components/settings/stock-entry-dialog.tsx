"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  X,
  Loader2,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StockSearchResult {
  symbol: string;
  name: string;
  nameEn?: string;
  exchange?: string;
  market?: string;
  sector?: string;
}

interface StockEntryData {
  symbol: string;
  name: string;
  nameEn?: string;
  market: string;
  sector: string;
  shares: number;
  avgCost: number;
  account: string;
  nisaType?: string | null;
  currency?: string;
}

interface EditData {
  symbol: string;
  name: string;
  nameEn?: string;
  market: string;
  sector: string;
  shares: number;
  avgCost: number;
  account: string;
  nisaType?: string | null;
  currency?: string;
}

interface StockEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: StockEntryData) => Promise<void>;
  editData?: EditData | null;
}

const ACCOUNTS = [
  "SBI証券",
  "楽天証券",
  "マネックス証券",
  "松井証券",
  "Other",
] as const;

const NISA_TYPES = [
  { value: "", label: "なし" },
  { value: "growth", label: "成長投資枠" },
  { value: "tsumitate", label: "つみたて枠" },
] as const;

/* ------------------------------------------------------------------ */
/*  Main Dialog                                                        */
/* ------------------------------------------------------------------ */

export function StockEntryDialog({
  open,
  onOpenChange,
  onSave,
  editData,
}: StockEntryDialogProps) {
  const [step, setStep] = useState<1 | 2>(editData ? 2 : 1);
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(
    editData
      ? {
          symbol: editData.symbol,
          name: editData.name,
          nameEn: editData.nameEn,
          market: editData.market,
          sector: editData.sector,
        }
      : null
  );

  // Reset state when dialog opens/closes or editData changes
  useEffect(() => {
    if (open) {
      if (editData) {
        setStep(2);
        setSelectedStock({
          symbol: editData.symbol,
          name: editData.name,
          nameEn: editData.nameEn,
          market: editData.market,
          sector: editData.sector,
        });
      } else {
        setStep(1);
        setSelectedStock(null);
      }
    }
  }, [open, editData]);

  const handleSelectStock = useCallback((stock: StockSearchResult) => {
    setSelectedStock(stock);
    setStep(2);
  }, []);

  const handleBack = useCallback(() => {
    if (!editData) {
      setStep(1);
      setSelectedStock(null);
    }
  }, [editData]);

  const isEditing = editData !== undefined && editData !== null;
  const dialogTitle = isEditing ? "銘柄を編集" : "銘柄を追加";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[#27272a] bg-[#18181b] shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#27272a] px-5 py-4">
            <div className="flex items-center gap-2">
              {step === 2 && !isEditing && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mr-1 rounded-md p-1 text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <Dialog.Title className="text-base font-semibold text-white">
                {dialogTitle}
              </Dialog.Title>
              {step === 1 && (
                <Badge variant="neutral">Step 1/2</Badge>
              )}
              {step === 2 && (
                <Badge variant="neutral">Step 2/2</Badge>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-1 text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto">
            {step === 1 && (
              <StockSearchStep onSelect={handleSelectStock} />
            )}
            {step === 2 && selectedStock && (
              <StockFormStep
                stock={selectedStock}
                editData={editData}
                onSave={onSave}
                onClose={() => onOpenChange(false)}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1: Stock Search                                               */
/* ------------------------------------------------------------------ */

function StockSearchStep({
  onSelect,
}: {
  onSelect: (stock: StockSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        const res = await fetch(
          `/api/holdings?search=${encodeURIComponent(trimmed)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : data.results ?? []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  return (
    <div className="p-5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525b]" />
        <Input
          placeholder="銘柄名またはシンボルで検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          autoFocus
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#6366f1]" />
        )}
      </div>

      <div className="mt-4 space-y-1">
        {isSearching && results.length === 0 && (
          <div className="flex items-center justify-center py-8 text-sm text-[#a1a1aa]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            検索中...
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="py-8 text-center text-sm text-[#a1a1aa]">
            一致する銘柄が見つかりません
          </div>
        )}

        {results.map((stock) => (
          <button
            key={`${stock.symbol}-${stock.exchange ?? stock.market ?? ""}`}
            type="button"
            onClick={() => onSelect(stock)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#27272a]"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {stock.symbol}
              </span>
              <span className="text-xs text-[#a1a1aa]">{stock.name}</span>
            </div>
            {(stock.exchange ?? stock.market) && (
              <Badge variant="outline">
                {stock.exchange ?? stock.market}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2: Entry Form                                                 */
/* ------------------------------------------------------------------ */

interface StockFormStepProps {
  stock: StockSearchResult;
  editData?: EditData | null;
  onSave: (data: StockEntryData) => Promise<void>;
  onClose: () => void;
}

function StockFormStep({
  stock,
  editData,
  onSave,
  onClose,
}: StockFormStepProps) {
  const [shares, setShares] = useState<string>(
    editData ? String(editData.shares) : ""
  );
  const [avgCost, setAvgCost] = useState<string>(
    editData ? String(editData.avgCost) : ""
  );
  const [account, setAccount] = useState<string>(
    editData?.account ?? ACCOUNTS[0]
  );
  const [nisaType, setNisaType] = useState<string>(
    editData?.nisaType ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const isValid =
    shares.trim().length > 0 &&
    Number(shares) > 0 &&
    avgCost.trim().length > 0 &&
    Number(avgCost) > 0;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) return;

      setIsSaving(true);
      try {
        await onSave({
          symbol: stock.symbol,
          name: stock.name,
          nameEn: stock.nameEn,
          market: stock.market ?? editData?.market ?? "",
          sector: stock.sector ?? editData?.sector ?? "",
          shares: Number(shares),
          avgCost: Number(avgCost),
          account,
          nisaType: nisaType || null,
          currency: editData?.currency,
        });
        onClose();
      } finally {
        setIsSaving(false);
      }
    },
    [isValid, onSave, onClose, stock, editData, shares, avgCost, account, nisaType]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 p-5">
        {/* Selected stock info */}
        <div className="rounded-lg border border-[#27272a] bg-[#09090b] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white">
                {stock.symbol}
              </span>
              <span className="text-xs text-[#a1a1aa]">{stock.name}</span>
            </div>
            {(stock.exchange ?? stock.market) && (
              <Badge variant="outline">
                {stock.exchange ?? stock.market}
              </Badge>
            )}
          </div>
        </div>

        {/* Shares */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#a1a1aa]">
            保有株数
          </label>
          <Input
            type="number"
            placeholder="100"
            min="0"
            step="any"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            autoFocus={!editData}
          />
        </div>

        {/* Avg Cost */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#a1a1aa]">
            平均取得単価
          </label>
          <Input
            type="number"
            placeholder="1500"
            min="0"
            step="any"
            value={avgCost}
            onChange={(e) => setAvgCost(e.target.value)}
          />
        </div>

        {/* Account */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#a1a1aa]">口座</label>
          <SelectField
            value={account}
            onChange={setAccount}
            options={ACCOUNTS.map((a) => ({ value: a, label: a }))}
          />
        </div>

        {/* NISA Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#a1a1aa]">
            NISA区分
          </label>
          <SelectField
            value={nisaType}
            onChange={setNisaType}
            options={NISA_TYPES.map((n) => ({
              value: n.value,
              label: n.label,
            }))}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-[#27272a] px-5 py-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!isValid || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              保存中...
            </>
          ) : (
            "保存"
          )}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom Select (styled for dark theme)                              */
/* ------------------------------------------------------------------ */

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full appearance-none rounded-lg border border-[#27272a] bg-[#18181b] px-3 py-2 pr-8 text-sm text-white transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525b]" />
    </div>
  );
}
