export interface Holding {
  id: string;
  symbol: string;
  name: string;
  nameEn?: string;
  market: "TSE" | "NYSE" | "NASDAQ" | "FUND";
  sector: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  previousClose: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  dividendYield: number;
  annualDividend: number;
  account: string;
  nisaType?: "growth" | "tsumitate" | null;
  currency: "JPY" | "USD";
}

export interface AssetAllocation {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface DailyAsset {
  date: string;
  totalAsset: number;
  invested: number;
  cash: number;
  profit: number;
}

export interface DividendRecord {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  paymentDate: string;
  exDate: string;
  type: "actual" | "forecast";
}

export interface MonthlyDividend {
  month: string;
  amount: number;
  forecast: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  impact: "positive" | "negative" | "neutral";
  impactScore: number;
  relatedSymbols: string[];
  summary: string;
}

export interface AIInsight {
  id: string;
  type: "risk" | "opportunity" | "rebalance" | "tax" | "dividend" | "behavioral";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface TaxSimulation {
  realizedProfit: number;
  realizedLoss: number;
  netProfit: number;
  estimatedTax: number;
  taxRate: number;
  potentialTaxSaving: number;
  recommendations: TaxRecommendation[];
}

export interface TaxRecommendation {
  id: string;
  type: "loss_harvest" | "nisa_optimize" | "timing";
  symbol: string;
  name: string;
  action: string;
  estimatedSaving: number;
  description: string;
}

export interface NISAStatus {
  growthUsed: number;
  growthLimit: number;
  tsumitateUsed: number;
  tsumitateLimit: number;
  lifetimeUsed: number;
  lifetimeLimit: number;
}

export interface UserProfile {
  name: string;
  email: string;
  accounts: BrokerAccount[];
  plan: "free" | "standard" | "professional";
}

export interface BrokerAccount {
  id: string;
  broker: string;
  accountType: string;
  connected: boolean;
  lastSync: string;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  change: number;
}
