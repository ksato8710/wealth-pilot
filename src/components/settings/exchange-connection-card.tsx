"use client";

import { useState, useCallback } from "react";
import {
  Eye,
  EyeOff,
  RefreshCw,
  Unplug,
  Save,
  FlaskConical,
  Coins,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataFreshnessLabel } from "@/components/ui/data-freshness-label";
import { cn } from "@/lib/utils";
import { ConnectionTestResult } from "./connection-test-result";

interface ExchangeConnectionCardProps {
  exchange: "binance" | "bitflyer";
  label: string;
  iconColor: string;
  connected?: boolean;
  lastSyncAt?: string | null;
  assetCount?: number;
  onSave: (apiKey: string, apiSecret: string) => Promise<void>;
  onTest: (
    apiKey: string,
    apiSecret: string
  ) => Promise<{ success: boolean; error?: string; assetCount?: number }>;
  onSync?: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
}

const EXCHANGE_CONFIG = {
  binance: {
    accent: "#F0B90B",
    description: "Binance APIキーを設定して暗号資産ポートフォリオを自動取得します",
  },
  bitflyer: {
    accent: "#1DA2B4",
    description: "bitFlyer APIキーを設定して暗号資産ポートフォリオを自動取得します",
  },
} as const;

export function ExchangeConnectionCard({
  exchange,
  label,
  iconColor,
  connected,
  lastSyncAt,
  assetCount,
  onSave,
  onTest,
  onSync,
  onDisconnect,
}: ExchangeConnectionCardProps) {
  const config = EXCHANGE_CONFIG[exchange];

  if (connected) {
    return (
      <ConnectedView
        label={label}
        iconColor={iconColor}
        accent={config.accent}
        lastSyncAt={lastSyncAt}
        assetCount={assetCount}
        onSync={onSync}
        onDisconnect={onDisconnect}
      />
    );
  }

  return (
    <SetupView
      label={label}
      iconColor={iconColor}
      accent={config.accent}
      description={config.description}
      onSave={onSave}
      onTest={onTest}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Connected State                                                    */
/* ------------------------------------------------------------------ */

interface ConnectedViewProps {
  label: string;
  iconColor: string;
  accent: string;
  lastSyncAt?: string | null;
  assetCount?: number;
  onSync?: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
}

function ConnectedView({
  label,
  iconColor,
  accent,
  lastSyncAt,
  assetCount,
  onSync,
  onDisconnect,
}: ConnectedViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleSync = useCallback(async () => {
    if (!onSync) return;
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  }, [onSync]);

  const handleDisconnect = useCallback(async () => {
    if (!onDisconnect) return;
    const confirmed = window.confirm(
      `${label} との接続を切断しますか？APIキー情報は削除されます。`
    );
    if (!confirmed) return;
    setIsDisconnecting(true);
    try {
      await onDisconnect();
    } finally {
      setIsDisconnecting(false);
    }
  }, [onDisconnect, label]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${accent}15` }}
            >
              <Coins className="h-5 w-5" style={{ color: accent }} />
            </div>
            <div>
              <CardTitle>{label}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="profit">接続済み</Badge>
                {lastSyncAt !== undefined && (
                  <DataFreshnessLabel lastUpdated={lastSyncAt ?? null} />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between rounded-lg border border-[#27272a] bg-[#09090b] px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[#a1a1aa]">検出アセット数</span>
            <span className="text-lg font-semibold text-white">
              {assetCount ?? 0}
              <span className="ml-1 text-sm font-normal text-[#a1a1aa]">件</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onSync && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw
                  className={cn("mr-1.5 h-3.5 w-3.5", isSyncing && "animate-spin")}
                />
                今すぐ同期
              </Button>
            )}

            {onDisconnect && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 hover:text-[#ef4444]"
              >
                <Unplug className="mr-1.5 h-3.5 w-3.5" />
                切断
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Setup (Not Connected) State                                        */
/* ------------------------------------------------------------------ */

interface SetupViewProps {
  label: string;
  iconColor: string;
  accent: string;
  description: string;
  onSave: (apiKey: string, apiSecret: string) => Promise<void>;
  onTest: (
    apiKey: string,
    apiSecret: string
  ) => Promise<{ success: boolean; error?: string; assetCount?: number }>;
}

function SetupView({
  label,
  iconColor,
  accent,
  description,
  onSave,
  onTest,
}: SetupViewProps) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean | null;
    error?: string;
    assetCount?: number;
  }>({ success: null });

  const hasCredentials = apiKey.trim().length > 0 && apiSecret.trim().length > 0;

  const handleTest = useCallback(async () => {
    if (!hasCredentials) return;
    setIsTesting(true);
    setTestResult({ success: null });
    try {
      const result = await onTest(apiKey.trim(), apiSecret.trim());
      setTestResult(result);
    } catch {
      setTestResult({ success: false, error: "テスト中にエラーが発生しました" });
    } finally {
      setIsTesting(false);
    }
  }, [apiKey, apiSecret, hasCredentials, onTest]);

  const handleSave = useCallback(async () => {
    if (!hasCredentials) return;
    setIsSaving(true);
    try {
      await onSave(apiKey.trim(), apiSecret.trim());
    } finally {
      setIsSaving(false);
    }
  }, [apiKey, apiSecret, hasCredentials, onSave]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${accent}15` }}
          >
            <Coins className="h-5 w-5" style={{ color: accent }} />
          </div>
          <div>
            <CardTitle>{label}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#a1a1aa]">
              API Key
            </label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="APIキーを入力"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] transition-colors hover:text-[#a1a1aa]"
                tabIndex={-1}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* API Secret */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#a1a1aa]">
              API Secret
            </label>
            <div className="relative">
              <Input
                type={showSecret ? "text" : "password"}
                placeholder="APIシークレットを入力"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] transition-colors hover:text-[#a1a1aa]"
                tabIndex={-1}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Test Result */}
          <ConnectionTestResult
            success={testResult.success}
            error={testResult.error}
            assetCount={testResult.assetCount}
            isLoading={isTesting}
          />

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={!hasCredentials || isTesting}
            >
              <FlaskConical className="mr-1.5 h-3.5 w-3.5" />
              接続テスト
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasCredentials || isSaving}
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              保存
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
