import {
  Holding, AssetAllocation, DailyAsset, DividendRecord,
  MonthlyDividend, NewsItem, AIInsight, TaxSimulation,
  NISAStatus, SectorAllocation
} from "@/lib/types";

export const holdings: Holding[] = [
  {
    id: "1", symbol: "7203", name: "トヨタ自動車", nameEn: "Toyota Motor", market: "TSE",
    sector: "自動車", shares: 300, avgCost: 2450, currentPrice: 2890,
    previousClose: 2870, marketValue: 867000, unrealizedPL: 132000,
    unrealizedPLPercent: 17.96, dayChange: 6000, dayChangePercent: 0.70,
    dividendYield: 2.8, annualDividend: 24276, account: "SBI証券",
    nisaType: "growth", currency: "JPY",
  },
  {
    id: "2", symbol: "8306", name: "三菱UFJ FG", nameEn: "MUFG", market: "TSE",
    sector: "銀行", shares: 500, avgCost: 1180, currentPrice: 1650,
    previousClose: 1635, marketValue: 825000, unrealizedPL: 235000,
    unrealizedPLPercent: 39.83, dayChange: 7500, dayChangePercent: 0.92,
    dividendYield: 3.1, annualDividend: 25575, account: "SBI証券",
    nisaType: "growth", currency: "JPY",
  },
  {
    id: "3", symbol: "9432", name: "NTT", nameEn: "Nippon Telegraph", market: "TSE",
    sector: "通信", shares: 2000, avgCost: 170, currentPrice: 155,
    previousClose: 156, marketValue: 310000, unrealizedPL: -30000,
    unrealizedPLPercent: -8.82, dayChange: -2000, dayChangePercent: -0.64,
    dividendYield: 3.4, annualDividend: 10540, account: "楽天証券",
    nisaType: "growth", currency: "JPY",
  },
  {
    id: "4", symbol: "6861", name: "キーエンス", nameEn: "Keyence", market: "TSE",
    sector: "電気機器", shares: 10, avgCost: 62000, currentPrice: 68500,
    previousClose: 67800, marketValue: 685000, unrealizedPL: 65000,
    unrealizedPLPercent: 10.48, dayChange: 7000, dayChangePercent: 1.03,
    dividendYield: 0.4, annualDividend: 2740, account: "SBI証券",
    nisaType: null, currency: "JPY",
  },
  {
    id: "5", symbol: "8058", name: "三菱商事", nameEn: "Mitsubishi Corp", market: "TSE",
    sector: "卸売", shares: 200, avgCost: 2200, currentPrice: 2580,
    previousClose: 2550, marketValue: 516000, unrealizedPL: 76000,
    unrealizedPLPercent: 17.27, dayChange: 6000, dayChangePercent: 1.18,
    dividendYield: 3.5, annualDividend: 18060, account: "楽天証券",
    nisaType: "growth", currency: "JPY",
  },
  {
    id: "6", symbol: "AAPL", name: "Apple", nameEn: "Apple Inc.", market: "NASDAQ",
    sector: "テクノロジー", shares: 20, avgCost: 175, currentPrice: 228,
    previousClose: 226, marketValue: 684000, unrealizedPL: 159000,
    unrealizedPLPercent: 30.29, dayChange: 6000, dayChangePercent: 0.88,
    dividendYield: 0.5, annualDividend: 3420, account: "SBI証券",
    nisaType: null, currency: "USD",
  },
  {
    id: "7", symbol: "MSFT", name: "Microsoft", nameEn: "Microsoft Corp", market: "NASDAQ",
    sector: "テクノロジー", shares: 15, avgCost: 340, currentPrice: 415,
    previousClose: 412, marketValue: 934875, unrealizedPL: 168750,
    unrealizedPLPercent: 22.05, dayChange: 6750, dayChangePercent: 0.73,
    dividendYield: 0.7, annualDividend: 6544, account: "SBI証券",
    nisaType: null, currency: "USD",
  },
  {
    id: "8", symbol: "2914", name: "日本たばこ産業", nameEn: "Japan Tobacco", market: "TSE",
    sector: "食品", shares: 200, avgCost: 3800, currentPrice: 4250,
    previousClose: 4230, marketValue: 850000, unrealizedPL: 90000,
    unrealizedPLPercent: 11.84, dayChange: 4000, dayChangePercent: 0.47,
    dividendYield: 4.5, annualDividend: 38250, account: "楽天証券",
    nisaType: "growth", currency: "JPY",
  },
  {
    id: "9", symbol: "VT", name: "Vanguard Total World", nameEn: "VT ETF", market: "NYSE",
    sector: "グローバル株式", shares: 50, avgCost: 95, currentPrice: 112,
    previousClose: 111, marketValue: 840000, unrealizedPL: 127500,
    unrealizedPLPercent: 17.89, dayChange: 7500, dayChangePercent: 0.90,
    dividendYield: 2.0, annualDividend: 16800, account: "SBI証券",
    nisaType: "tsumitate", currency: "USD",
  },
  {
    id: "10", symbol: "eMAXIS", name: "eMAXIS Slim 全世界株式", market: "FUND",
    sector: "グローバル株式", shares: 1, avgCost: 1800000, currentPrice: 2250000,
    previousClose: 2240000, marketValue: 2250000, unrealizedPL: 450000,
    unrealizedPLPercent: 25.00, dayChange: 10000, dayChangePercent: 0.44,
    dividendYield: 0, annualDividend: 0, account: "楽天証券",
    nisaType: "tsumitate", currency: "JPY",
  },
];

