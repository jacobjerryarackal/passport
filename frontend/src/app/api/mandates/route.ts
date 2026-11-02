import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { logAuditEvent } from "@/server/audit/logger";

export async function GET() {
  try {
    const mandates = await prisma.mandate.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        proposals: { orderBy: { createdAt: "desc" } },
        purchases: { orderBy: { createdAt: "desc" } },
        passports: true,
      },
    });

    return NextResponse.json({ mandates });
  } catch (err) {
    console.error("GET /api/mandates error:", err);
    return NextResponse.json({ error: "Failed to fetch mandates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, purpose, maxAmount, currency = "USD", allowedCategories, expiryHours = 24, refundPolicy, rawPrompt } = body;

    if (!title || !purpose || !maxAmount) {
      return NextResponse.json({ error: "Missing required mandate fields" }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + Number(expiryHours) * 3600000);
    const categoriesArray = Array.isArray(allowedCategories)
      ? allowedCategories
      : typeof allowedCategories === "string"
      ? allowedCategories.split(",").map((c: string) => c.trim())
      : ["digital gift cards"];

    const mandate = await prisma.mandate.create({
      data: {
        title,
        purpose,
        maxAmount: Number(maxAmount),
        currency: currency.toUpperCase(),
        allowedCategories: JSON.stringify(categoriesArray),
        expiryHours: Number(expiryHours),
        expiresAt,
        refundPolicy: refundPolicy || "Refund allowed if purchase is incorrect or unauthorized",
        status: "ACTIVE",
        rawPrompt: rawPrompt || null,
      },
    });

    await logAuditEvent({
      mandateId: mandate.id,
      action: "MANDATE_CREATED",
      actor: "HUMAN_ADMIN",
      actorModel: "dashboard-session",
      details: {
        title: mandate.title,
        maxAmount: mandate.maxAmount,
        currency: mandate.currency,
        allowedCategories: categoriesArray,
        expiresAt: expiresAt.toISOString(),
      },
    });

    return NextResponse.json({ mandate }, { status: 201 });
  } catch (err) {
    console.error("POST /api/mandates error:", err);
    return NextResponse.json({ error: "Failed to create mandate" }, { status: 500 });
  }
}

