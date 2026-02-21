import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getPortfolioSummary } from "@/lib/server/services/portfolio-service";

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
    const summary = await getPortfolioSummary(DEFAULT_USER_ID);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("GET /api/portfolio/summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio summary" },
      { status: 500 }
    );
  }
}
