import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "JPY"): string {
  if (currency === "JPY") {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ja-JP").format(value);
}

export function formatCompactCurrency(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}億円`;
  }
  if (value >= 10_000) {
    return `${(value / 10_000).toFixed(0)}万円`;
  }
  return formatCurrency(value);
}

const CRYPTO_DECIMALS: Record<string, number> = {
  BTC: 8,
  ETH: 6,
  XRP: 2,
  SOL: 4,
  DOGE: 2,
  ADA: 2,
  DOT: 4,
  MATIC: 2,
  AVAX: 4,
  LINK: 4,
};

export function formatQuantity(
  value: number,
  assetType?: "stock" | "crypto",
  symbol?: string
): string {
  if (assetType === "crypto") {
    const decimals = symbol ? (CRYPTO_DECIMALS[symbol.toUpperCase()] ?? 6) : 6;
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    });
  }
  return formatNumber(value);
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();

  if (diffMs < 0) return "たった今";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "たった今";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;

  return target.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}
