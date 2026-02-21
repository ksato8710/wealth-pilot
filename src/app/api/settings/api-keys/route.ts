import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { encrypt } from "@/lib/server/encryption";

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

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: DEFAULT_USER_ID },
    });

    // Return metadata only - never expose decrypted keys
    const dataSources = apiKeys.map((key: {
      exchange: string;
      lastSyncAt: Date | null;
      assetCount: number;
    }) => ({
      exchange: key.exchange,
      connected: true,
      lastSyncAt: key.lastSyncAt?.toISOString() ?? null,
      assetCount: key.assetCount,
    }));

    return NextResponse.json({ dataSources });
  } catch (error) {
    console.error("GET /api/settings/api-keys error:", error);
    return NextResponse.json(
      { error: "Failed to fetch API key settings" },
      { status: 500 }
    );
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

    const encryptedKey = encrypt(apiKey);
    const encryptedSecret = encrypt(apiSecret);

    await prisma.apiKey.upsert({
      where: {
        userId_exchange: {
          userId: DEFAULT_USER_ID,
          exchange,
        },
      },
      create: {
        userId: DEFAULT_USER_ID,
        exchange,
        apiKeyEnc: encryptedKey.encrypted,
        iv: encryptedKey.iv,
        authTag: encryptedKey.authTag,
        apiSecretEnc: encryptedSecret.encrypted,
        ivSecret: encryptedSecret.iv,
        authTagSecret: encryptedSecret.authTag,
      },
      update: {
        apiKeyEnc: encryptedKey.encrypted,
        iv: encryptedKey.iv,
        authTag: encryptedKey.authTag,
        apiSecretEnc: encryptedSecret.encrypted,
        ivSecret: encryptedSecret.iv,
        authTagSecret: encryptedSecret.authTag,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/settings/api-keys error:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureUser();

    const body = await request.json();
    const { exchange } = body;

    if (!exchange) {
      return NextResponse.json(
        { error: "Missing required field: exchange" },
        { status: 400 }
      );
    }

    await prisma.apiKey.deleteMany({
      where: {
        userId: DEFAULT_USER_ID,
        exchange,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/settings/api-keys error:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
