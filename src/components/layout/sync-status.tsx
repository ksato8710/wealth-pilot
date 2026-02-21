"use client";

import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { useDataSources, useSync } from "@/hooks/use-data-sources";

export function SyncStatus() {
  const { data: sources } = useDataSources();
  const { isSyncing, sync } = useSync();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Determine overall status color
  const getStatusColor = () => {
    if (!sources || sources.length === 0) return "text-[#a1a1aa]"; // no sources
    const hasError = sources.some(s => s.error);
    if (hasError) return "text-[#ef4444]"; // red
    const hasStale = sources.some(s => {
      if (!s.lastSyncAt) return true;
      const diff = Date.now() - new Date(s.lastSyncAt).getTime();
      return diff > 30 * 60 * 1000; // 30 min
    });
    if (hasStale) return "text-[#f59e0b]"; // yellow
    return "text-[#10b981]"; // green
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg",
          "text-muted-foreground transition-colors duration-200",
          "hover:bg-card hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
        aria-label="Sync status"
      >
        <RefreshCw className={cn("h-[18px] w-[18px]", getStatusColor(), isSyncing && "animate-spin")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-[#27272a] bg-[#18181b] p-3 shadow-xl z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">データソース</h3>
            <button
              onClick={async () => { await sync(); }}
              disabled={isSyncing}
              className="text-xs text-[#6366f1] hover:text-[#818cf8] disabled:opacity-50"
            >
              {isSyncing ? "同期中..." : "全て同期"}
            </button>
          </div>

          {(!sources || sources.length === 0) ? (
            <p className="text-xs text-[#a1a1aa] py-2">データソースが設定されていません</p>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <div key={source.type} className="flex items-center justify-between rounded-md bg-[#09090b] p-2">
                  <div>
                    <p className="text-xs font-medium text-white">{source.label}</p>
                    <p className="text-[10px] text-[#a1a1aa]">
                      {source.lastSyncAt ? formatRelativeTime(source.lastSyncAt) : "未同期"}
                      {source.assetCount > 0 && ` / ${source.assetCount}資産`}
                    </p>
                  </div>
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    source.error ? "bg-[#ef4444]" : source.connected ? "bg-[#10b981]" : "bg-[#a1a1aa]"
                  )} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
