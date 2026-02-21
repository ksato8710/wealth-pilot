"use client";

import { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User, CreditCard, Link2, Bell, Shield, LogOut,
  Plus, ChevronRight,
} from "lucide-react";
import { useDataSources, useSync } from "@/hooks/use-data-sources";
import { useHoldings } from "@/hooks/use-holdings";
import { ExchangeConnectionCard } from "@/components/settings/exchange-connection-card";
import { ManualStockList } from "@/components/settings/manual-stock-list";
import { StockEntryDialog } from "@/components/settings/stock-entry-dialog";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<{
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
  } | null>(null);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);

  const { data: sources, refetch: refetchSources } = useDataSources();
  const { isSyncing, sync } = useSync();
  const { data: holdingsData, refetch: refetchHoldings } = useHoldings();

  // Derive exchange connection status from sources
  const binanceSource = sources?.find(s => s.type === "binance");
  const bitflyerSource = sources?.find(s => s.type === "bitflyer");

  const binanceConnected = binanceSource?.connected ?? false;
  const binanceLastSync = binanceSource?.lastSyncAt ?? null;
  const binanceAssetCount = binanceSource?.assetCount ?? 0;

  const bitflyerConnected = bitflyerSource?.connected ?? false;
  const bitflyerLastSync = bitflyerSource?.lastSyncAt ?? null;
  const bitflyerAssetCount = bitflyerSource?.assetCount ?? 0;

  // Filter manual holdings (not from exchange sources)
  const manualHoldings = (holdingsData ?? [])
    .filter(h => h.source === "manual" || (h.market !== "BINANCE" && h.market !== "BITFLYER"))
    .map(h => ({
      id: h.id,
      symbol: h.symbol,
      name: h.name,
      shares: h.shares,
      avgCost: h.avgCost,
      account: h.account,
      nisaType: h.nisaType,
    }));

  const handleSaveApiKey = useCallback(
    (exchange: "binance" | "bitflyer") =>
      async (apiKey: string, apiSecret: string) => {
        await fetch("/api/settings/api-keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exchange, apiKey, apiSecret }),
        });
        await refetchSources();
      },
    [refetchSources]
  );

  const handleTestConnection = useCallback(
    (exchange: "binance" | "bitflyer") =>
      async (apiKey: string, apiSecret: string) => {
        const res = await fetch("/api/settings/api-keys/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exchange, apiKey, apiSecret }),
        });
        return res.json();
      },
    []
  );

  const handleSync = useCallback(async () => {
    await sync();
    await refetchSources();
    await refetchHoldings();
  }, [sync, refetchSources, refetchHoldings]);

  const handleDisconnect = useCallback(
    (exchange: "binance" | "bitflyer") => async () => {
      await fetch("/api/settings/api-keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exchange }),
      });
      await refetchSources();
      await refetchHoldings();
    },
    [refetchSources, refetchHoldings]
  );

  const handleSaveStock = useCallback(
    async (data: {
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
    }) => {
      const method = editingStockId ? "PUT" : "POST";
      const url = editingStockId
        ? `/api/holdings/${editingStockId}`
        : "/api/holdings";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setEditingStock(null);
      setEditingStockId(null);
      await refetchHoldings();
    },
    [editingStockId, refetchHoldings]
  );

  const handleEditStock = useCallback(
    (id: string) => {
      const holding = holdingsData?.find(h => h.id === id);
      if (!holding) return;
      setEditingStockId(id);
      setEditingStock({
        symbol: holding.symbol,
        name: holding.name,
        nameEn: holding.nameEn,
        market: holding.market,
        sector: holding.sector,
        shares: holding.shares,
        avgCost: holding.avgCost,
        account: holding.account,
        nisaType: holding.nisaType,
        currency: holding.currency,
      });
      setStockDialogOpen(true);
    },
    [holdingsData]
  );

  const handleDeleteStock = useCallback(
    async (id: string) => {
      const confirmed = window.confirm("この銘柄を削除しますか？");
      if (!confirmed) return;
      await fetch(`/api/holdings/${id}`, { method: "DELETE" });
      await refetchHoldings();
    },
    [refetchHoldings]
  );

  const tabs = [
    { id: "profile", label: "プロフィール", icon: User },
    { id: "accounts", label: "データ連携", icon: Link2 },
    { id: "subscription", label: "プラン", icon: CreditCard },
    { id: "notifications", label: "通知設定", icon: Bell },
    { id: "security", label: "セキュリティ", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Nav */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#6366f1]/10 text-[#818cf8]"
                        : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="border-t border-[#27272a] my-2" />
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors">
                <LogOut className="w-4 h-4" />
                ログアウト
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>プロフィール設定</CardTitle>
                <CardDescription>基本情報を管理します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#6366f1]/20 flex items-center justify-center text-[#818cf8] text-xl font-bold">
                    ST
                  </div>
                  <div>
                    <p className="font-medium">佐藤 慧太</p>
                    <p className="text-sm text-[#a1a1aa]">keita.sato@example.com</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#a1a1aa] mb-1 block">名前</label>
                    <Input defaultValue="佐藤 慧太" />
                  </div>
                  <div>
                    <label className="text-sm text-[#a1a1aa] mb-1 block">メールアドレス</label>
                    <Input defaultValue="keita.sato@example.com" type="email" />
                  </div>
                </div>
                <Button className="mt-4">保存</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "accounts" && (
            <div className="space-y-6">
              {/* Exchange Connections */}
              <div>
                <h3 className="text-sm font-medium text-[#a1a1aa] mb-3">暗号資産取引所</h3>
                <div className="space-y-4">
                  <ExchangeConnectionCard
                    exchange="binance"
                    label="Binance"
                    iconColor="#F0B90B"
                    connected={binanceConnected}
                    lastSyncAt={binanceLastSync}
                    assetCount={binanceAssetCount}
                    onSave={handleSaveApiKey("binance")}
                    onTest={handleTestConnection("binance")}
                    onSync={handleSync}
                    onDisconnect={handleDisconnect("binance")}
                  />
                  <ExchangeConnectionCard
                    exchange="bitflyer"
                    label="bitFlyer"
                    iconColor="#1DA2B4"
                    connected={bitflyerConnected}
                    lastSyncAt={bitflyerLastSync}
                    assetCount={bitflyerAssetCount}
                    onSave={handleSaveApiKey("bitflyer")}
                    onTest={handleTestConnection("bitflyer")}
                    onSync={handleSync}
                    onDisconnect={handleDisconnect("bitflyer")}
                  />
                </div>
              </div>

              {/* Manual Stocks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-[#a1a1aa]">手動登録銘柄</h3>
                  <Button size="sm" onClick={() => {
                    setEditingStock(null);
                    setEditingStockId(null);
                    setStockDialogOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-1" />
                    銘柄追加
                  </Button>
                </div>
                <ManualStockList
                  holdings={manualHoldings}
                  onEdit={handleEditStock}
                  onDelete={handleDeleteStock}
                />
              </div>

              <StockEntryDialog
                open={stockDialogOpen}
                onOpenChange={setStockDialogOpen}
                onSave={handleSaveStock}
                editData={editingStock}
              />
            </div>
          )}

          {activeTab === "subscription" && (
            <Card>
              <CardHeader>
                <CardTitle>プラン管理</CardTitle>
                <CardDescription>現在のプランと請求情報</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <Badge>現在のプラン</Badge>
                      <h3 className="text-lg font-bold mt-2">スタンダード</h3>
                      <p className="text-sm text-[#a1a1aa]">月額 ¥480</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#a1a1aa]">次回請求日</p>
                      <p className="font-medium">2026年3月21日</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-[#a1a1aa]">プランの比較</h4>
                  {[
                    { name: "無料", price: "¥0", features: ["2口座", "基本ダッシュボード", "月1回AI診断"] },
                    { name: "スタンダード", price: "¥480/月", current: true, features: ["5口座", "AI分析", "配当トラッカー", "税金シミュレーション"] },
                    { name: "プロフェッショナル", price: "¥980/月", features: ["無制限口座", "リアルタイムAI", "カスタムアラート", "APIアクセス"] },
                  ].map((plan) => (
                    <div
                      key={plan.name}
                      className={`p-4 rounded-lg border ${
                        plan.current
                          ? "border-[#6366f1] bg-[#6366f1]/5"
                          : "border-[#27272a]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{plan.name}</span>
                          {plan.current && <Badge>現在</Badge>}
                        </div>
                        <span className="font-bold">{plan.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {plan.features.map((f) => (
                          <span key={f} className="text-xs text-[#a1a1aa] bg-[#27272a] px-2 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                      {!plan.current && (
                        <Button variant="outline" size="sm" className="mt-3">
                          プラン変更 <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>通知設定</CardTitle>
                <CardDescription>通知の受信方法を管理します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "AI分析レポート", desc: "週次のポートフォリオ分析レポート", enabled: true },
                  { label: "配当金通知", desc: "配当金の入金・権利確定日の通知", enabled: true },
                  { label: "リバランス提案", desc: "ポートフォリオの偏りが検知された場合", enabled: true },
                  { label: "ニュースアラート", desc: "保有銘柄に影響するニュース速報", enabled: false },
                  { label: "税金最適化", desc: "税金最適化の機会が検知された場合", enabled: true },
                  { label: "市場急変アラート", desc: "保有銘柄の大幅な価格変動", enabled: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#27272a]"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-[#a1a1aa]">{item.desc}</p>
                    </div>
                    <button
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        item.enabled ? "bg-[#6366f1]" : "bg-[#27272a]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          item.enabled ? "translate-x-5.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>セキュリティ設定</CardTitle>
                <CardDescription>アカウントのセキュリティを管理します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-[#27272a] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">パスワード変更</p>
                      <p className="text-xs text-[#a1a1aa]">最終変更: 2026年1月15日</p>
                    </div>
                    <Button variant="outline" size="sm">変更</Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-[#27272a] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">二要素認証</p>
                      <p className="text-xs text-[#a1a1aa]">認証アプリを使用した追加保護</p>
                    </div>
                    <Badge variant="profit">有効</Badge>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-[#27272a] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">ログイン履歴</p>
                      <p className="text-xs text-[#a1a1aa]">最近のアクティビティを確認</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      確認 <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-lg border border-[#27272a] bg-[#10b981]/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-[#10b981]" />
                    <span className="font-medium text-sm text-[#10b981]">セキュリティステータス: 良好</span>
                  </div>
                  <p className="text-xs text-[#a1a1aa]">
                    すべてのセキュリティ推奨事項を満たしています。証券口座の認証情報はAES-256で暗号化されています。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
