"use client";

import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionTestResultProps {
  success: boolean | null;
  error?: string;
  assetCount?: number;
  isLoading?: boolean;
}

export function ConnectionTestResult({
  success,
  error,
  assetCount,
  isLoading,
}: ConnectionTestResultProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[#27272a] bg-[#27272a]/30 px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-[#6366f1]" />
        <span className="text-sm text-[#a1a1aa]">接続テスト中...</span>
      </div>
    );
  }

  if (success === null) {
    return null;
  }

  if (success) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-[#10b981]/30 bg-[#10b981]/5 px-4 py-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10b981]" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[#10b981]">接続成功</span>
          {assetCount !== undefined && (
            <span className="text-xs text-[#a1a1aa]">
              {assetCount} 件のアセットを検出しました
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5 px-4 py-3">
      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ef4444]" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-[#ef4444]">接続失敗</span>
        {error && (
          <span className="text-xs text-[#a1a1aa]">{error}</span>
        )}
      </div>
    </div>
  );
}
