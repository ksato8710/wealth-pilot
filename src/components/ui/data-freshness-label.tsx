"use client";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";

interface DataFreshnessLabelProps {
  lastUpdated: string | null;
  className?: string;
}

function getDotColor(lastUpdated: string | null): string {
  if (!lastUpdated) return "bg-[#ef4444]";

  const now = new Date();
  const updated = new Date(lastUpdated);
  const diffMs = now.getTime() - updated.getTime();
  const diffMin = diffMs / 1000 / 60;

  if (diffMin <= 5) return "bg-[#10b981]";
  if (diffMin <= 30) return "bg-[#f59e0b]";
  return "bg-[#ef4444]";
}

export function DataFreshnessLabel({ lastUpdated, className }: DataFreshnessLabelProps) {
  const dotColor = getDotColor(lastUpdated);

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-[#a1a1aa]", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
      {lastUpdated ? formatRelativeTime(lastUpdated) : "未取得"}
    </span>
  );
}
