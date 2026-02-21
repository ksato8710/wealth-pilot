import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import type { DividendRecord, MonthlyDividend } from "@/lib/types";

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

    const dbRecords = await prisma.dividendRecord.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: { paymentDate: "desc" },
    });

    if (dbRecords.length === 0) {
      return NextResponse.json({
        records: [] as DividendRecord[],
        monthly: [] as MonthlyDividend[],
      });
    }

    const records: DividendRecord[] = dbRecords.map((r: {
      id: string;
      symbol: string;
      name: string;
      amount: number;
      paymentDate: string;
      exDate: string;
      type: string;
    }) => ({
      id: r.id,
      symbol: r.symbol,
      name: r.name,
      amount: r.amount,
      paymentDate: r.paymentDate,
      exDate: r.exDate,
      type: r.type as "actual" | "forecast",
    }));

    // Compute monthly aggregates
    const monthlyMap = new Map<string, { amount: number; forecast: number }>();

    for (const record of records) {
      // Extract YYYY-MM from paymentDate (format: YYYY-MM-DD)
      const month = record.paymentDate.substring(0, 7);
      const entry = monthlyMap.get(month) ?? { amount: 0, forecast: 0 };

      if (record.type === "actual") {
        entry.amount += record.amount;
      } else {
        entry.forecast += record.amount;
      }

      monthlyMap.set(month, entry);
    }

    const monthly: MonthlyDividend[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        forecast: data.forecast,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({ records, monthly });
  } catch (error) {
    console.error("GET /api/dividends error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dividend records" },
      { status: 500 }
    );
  }
}
