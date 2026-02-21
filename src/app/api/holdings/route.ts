import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import {
  getAllHoldings,
  addManualHolding,
} from "@/lib/server/services/holdings-service";

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

export async function GET() {
  try {
    await ensureUser();
    const holdings = await getAllHoldings(DEFAULT_USER_ID);
    return NextResponse.json({ holdings });
  } catch (error) {
    console.error("GET /api/holdings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch holdings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUser();

    const body = await request.json();
    const { symbol, name, nameEn, market, sector, shares, avgCost, account, nisaType, currency } = body;

    if (!symbol || !name || !market || !sector || shares == null || avgCost == null || !account) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, name, market, sector, shares, avgCost, account" },
        { status: 400 }
      );
    }

    const holding = await addManualHolding(DEFAULT_USER_ID, {
      symbol,
      name,
      nameEn,
      market,
      sector,
      shares,
      avgCost,
      account,
      nisaType,
      currency,
    });

    return NextResponse.json({ holding }, { status: 201 });
  } catch (error) {
    console.error("POST /api/holdings error:", error);
    return NextResponse.json(
      { error: "Failed to create holding" },
      { status: 500 }
    );
  }
}