export const totalCash = 1_520_000;

export const getTotalAsset = () =>
  holdings.reduce((sum, h) => sum + h.marketValue, 0) + totalCash;

export const getTotalUnrealizedPL = () =>
  holdings.reduce((sum, h) => sum + h.unrealizedPL, 0);

export const getTotalDayChange = () =>
  holdings.reduce((sum, h) => sum + h.dayChange, 0);

export const assetAllocation: AssetAllocation[] = [
  { category: "日本株式", value: 4053000, percentage: 41.2, color: "#6366f1" },
  { category: "米国株式", value: 1618875, percentage: 16.5, color: "#8b5cf6" },
  { category: "グローバル株式", value: 3090000, percentage: 31.4, color: "#a78bfa" },
  { category: "現金", value: 1520000, percentage: 15.5, color: "#475569" },
];

const generateAssetHistory = (): DailyAsset[] => {
  const data: DailyAsset[] = [];
  let totalAsset = 7_200_000;
  let invested = 6_500_000;
  const startDate = new Date("2025-01-01");

  for (let i = 0; i < 420; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dailyReturn = (Math.random() - 0.47) * 0.015;
    totalAsset = Math.round(totalAsset * (1 + dailyReturn));
    if (i % 30 === 0) invested += 100000;

    data.push({
      date: date.toISOString().split("T")[0],
      totalAsset,
      invested,
      cash: Math.round(totalAsset * 0.15),
      profit: totalAsset - invested,
    });
  }
  return data;
};

export const assetHistory = generateAssetHistory();

export const monthlyDividends: MonthlyDividend[] = [
  { month: "2025-01", amount: 8500, forecast: 0 },
  { month: "2025-02", amount: 3200, forecast: 0 },
  { month: "2025-03", amount: 45600, forecast: 0 },
  { month: "2025-04", amount: 12300, forecast: 0 },
  { month: "2025-05", amount: 5800, forecast: 0 },
  { month: "2025-06", amount: 52400, forecast: 0 },
  { month: "2025-07", amount: 9100, forecast: 0 },
  { month: "2025-08", amount: 4500, forecast: 0 },
  { month: "2025-09", amount: 48300, forecast: 0 },
  { month: "2025-10", amount: 11200, forecast: 0 },
  { month: "2025-11", amount: 6700, forecast: 0 },
  { month: "2025-12", amount: 55800, forecast: 0 },
  { month: "2026-01", amount: 9200, forecast: 9800 },
  { month: "2026-02", amount: 3800, forecast: 4200 },
  { month: "2026-03", amount: 0, forecast: 48900 },
  { month: "2026-04", amount: 0, forecast: 13200 },
  { month: "2026-05", amount: 0, forecast: 6400 },
  { month: "2026-06", amount: 0, forecast: 56800 },
  { month: "2026-07", amount: 0, forecast: 10200 },
  { month: "2026-08", amount: 0, forecast: 5100 },
  { month: "2026-09", amount: 0, forecast: 52400 },
  { month: "2026-10", amount: 0, forecast: 12800 },
  { month: "2026-11", amount: 0, forecast: 7200 },
  { month: "2026-12", amount: 0, forecast: 60200 },
];

