import { createHmac } from "crypto";
import { checkRateLimit } from "@/lib/server/rate-limiter";

const BASE_URL = "https://api.binance.com";

function sign(queryString: string, apiSecret: string): string {
  return createHmac("sha256", apiSecret)
    .update(queryString)
    .digest("hex");
}

async function binanceFetch(
  path: string,
  options: {
    apiKey?: string;
    apiSecret?: string;
    params?: Record<string, string>;
    signed?: boolean;
  } = {}
): Promise<unknown> {
  const rateCheck = checkRateLimit("binance", 1200, 60000);
  if (!rateCheck.allowed) {
    throw new Error(
      `Binance API rate limit exceeded. Retry after ${rateCheck.retryAfterMs}ms`
    );
  }

  const params = new URLSearchParams(options.params ?? {});
  const headers: Record<string, string> = {};

  if (options.apiKey) {
    headers["X-MBX-APIKEY"] = options.apiKey;
  }

  if (options.signed && options.apiSecret) {
    params.set("timestamp", Date.now().toString());
    params.set("recvWindow", "5000");
    const signature = sign(params.toString(), options.apiSecret);
    params.set("signature", signature);
  }

  const queryString = params.toString();
  const url = queryString ? `${BASE_URL}${path}?${queryString}` : `${BASE_URL}${path}`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Binance API error: ${response.status} ${response.statusText} - ${body}`
    );
  }

  return response.json();
}

export async function getBinanceBalances(
  apiKey: string,
  apiSecret: string
): Promise<Array<{ asset: string; free: number; locked: number }>> {
  const data = (await binanceFetch("/api/v3/account", {
    apiKey,
    apiSecret,
    signed: true,
  })) as {
    balances: Array<{ asset: string; free: string; locked: string }>;
  };

  if (!data.balances || !Array.isArray(data.balances)) {
    throw new Error("Binance API returned unexpected response: missing balances array");
  }

  return data.balances
    .map((b) => ({
      asset: b.asset,
      free: parseFloat(b.free),
      locked: parseFloat(b.locked),
    }))
    .filter((b) => b.free + b.locked > 0);
}

export async function getBinancePrice(symbol: string): Promise<number> {
  const data = (await binanceFetch("/api/v3/ticker/price", {
    params: { symbol },
  })) as { symbol: string; price: string };

  if (!data.price) {
    throw new Error(`Binance API: no price data for symbol ${symbol}`);
  }

  return parseFloat(data.price);
}

export async function getBinancePrices(
  symbols: string[]
): Promise<Record<string, number>> {
  if (symbols.length === 0) {
    return {};
  }

  const data = (await binanceFetch("/api/v3/ticker/price", {
    params: { symbols: JSON.stringify(symbols) },
  })) as Array<{ symbol: string; price: string }>;

  if (!Array.isArray(data)) {
    throw new Error("Binance API returned unexpected response for ticker prices");
  }

  const prices: Record<string, number> = {};
  for (const item of data) {
    prices[item.symbol] = parseFloat(item.price);
  }

  return prices;
}
