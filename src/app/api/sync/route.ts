import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAllHoldings } from "@/lib/server/services/holdings-service";

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

export async function POST() {
  try {
    await ensureUser();

    const holdings = await getAllHoldings(DEFAULT_USER_ID);

    return NextResponse.json({
      success: true,
      holdingsCount: holdings.length,
    });
  } catch (error) {
    console.error("POST /api/sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync holdings" },
      { status: 500 }
    );
  }
}