export const dividendRecords: DividendRecord[] = [
  { id: "d1", symbol: "7203", name: "トヨタ自動車", amount: 12138, paymentDate: "2025-12-01", exDate: "2025-09-30", type: "actual" },
  { id: "d2", symbol: "8306", name: "三菱UFJ FG", amount: 12787, paymentDate: "2025-12-01", exDate: "2025-09-30", type: "actual" },
  { id: "d3", symbol: "8058", name: "三菱商事", amount: 9030, paymentDate: "2025-12-01", exDate: "2025-09-30", type: "actual" },
  { id: "d4", symbol: "2914", name: "日本たばこ産業", amount: 19125, paymentDate: "2025-12-20", exDate: "2025-12-01", type: "actual" },
  { id: "d5", symbol: "9432", name: "NTT", amount: 5270, paymentDate: "2025-12-01", exDate: "2025-09-30", type: "actual" },
  { id: "d6", symbol: "7203", name: "トヨタ自動車", amount: 12138, paymentDate: "2026-06-01", exDate: "2026-03-31", type: "forecast" },
  { id: "d7", symbol: "8306", name: "三菱UFJ FG", amount: 13500, paymentDate: "2026-06-01", exDate: "2026-03-31", type: "forecast" },
  { id: "d8", symbol: "8058", name: "三菱商事", amount: 10000, paymentDate: "2026-06-01", exDate: "2026-03-31", type: "forecast" },
  { id: "d9", symbol: "2914", name: "日本たばこ産業", amount: 20000, paymentDate: "2026-06-20", exDate: "2026-06-01", type: "forecast" },
];

export const newsItems: NewsItem[] = [
  {
    id: "n1", title: "日銀、追加利上げを示唆 - 春闘結果を注視",
    source: "日本経済新聞", publishedAt: "2026-02-21T09:00:00",
    impact: "negative", impactScore: -2.3,
    relatedSymbols: ["8306", "7203"],
    summary: "日銀の植田総裁が追加利上げの可能性を示唆。銀行株にはプラス、自動車・不動産にはマイナスの影響が予想されます。あなたの三菱UFJ FGには+1.2%のポジティブインパクト、トヨタ自動車には-0.8%のネガティブインパクトが見込まれます。",
  },
  {
    id: "n2", title: "Apple、Vision Pro 2を発表 - 価格を大幅引き下げ",
    source: "Bloomberg", publishedAt: "2026-02-21T07:30:00",
    impact: "positive", impactScore: 3.1,
    relatedSymbols: ["AAPL"],
    summary: "Appleが第2世代Vision Proを発表。価格は初代の半額以下で、市場予想を上回る反応。あなたの保有するAAPL株（20株）に約+2.5%のポジティブインパクトが見込まれます。",
  },
  {
    id: "n3", title: "三菱商事、銅鉱山権益を追加取得 - 資源価格上昇を追い風に",
    source: "ロイター", publishedAt: "2026-02-20T18:00:00",
    impact: "positive", impactScore: 1.8,
    relatedSymbols: ["8058"],
    summary: "三菱商事がチリの銅鉱山の権益を追加取得。EV需要拡大に伴う銅価格上昇の恩恵を受ける見通し。中長期的にポジティブ。",
  },
  {
    id: "n4", title: "NTT法改正案、国会提出へ - 研究開発子会社の売却に道",
    source: "朝日新聞", publishedAt: "2026-02-20T12:00:00",
    impact: "neutral", impactScore: 0.5,
    relatedSymbols: ["9432"],
    summary: "NTT法改正案が国会に提出される見通し。短期的な株価影響は限定的だが、中長期的な事業再編の自由度が高まる可能性があります。",
  },
];

