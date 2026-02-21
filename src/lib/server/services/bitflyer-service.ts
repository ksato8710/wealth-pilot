import { createHmac } from "crypto";
import { checkRateLimit } from "@/lib/server/rate-limiter";

const BASE_URL = "https://bitflyer.com";

function createSignature(
  apiSecret: string,
  timestamp: string,
  method: string,
  path: string,
  body: string = ""
): string {
  const text = timestamp + method + path + body;
  return createHmac("sha256", apiSecret).update(text).digest("hex");
}

async function bitflyerFetch(
  path: string,
  options: {
    apiKey?: string;
    apiSecret?: string;
    signed?: boolean;
  } = {}
): Promise<unknown> {
  const rateCheck = checkRateLimit("bitflyer", 500, 300000);
  if (!rateCheck.allowed) {
    throw new Error(
      `bitFlyer API rate limit exceeded. Retry after ${rateCheck.retryAfterMs}ms`
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.signed && options.apiKey && options.apiSecret) {
    const timestamp = Date.now().toString();
    const signature = createSignature(
      options.apiSecret,
      timestamp,
      "GET",
      path
    );
    headers["ACCESS-KEY"] = options.apiKey;
    headers["ACCESS-TIMESTAMP"] = timestamp;
    headers["ACCESS-SIGN"] = signature;
  }

  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `bitFlyer API error: ${response.status} ${response.statusText} - ${body}`
    );
  }

  return response.json();
}

export async function getBitflyerBalances(
  apiKey: string,
  apiSecret: string
): Promise<
  Array<{ currency_code: string; amount: number; available: number }>
> {
  const data = (await bitflyerFetch("/v1/me/getbalance", {
    apiKey,
    apiSecret,
    signed: true,
  })) as Array<{
    currency_code: string;
    amount: number;
    available: number;
  }>;

  if (!Array.isArray(data)) {
    throw new Error(
      "bitFlyer API returned unexpected response: expected balance array"
    );
  }

  return data.filter((b) => b.amount > 0);
}

export async function getBitflyerPrice(pair: string): Promise<number> {
  const data = (await bitflyerFetch(
    `/v1/ticker?product_code=${encodeURIComponent(pair)}`
  )) as {
    product_code: string;
    ltp: number;
    best_bid: number;
    best_ask: number;
  };

  if (data.ltp === undefined && data.ltp === null) {
    throw new Error(`bitFlyer API: no price data for pair ${pair}`);
  }

  return data.ltp;
}
