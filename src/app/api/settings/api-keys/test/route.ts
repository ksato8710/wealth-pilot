import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getBinanceBalances } from "@/lib/server/services/binance-service";
import { getBitflyerBalances } from "@/lib/server/services/bitflyer-service";

const DEFAULT_USER_ID = "default-user";

async function ensureUser() {
  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });
  if (!user) {
    await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        name: "Default User",
        email: "user@wealthpilot.local",
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUser();

    const body = await request.json();
    const { exchange, apiKey, apiSecret } = body;

    if (!exchange || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Missing required fields: exchange, apiKey, apiSecret" },
        { status: 400 }
      );
    }

    if (exchange !== "binance" && exchange !== "bitflyer") {
      return NextResponse.json(
        { error: "Invalid exchange. Supported: binance, bitflyer" },
        { status: 400 }
      );
    }

    let assetCount = 0;

    if (exchange === "binance") {
      const balances = await getBinanceBalances(apiKey, apiSecret);
      assetCount = balances.length;
    } else if (exchange === "bitflyer") {
      const balances = await getBitflyerBalances(apiKey, apiSecret);
      assetCount = balances.length;
    }

    return NextResponse.json({ success: true, assetCount });
  } catch (error) {
    console.error("POST /api/settings/api-keys/test error:", error);

    const message =
      error instanceof Error ? error.message : "Connection test failed";

    return NextResponse.json(
      { success: false, error: message },
      { status: 200 }
    );
  }
}
