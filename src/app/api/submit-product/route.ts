import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_CATEGORIES = ["smartwatches", "gaming-peripherals", "desk-setup", "powerbanks", "grooming"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const productName = typeof body.productName === "string" ? body.productName.trim() : "";
    const brand = typeof body.brand === "string" ? body.brand.trim() : "";
    const category = typeof body.category === "string" ? body.category : "";
    const price = Number(body.price);
    const url = typeof body.url === "string" ? body.url.trim() : null;
    const submitterEmail = typeof body.submitterEmail === "string" ? body.submitterEmail.trim().toLowerCase() : "";
    const submitterName = typeof body.submitterName === "string" ? body.submitterName.trim() : null;
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;

    // Validation
    if (!productName || productName.length < 2 || productName.length > 120) {
      return NextResponse.json({ ok: false, error: "Product name must be 2-120 characters" }, { status: 400 });
    }
    if (!brand || brand.length < 1 || brand.length > 60) {
      return NextResponse.json({ ok: false, error: "Brand is required" }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ ok: false, error: "Invalid category" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 1 || price > 100000) {
      return NextResponse.json({ ok: false, error: "Price must be between ₹1 and ₹1,00,000" }, { status: 400 });
    }
    if (!EMAIL_RE.test(submitterEmail)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }
    if (url && !/^https?:\/\//.test(url)) {
      return NextResponse.json({ ok: false, error: "URL must start with http:// or https://" }, { status: 400 });
    }

    const submission = await db.productSubmission.create({
      data: { productName, brand, category, price, url, submitterEmail, submitterName, notes },
    });

    return NextResponse.json({ ok: true, id: submission.id });
  } catch (err) {
    console.error("[submit-product] POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await db.productSubmission.count({ where: { status: "pending" } });
    return NextResponse.json({ ok: true, pending: count });
  } catch (err) {
    console.error("[submit-product] GET error", err);
    return NextResponse.json({ ok: false, pending: 0 }, { status: 500 });
  }
}
