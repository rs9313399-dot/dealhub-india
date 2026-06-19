import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const PRODUCT_KEY_RE = /^[a-z0-9-]+:\d+$/;

/**
 * GET /api/comments?productKey=smartwatches:1
 * Returns all approved comments for a product, newest first.
 */
/**
 * POST /api/comments
 * Creates a new comment. Body: { productKey, author, text }
 */
/**
 * PATCH /api/comments
 * Upvote or report a comment. Body: { id, action: "upvote" | "report" }
 */

export async function GET(req: NextRequest) {
  try {
    const productKey = req.nextUrl.searchParams.get("productKey");
    if (!productKey || !PRODUCT_KEY_RE.test(productKey)) {
      return NextResponse.json({ ok: false, error: "Invalid product key" }, { status: 400 });
    }
    const comments = await db.comment.findMany({
      where: { productKey, status: "approved" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ ok: true, comments });
  } catch (err) {
    console.error("[comments] GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const productKey = typeof body.productKey === "string" ? body.productKey : "";
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!PRODUCT_KEY_RE.test(productKey)) {
      return NextResponse.json({ ok: false, error: "Invalid product key" }, { status: 400 });
    }
    if (!author || author.length < 1 || author.length > 40) {
      return NextResponse.json({ ok: false, error: "Author name must be 1-40 characters" }, { status: 400 });
    }
    if (!text || text.length < 2 || text.length > 500) {
      return NextResponse.json({ ok: false, error: "Comment must be 2-500 characters" }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: { productKey, author, text, status: "approved" },
    });

    return NextResponse.json({ ok: true, comment });
  } catch (err) {
    console.error("[comments] POST error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : "";
    const action = typeof body.action === "string" ? body.action : "";

    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing comment id" }, { status: 400 });
    }
    if (action !== "upvote" && action !== "report") {
      return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
    }

    const existing = await db.comment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Comment not found" }, { status: 404 });
    }

    const updated = await db.comment.update({
      where: { id },
      data: {
        helpful: action === "upvote" ? existing.helpful + 1 : existing.helpful,
        reports: action === "report" ? existing.reports + 1 : existing.reports,
        // Auto-hide if 3+ reports (simple moderation heuristic)
        status: action === "report" && existing.reports + 1 >= 3 ? "hidden" : existing.status,
      },
    });

    return NextResponse.json({ ok: true, comment: updated });
  } catch (err) {
    console.error("[comments] PATCH error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
