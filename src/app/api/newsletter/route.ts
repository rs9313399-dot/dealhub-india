import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Simple email validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = typeof body.source === "string" ? body.source.slice(0, 20) : "home";

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    // Upsert: if already subscribed, just mark active + update source
    const sub = await db.newsletterSubscriber.upsert({
      where: { email },
      create: { email, source, active: true },
      update: { active: true, source },
    });

    return NextResponse.json({
      ok: true,
      id: sub.id,
      message: "Subscribed",
    });
  } catch (err) {
    console.error("[newsletter] POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  // Lightweight stats endpoint for the footer / home counter (no PII)
  try {
    const count = await db.newsletterSubscriber.count({ where: { active: true } });
    return NextResponse.json({ ok: true, count });
  } catch (err) {
    console.error("[newsletter] GET error", err);
    return NextResponse.json({ ok: false, count: 0 }, { status: 500 });
  }
}
