import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST: create a price-drop alert for a product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const productKey = typeof body.productKey === "string" ? body.productKey : "";
    const targetPrice = Number(body.targetPrice);

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    if (!/^[a-z0-9-]+:\d+$/.test(productKey)) {
      return NextResponse.json({ ok: false, error: "Invalid product key" }, { status: 400 });
    }
    if (!Number.isFinite(targetPrice) || targetPrice < 1 || targetPrice > 1000000) {
      return NextResponse.json({ ok: false, error: "Invalid target price" }, { status: 400 });
    }

    const alert = await db.priceAlert.upsert({
      where: { email_productKey: { email, productKey } },
      create: { email, productKey, targetPrice },
      update: { targetPrice, notified: false },
    });

    return NextResponse.json({ ok: true, id: alert.id });
  } catch (err) {
    console.error("[price-alerts] POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

// GET: count how many alerts exist for a product (social proof)
export async function GET(req: NextRequest) {
  const productKey = req.nextUrl.searchParams.get("productKey");
  if (!productKey || !/^[a-z0-9-]+:\d+$/.test(productKey)) {
    return NextResponse.json({ ok: false, error: "Invalid product key" }, { status: 400 });
  }
  try {
    const count = await db.priceAlert.count({ where: { productKey } });
    return NextResponse.json({ ok: true, count });
  } catch (err) {
    console.error("[price-alerts] GET error", err);
    return NextResponse.json({ ok: false, count: 0 }, { status: 500 });
  }
}
