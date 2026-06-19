import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/submissions
 * Returns all product submissions, optionally filtered by status.
 * Query params: ?status=pending|reviewed|accepted|rejected
 * This is a lightweight admin endpoint — no auth in this demo.
 */
export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const where = status ? { status } : {};
    const submissions = await db.productSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ ok: true, submissions });
  } catch (err) {
    console.error("[submissions] GET error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/submissions
 * Update a submission's status (for moderation).
 * Body: { id: string, status: "pending"|"reviewed"|"accepted"|"rejected" }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, status } = body;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
    }
    const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    const updated = await db.productSubmission.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ ok: true, submission: updated });
  } catch (err) {
    console.error("[submissions] PATCH error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