export const aiInsights: AIInsight[] = [
  {
    id: "ai1", type: "risk", title: "テクノロジーセクター偏重リスク",
    description: "ポートフォリオの31.5%がテクノロジー関連に集中しています。TOPIX構成比（約14%）の2倍以上で、セクターリスクが高い状態です。キーエンス、Apple、Microsoftの3銘柄で総資産の23.5%を占めています。ディフェンシブセクター（食品・医薬品・公益）への分散を検討してみてはいかがでしょうか。",
    priority: "high", actionable: true, createdAt: "2026-02-21T08:00:00",
  },
  {
    id: "ai2", type: "tax", title: "NTT株の損出しで約6,100円の節税機会",
    description: "NTTの含み損が30,000円あります。年内に一度売却して損失を確定させ、翌営業日に買い戻すことで、他の銘柄の実現益と損益通算が可能です。推定節税額は約6,100円（税率20.315%）です。特定口座での取引なら確定申告も不要です。",
    priority: "medium", actionable: true, createdAt: "2026-02-21T08:00:00",
  },
  {
    id: "ai3", type: "dividend", title: "3月は配当集中月 - 予想配当48,900円",
    description: "来月3月は配当権利確定の集中月です。保有銘柄から合計48,900円の配当金が見込まれます。前年同月（45,600円）比+7.2%の増加予想です。三菱UFJ FGと三菱商事の増配が主な要因です。",
    priority: "low", actionable: false, createdAt: "2026-02-21T08:00:00",
  },
  {
    id: "ai4", type: "rebalance", title: "NISA成長投資枠の残り72万円を活用",
    description: "2026年のNISA成長投資枠（240万円）のうち、168万円を使用済みです。残り72万円の枠があります。高配当銘柄をNISA口座で保有すると、配当金が非課税になるメリットがあります。現在特定口座で保有中のJT（年間配当38,250円）をNISA口座に移管検討はいかがでしょうか。",
    priority: "high", actionable: true, createdAt: "2026-02-21T08:00:00",
  },
  {
    id: "ai5", type: "behavioral", title: "損切りの遅れ傾向を検知",
    description: "過去6ヶ月の取引を分析した結果、含み損銘柄の保有期間が含み益銘柄と比較して平均2.3倍長くなっています。これは「損失回避バイアス」の典型的な兆候です。NTT株は購入時から-8.8%下落していますが、損失確定のルールを事前に設定することをお勧めします。",
    priority: "medium", actionable: true, createdAt: "2026-02-21T08:00:00",
  },
];

export const taxSimulation: TaxSimulation = {
  realizedProfit: 285000,
  realizedLoss: -45000,
  netProfit: 240000,
  estimatedTax: 48756,
  taxRate: 20.315,
  potentialTaxSaving: 6095,
  recommendations: [
    {
      id: "tr1", type: "loss_harvest", symbol: "9432", name: "NTT",
      action: "含み損30,000円を確定させ損益通算",
      estimatedSaving: 6095,
      description: "NTT株を一旦売却し含み損を実現化。翌営業日に買い戻すことで、ポジションを維持しつつ6,095円の節税が可能です。",
    },
    {
      id: "tr2", type: "nisa_optimize", symbol: "2914", name: "日本たばこ産業",
      action: "特定口座→NISA口座への移管を検討",
      estimatedSaving: 7770,
      description: "JTの年間配当38,250円に対し、特定口座では年間約7,770円の税金がかかります。NISA成長投資枠（残72万円）で買い直すことで、配当金が非課税になります。",
    },
    {
      id: "tr3", type: "timing", symbol: "8058", name: "三菱商事",
      action: "利益確定は来年まで待つ検討を",
      estimatedSaving: 15441,
      description: "三菱商事の含み益76,000円を今年確定すると約15,441円の課税。来年まで保有を継続し、NISA枠を活用して段階的に移管する戦略が有効です。",
    },
  ],
};

export const nisaStatus: NISAStatus = {
  growthUsed: 1_680_000,
  growthLimit: 2_400_000,
  tsumitateUsed: 840_000,
  tsumitateLimit: 1_200_000,
  lifetimeUsed: 6_200_000,
  lifetimeLimit: 18_000_000,
};

export const sectorAllocations: SectorAllocation[] = [
  { sector: "テクノロジー", value: 2303875, percentage: 23.5, change: 1.5 },
  { sector: "自動車", value: 867000, percentage: 8.8, change: -0.3 },
  { sector: "銀行", value: 825000, percentage: 8.4, change: 0.8 },
  { sector: "卸売", value: 516000, percentage: 5.3, change: 0.2 },
  { sector: "通信", value: 310000, percentage: 3.2, change: -0.1 },
  { sector: "食品", value: 850000, percentage: 8.7, change: 0.1 },
  { sector: "グローバル株式", value: 3090000, percentage: 31.4, change: 0.5 },
  { sector: "現金", value: 1520000, percentage: 15.5, change: -0.2 },
];

export const aiChatSuggestions = [
  "ポートフォリオのリスクを分析して",
  "今月の配当金はいくら？",
  "セクター偏りを改善するには？",
  "NISA枠を最大限活用する方法は？",
  "今年の税金を最適化するには？",
  "来月の配当予定を教えて",
];
