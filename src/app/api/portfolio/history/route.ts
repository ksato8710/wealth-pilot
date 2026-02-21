import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import type { DailyAsset } from "@/lib/types";

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

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function generateSyntheticHistory(): DailyAsset[] {
  const history: DailyAsset[] = [];
  const today = new Date();
  const baseInvested = 10_000_000;
  const baseCash = 500_000;
  let totalAsset = baseInvested + baseCash;

  // Walk backwards to find 300 trading days
  const tradingDays: Date[] = [];
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - 1); // start from yesterday

  while (tradingDays.length < 300) {
    if (isWeekday(cursor)) {
      tradingDays.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  tradingDays.reverse();

  // Generate data with a gentle upward trend and daily noise
  for (let i = 0; i < tradingDays.length; i++) {
    const date = tradingDays[i];
    const dateStr = date.toISOString().split("T")[0];

    // Daily return: slight upward bias with random noise
    const dailyReturn = 1 + (Math.random() * 0.03 - 0.012); // -1.2% to +1.8% range
    totalAsset = totalAsset * dailyReturn;

    const invested = baseInvested + (i / 300) * 2_000_000; // gradual DCA
    const cash = baseCash + Math.sin(i * 0.05) * 200_000; // oscillating cash
    const profit = totalAsset - invested - cash;

    history.push({
      date: dateStr,
      totalAsset: Math.round(totalAsset),
      invested: Math.round(invested),
      cash: Math.round(Math.max(0, cash)),
      profit: Math.round(profit),
    });
  }

  return history;
}

export async function GET() {
  try {
    await ensureUser();

    const snapshots = await prisma.assetSnapshot.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { date: "asc" },
    });

    if (snapshots.length === 0) {
      const history = generateSyntheticHistory();
      return NextResponse.json({ history });
    }

    const history: DailyAsset[] = snapshots.map((s: {
      date: string;
      totalAsset: number;
      invested: number;
      cash: number;
      profit: number;
    }) => ({
      date: s.date,
      totalAsset: s.totalAsset,
      invested: s.invested,
      cash: s.cash,
      profit: s.profit,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("GET /api/portfolio/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio history" },
      { status: 500 }
    );
  }
}
