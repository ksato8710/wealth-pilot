import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import {
  updateManualHolding,
  deleteManualHolding,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureUser();

    const { id } = await params;
    const body = await request.json();

    const { symbol, name, nameEn, market, sector, shares, avgCost, account, nisaType, currency } = body;

    const holding = await updateManualHolding(id, {
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

    return NextResponse.json({ holding });
  } catch (error) {
    console.error("PUT /api/holdings/[id] error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update holding" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureUser();

    const { id } = await params;
    await deleteManualHolding(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/holdings/[id] error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete holding" },
      { status: 500 }
    );
  }
}
