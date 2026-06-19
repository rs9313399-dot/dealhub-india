import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { allProducts, categories } from "@/data/products";

/**
 * GET /api/price-check
 * Scans all active price alerts and checks if any product's current price
 * has dropped to or below the alert's target price. Marks them as notified.
 *
 * Handles three productKey formats:
 * - `${slug}:${rank}` — specific product alert
 * - `${slug}:any` — category-wide alert (triggered if ANY product in the category ≤ target)
 * - `all:any` — global alert (triggered if ANY product across ALL categories ≤ target)
 *
 * In production this would be called by a cron job (e.g., every 6 hours).
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.PRICE_CHECK_SECRET && process.env.PRICE_CHECK_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Build a lookup of current prices by productKey
    const priceMap = new Map<string, number>();
    for (const p of allProducts) {
      priceMap.set(`${p.categorySlug}:${p.rank}`, p.price);
    }

    // Find all alerts that haven't been notified yet
    const pending = await db.priceAlert.findMany({ where: { notified: false } });

    let triggered = 0;
    let categoryTriggered = 0;
    let globalTriggered = 0;

    for (const alert of pending) {
      const [slug, rankPart] = alert.productKey.split(":");

      if (rankPart === "any") {
        // Category-wide or global alert
        const isGlobal = slug === "all";
        const productsToCheck = isGlobal
          ? allProducts
          : allProducts.filter((p) => p.categorySlug === slug);

        if (productsToCheck.length === 0) continue;

        // Trigger if ANY product in scope is at or below the target price
        const hasMatch = productsToCheck.some((p) => p.price <= alert.targetPrice);
        if (hasMatch) {
          await db.priceAlert.update({
            where: { id: alert.id },
            data: { notified: true },
          });
          triggered++;
          if (isGlobal) globalTriggered++;
          else categoryTriggered++;
        }
      } else {
        // Specific product alert
        const currentPrice = priceMap.get(alert.productKey);
        if (currentPrice === undefined) continue;
        if (currentPrice <= alert.targetPrice) {
          await db.priceAlert.update({
            where: { id: alert.id },
            data: { notified: true },
          });
          triggered++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      checked: pending.length,
      triggered,
      categoryTriggered,
      globalTriggered,
      skipped: pending.length - triggered,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[price-check] error", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
