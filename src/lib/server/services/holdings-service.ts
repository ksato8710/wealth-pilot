import { prisma } from "@/lib/server/prisma";
import { decrypt } from "@/lib/server/encryption";
import { getStockPrice } from "@/lib/server/services/yahoo-finance-service";
import {
  getBinanceBalances,
  getBinancePrices,
} from "@/lib/server/services/binance-service";
import {
  getBitflyerBalances,
  getBitflyerPrice,
} from "@/lib/server/services/bitflyer-service";
import type { Holding } from "@/lib/types";

interface ManualHoldingInput {
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

function toYahooSymbol(symbol: string, market: string): string {
  if (market === "TSE") {
    return `${symbol}.T`;
  }
  return symbol;
}

async function getUsdJpyRate(): Promise<number> {
  try {
    const price = await getStockPrice("USDJPY=X");
    return price.price;
  } catch {
    console.error("Failed to fetch USD/JPY rate, using fallback 150");
    return 150;
  }
}

async function buildManualHoldings(userId: string): Promise<Holding[]> {
  const manualHoldings = await prisma.manualHolding.findMany({
    where: { userId },
  });

  const holdings: Holding[] = [];

  for (const mh of manualHoldings) {
    try {
      const yahooSymbol = toYahooSymbol(mh.symbol, mh.market);
      const priceData = await getStockPrice(yahooSymbol);

      const currentPrice = priceData.price;
      const previousClose = priceData.prevClose;
      const marketValue = currentPrice * mh.shares;
      const costBasis = mh.avgCost * mh.shares;
      const unrealizedPL = marketValue - costBasis;
      const unrealizedPLPercent =
        costBasis !== 0 ? (unrealizedPL / costBasis) * 100 : 0;
      const dayChange = (currentPrice - previousClose) * mh.shares;
      const dayChangePercent =
        previousClose !== 0
          ? ((currentPrice - previousClose) / previousClose) * 100
          : 0;

      holdings.push({
        id: mh.id,
        symbol: mh.symbol,
        name: mh.name,
        nameEn: mh.nameEn ?? undefined,
        market: mh.market as Holding["market"],
        sector: mh.sector,
        shares: mh.shares,
        avgCost: mh.avgCost,
        currentPrice,
        previousClose,
        marketValue,
        unrealizedPL,
        unrealizedPLPercent,
        dayChange,
        dayChangePercent,
        dividendYield: 0,
        annualDividend: 0,
        account: mh.account,
        nisaType: mh.nisaType as Holding["nisaType"],
        currency: mh.currency as Holding["currency"],
        source: "manual",
        lastUpdated: mh.updatedAt.toISOString(),
      });
    } catch (error) {
      console.error(
        `Failed to fetch price for manual holding ${mh.symbol}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  return holdings;
}

async function buildBinanceHoldings(
  apiKey: string,
  apiSecret: string
): Promise<Holding[]> {
  const balances = await getBinanceBalances(apiKey, apiSecret);

  if (balances.length === 0) {
    return [];
  }

  // Build price request symbols: e.g., BTCUSDT, ETHUSDT
  const priceSymbols = balances
    .filter((b) => b.asset !== "USDT" && b.asset !== "BUSD" && b.asset !== "USD")
    .map((b) => `${b.asset}USDT`);

  const [binancePrices, usdJpyRate] = await Promise.all([
    priceSymbols.length > 0
      ? getBinancePrices(priceSymbols)
      : Promise.resolve({} as Record<string, number>),
    getUsdJpyRate(),
  ]);

  const holdings: Holding[] = [];

  for (const balance of balances) {
    const totalAmount = balance.free + balance.locked;

    let priceUsd: number;
    let priceJpy: number;

    if (
      balance.asset === "USDT" ||
      balance.asset === "BUSD" ||
      balance.asset === "USD"
    ) {
      priceUsd = 1;
      priceJpy = usdJpyRate;
    } else {
      const pairSymbol = `${balance.asset}USDT`;
      priceUsd = binancePrices[pairSymbol] ?? 0;
      priceJpy = priceUsd * usdJpyRate;
    }

    const marketValue = totalAmount * priceJpy;

    holdings.push({
      id: `binance-${balance.asset}`,
      symbol: balance.asset,
      name: balance.asset,
      market: "BINANCE",
      sector: "暗号資産",
      shares: totalAmount,
      avgCost: 0,
      currentPrice: priceJpy,
      previousClose: priceJpy,
      marketValue,
      unrealizedPL: 0,
      unrealizedPLPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
      dividendYield: 0,
      annualDividend: 0,
      account: "Binance",
      nisaType: null,
      currency: "CRYPTO",
      source: "binance",
      lastUpdated: new Date().toISOString(),
    });
  }

  return holdings;
}

async function buildBitflyerHoldings(
  apiKey: string,
  apiSecret: string
): Promise<Holding[]> {
  const balances = await getBitflyerBalances(apiKey, apiSecret);

  if (balances.length === 0) {
    return [];
  }

  const holdings: Holding[] = [];

  for (const balance of balances) {
    const asset = balance.currency_code;

    // JPY balance in bitFlyer is fiat, not crypto
    if (asset === "JPY") {
      continue;
    }

    let priceJpy: number;
    try {
      priceJpy = await getBitflyerPrice(`${asset}_JPY`);
    } catch {
      console.error(
        `Failed to fetch bitFlyer price for ${asset}_JPY, skipping`
      );
      continue;
    }

    const totalAmount = balance.amount;
    const marketValue = totalAmount * priceJpy;

    holdings.push({
      id: `bitflyer-${asset}`,
      symbol: asset,
      name: asset,
      market: "BITFLYER",
      sector: "暗号資産",
      shares: totalAmount,
      avgCost: 0,
      currentPrice: priceJpy,
      previousClose: priceJpy,
      marketValue,
      unrealizedPL: 0,
      unrealizedPLPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
      dividendYield: 0,
      annualDividend: 0,
      account: "bitFlyer",
      nisaType: null,
      currency: "CRYPTO",
      source: "bitflyer",
      lastUpdated: new Date().toISOString(),
    });
  }

  return holdings;
}

export async function getAllHoldings(userId: string): Promise<Holding[]> {
  const [manualHoldings, apiKeys] = await Promise.all([
    buildManualHoldings(userId),
    prisma.apiKey.findMany({ where: { userId } }),
  ]);

  const exchangeHoldings: Holding[] = [];

  for (const key of apiKeys) {
    try {
      const decryptedApiKey = decrypt(key.apiKeyEnc, key.iv, key.authTag);
      const decryptedApiSecret = decrypt(
        key.apiSecretEnc,
        key.ivSecret,
        key.authTagSecret
      );

      if (key.exchange === "binance") {
        const binanceHoldings = await buildBinanceHoldings(
          decryptedApiKey,
          decryptedApiSecret
        );
        exchangeHoldings.push(...binanceHoldings);

        await prisma.apiKey.update({
          where: { id: key.id },
          data: {
            lastSyncAt: new Date(),
            assetCount: binanceHoldings.length,
          },
        });
      } else if (key.exchange === "bitflyer") {
        const bitflyerHoldings = await buildBitflyerHoldings(
          decryptedApiKey,
          decryptedApiSecret
        );
        exchangeHoldings.push(...bitflyerHoldings);

        await prisma.apiKey.update({
          where: { id: key.id },
          data: {
            lastSyncAt: new Date(),
            assetCount: bitflyerHoldings.length,
          },
        });
      }
    } catch (error) {
      console.error(
        `Failed to fetch holdings from ${key.exchange}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  return [...manualHoldings, ...exchangeHoldings];
}

export async function addManualHolding(
  userId: string,
  data: ManualHoldingInput
) {
  const holding = await prisma.manualHolding.create({
    data: {
      userId,
      symbol: data.symbol,
      name: data.name,
      nameEn: data.nameEn ?? null,
      market: data.market,
      sector: data.sector,
      shares: data.shares,
      avgCost: data.avgCost,
      account: data.account,
      nisaType: data.nisaType ?? null,
      currency: data.currency ?? "JPY",
    },
  });

  return holding;
}

export async function updateManualHolding(
  id: string,
  data: Partial<ManualHoldingInput>
) {
  const existing = await prisma.manualHolding.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Manual holding with id ${id} not found`);
  }

  const holding = await prisma.manualHolding.update({
    where: { id },
    data: {
      ...(data.symbol !== undefined && { symbol: data.symbol }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.nameEn !== undefined && { nameEn: data.nameEn ?? null }),
      ...(data.market !== undefined && { market: data.market }),
      ...(data.sector !== undefined && { sector: data.sector }),
      ...(data.shares !== undefined && { shares: data.shares }),
      ...(data.avgCost !== undefined && { avgCost: data.avgCost }),
      ...(data.account !== undefined && { account: data.account }),
      ...(data.nisaType !== undefined && { nisaType: data.nisaType ?? null }),
      ...(data.currency !== undefined && { currency: data.currency }),
    },
  });

  return holding;
}

export async function deleteManualHolding(id: string): Promise<void> {
  const existing = await prisma.manualHolding.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Manual holding with id ${id} not found`);
  }

  await prisma.manualHolding.delete({
    where: { id },
  });
}
