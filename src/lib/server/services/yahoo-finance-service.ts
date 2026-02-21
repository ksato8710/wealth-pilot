import YahooFinance from "yahoo-finance2";
import { prisma } from "@/lib/server/prisma";

const yahooFinance = new YahooFinance();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface StockPriceResult {
  price: number;
  prevClose: number;
  currency: string;
}

interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

async function getCachedPrice(
  symbol: string
): Promise<StockPriceResult | null> {
  const cached = await prisma.priceCache.findUnique({
    where: { symbol },
  });

  if (!cached) {
    return null;
  }

  const age = Date.now() - cached.updatedAt.getTime();
  if (age > CACHE_TTL_MS) {
    return null;
  }

  return {
    price: cached.price,
    prevClose: cached.prevClose ?? cached.price,
    currency: cached.currency,
  };
}

async function updatePriceCache(
  symbol: string,
  data: StockPriceResult
): Promise<void> {
  await prisma.priceCache.upsert({
    where: { symbol },
    create: {
      symbol,
      price: data.price,
      prevClose: data.prevClose,
      currency: data.currency,
    },
    update: {
      price: data.price,
      prevClose: data.prevClose,
      currency: data.currency,
    },
  });
}

export async function getStockPrice(
  symbol: string
): Promise<StockPriceResult> {
  const cached = await getCachedPrice(symbol);
  if (cached) {
    return cached;
  }

  try {
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ["price"],
    });

    const priceModule = result.price;
    if (!priceModule) {
      throw new Error(`Yahoo Finance: no price module returned for ${symbol}`);
    }

    const currentPrice = priceModule.regularMarketPrice;
    const previousClose = priceModule.regularMarketPreviousClose;
    const currency = priceModule.currency ?? "JPY";

    if (currentPrice === undefined || currentPrice === null) {
      throw new Error(
        `Yahoo Finance: no market price available for ${symbol}`
      );
    }

    const priceResult: StockPriceResult = {
      price: currentPrice,
      prevClose: previousClose ?? currentPrice,
      currency,
    };

    await updatePriceCache(symbol, priceResult);

    return priceResult;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(
      `Failed to fetch stock price for ${symbol}: ${message}`
    );
  }
}

export async function getStockPrices(
  symbols: string[]
): Promise<Record<string, StockPriceResult>> {
  const results: Record<string, StockPriceResult> = {};

  const fetchPromises = symbols.map(async (symbol) => {
    try {
      const price = await getStockPrice(symbol);
      results[symbol] = price;
    } catch (error) {
      console.error(
        `Failed to fetch price for ${symbol}:`,
        error instanceof Error ? error.message : error
      );
    }
  });

  await Promise.all(fetchPromises);

  return results;
}

export async function searchStock(
  query: string
): Promise<StockSearchResult[]> {
  try {
    const result = await yahooFinance.search(query);

    if (!result.quotes || !Array.isArray(result.quotes)) {
      return [];
    }

    return result.quotes
      .filter(
        (q): q is Extract<typeof q, { isYahooFinance: true }> =>
          "isYahooFinance" in q && q.isYahooFinance === true
      )
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname ?? q.longname ?? q.symbol,
        exchange: q.exchange ?? "UNKNOWN",
      }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to search stocks for "${query}": ${message}`);
  }
}
