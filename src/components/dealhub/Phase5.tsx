"use client";

import React, { useMemo, useState } from "react";
import {
  allProducts,
  categories,
  dealOfTheDay,
  discountPct,
  relatedProducts,
  productImageSlug,
  type FlatProduct,
} from "@/data/products";
import { useRouter } from "./Router";
import { formatINR } from "./Blocks";
import { DealsSortToggle } from "./Phase8";
import { GlobalDealAlert } from "./Phase10";
import { ProductImage } from "./Phase4";
import type { Category, Product } from "@/data/products";

/* ============================================================
   DealsPage — "Deals under ₹X" global filter page
   Lets readers filter ALL products across all categories by
   max price, min discount, and category. Sorted by discount.
   ============================================================ */
export function DealsPage() {
  const { navigate } = useRouter();
  const [maxPrice, setMaxPrice] = useState(3000);
  const [minDiscount, setMinDiscount] = useState(15);
  const [catFilter, setCatFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"discount" | "recent">("discount");

  const filtered = useMemo(() => {
    const list = allProducts
      .filter((p) => p.price <= maxPrice)
      .filter((p) => discountPct(p) >= minDiscount)
      .filter((p) => !catFilter || p.categorySlug === catFilter);
    if (sortBy === "recent") {
      // Sort by testedOn date descending (most recently tested first)
      return [...list].sort((a, b) => (b.testedOn || "").localeCompare(a.testedOn || ""));
    }
    return [...list].sort((a, b) => discountPct(b) - discountPct(a));
  }, [maxPrice, minDiscount, catFilter, sortBy]);

  const maxPriceCeiling = Math.max(...allProducts.map((p) => p.price));

  const openProduct = (p: FlatProduct) => {
    navigate({ name: "category", slug: p.categorySlug });
    setTimeout(() => {
      document.getElementById(`p-${p.rank}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  return (
    <div style={{ ["--accent" as string]: "var(--accent-neutral)" }}>
      <section className="border-b-2 border-[var(--text-primary)]">
        <div className="container-editorial py-10">
          <div className="flex flex-wrap items-baseline gap-3 mb-3">
            <span className="text-eyebrow">All categories</span>
            <span className="flex-1 rule" />
            <span className="text-eyebrow">{filtered.length} of {allProducts.length} products</span>
          </div>
          <h1 className="text-h1 mb-3 max-w-3xl">
            Deals under <span className="italic font-normal">any budget.</span>
          </h1>
          <p className="font-serif italic text-[1.15rem] text-[var(--text-muted)] max-w-2xl">
            Filter all 25 tested products across 5 categories by price and discount. Every product here survived multi-week testing — no duds, no sponsored picks.
          </p>
          <div className="mt-5">
            <GlobalDealAlert />
          </div>
        </div>
      </section>

      <div className="container-editorial py-8">
        {/* Filter controls */}
        <div className="deals-filters">
          <div className="df-group">
            <label className="df-label">Max price</label>
            <div className="range-wrap">
              <input
                type="range"
                min={400}
                max={maxPriceCeiling}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Maximum price"
              />
              <span className="font-semibold text-[var(--accent)] tabular-nums">{formatINR(maxPrice)}</span>
            </div>
          </div>
          <div className="df-group">
            <label className="df-label">Min discount</label>
            <div className="range-wrap">
              <input
                type="range"
                min={0}
                max={30}
                step={5}
                value={minDiscount}
                onChange={(e) => setMinDiscount(Number(e.target.value))}
                aria-label="Minimum discount percentage"
              />
              <span className="font-semibold text-[var(--accent)] tabular-nums">{minDiscount}%+</span>
            </div>
          </div>
          <div className="df-group">
            <label className="df-label">Category</label>
            <select
              className="fb-select"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All 5 categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.hero}</option>
              ))}
            </select>
          </div>
          <button
            className="df-reset"
            onClick={() => { setMaxPrice(3000); setMinDiscount(15); setCatFilter(""); setSortBy("discount"); }}
            type="button"
          >
            Reset
          </button>
        </div>

        {/* Sort toggle */}
        <DealsSortToggle sortBy={sortBy} onSortChange={setSortBy} />

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[var(--border)]">
            <p className="font-serif text-xl mb-3">No deals match these filters.</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">Try lowering the minimum discount or raising the max price.</p>
            <button
              onClick={() => { setMaxPrice(3000); setMinDiscount(15); setCatFilter(""); }}
              className="cta-btn cta-btn-ghost"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="deals-grid">
            {filtered.map((p) => {
              const disc = discountPct(p);
              return (
                <button
                  key={`${p.categorySlug}-${p.rank}`}
                  className="deal-card"
                  onClick={() => openProduct(p)}
                  type="button"
                  style={{ ["--accent" as string]: p.categoryAccent, borderTopColor: p.categoryAccent }}
                >
                  <div className="deal-card-img">
                    <ProductImage product={p} category={categories.find((c) => c.slug === p.categorySlug)!} showLabel={false} className="!aspect-[4/3]" />
                    <span className="deal-discount">{disc}% off</span>
                  </div>
                  <div className="deal-card-body">
                    <div className="deal-card-cat">{p.categoryHero}</div>
                    <div className="deal-card-name">{p.name}</div>
                    <div className="deal-card-prices">
                      <span className="deal-card-price">{formatINR(p.price)}</span>
                      <span className="deal-card-mrp">{formatINR(p.mrp)}</span>
                    </div>
                    {p.bestFor && <span className="deal-card-bestfor">{p.bestFor}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   DealOfTheDayBanner — rotating daily banner for the home page
   ============================================================ */
export function DealOfTheDayBanner() {
  const { navigate } = useRouter();
  const { product: p, discount } = dealOfTheDay();
  const cat = categories.find((c) => c.slug === p.categorySlug)!;

  const open = () => {
    navigate({ name: "category", slug: p.categorySlug });
    setTimeout(() => {
      document.getElementById(`p-${p.rank}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  return (
    <section className="container-editorial py-8" aria-label="Deal of the day">
      <div
        className="dotd-banner"
        style={{ ["--accent" as string]: p.categoryAccent }}
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") open(); }}
      >
        <div className="dotd-image">
          <ProductImage product={p} category={cat} showLabel={false} className="!aspect-[16/10]" />
        </div>
        <div className="dotd-body">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="dotd-label" style={{ color: p.categoryAccent }}>Deal of the day</span>
            <span className="dotd-discount">−{discount}%</span>
          </div>
          <h3 className="dotd-name">{p.name}</h3>
          <p className="dotd-verdict">{p.verdict}</p>
          <div className="dotd-prices">
            <span className="dotd-price">{formatINR(p.price)}</span>
            <span className="dotd-mrp">{formatINR(p.mrp)}</span>
            <span className="dotd-save">Save {formatINR(p.mrp - p.price)}</span>
          </div>
          <div className="dotd-cta">View this deal →</div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   RelatedProducts — cross-category "you might also like" row
   ============================================================ */
export function RelatedProducts({ product, category }: { product: Product; category: Category }) {
  const { navigate } = useRouter();
  const related = useMemo(() => relatedProducts(category.slug, product.price, 3), [category.slug, product.price]);

  if (related.length === 0) return null;

  const open = (p: FlatProduct) => {
    navigate({ name: "category", slug: p.categorySlug });
    setTimeout(() => {
      document.getElementById(`p-${p.rank}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  return (
    <aside className="related-products" aria-label="Related products from other categories">
      <div className="rp-header">
        <span className="rp-label">If you&apos;re buying this, consider</span>
        <span className="flex-1 rule" />
      </div>
      <div className="rp-row">
        {related.map((p) => {
          const cat = categories.find((c) => c.slug === p.categorySlug)!;
          return (
            <button
              key={`${p.categorySlug}-${p.rank}`}
              className="rp-card"
              onClick={() => open(p)}
              type="button"
              style={{ ["--accent" as string]: p.categoryAccent, borderTopColor: p.categoryAccent }}
            >
              <ProductImage product={p} category={cat} showLabel={false} className="!aspect-[4/3]" />
              <div className="rp-cat">{p.categoryHero}</div>
              <div className="rp-name">{p.name}</div>
              <div className="rp-price">{formatINR(p.price)}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

/* ============================================================
   PrintButton — triggers the browser print dialog (uses print stylesheet)
   ============================================================ */
export function PrintButton() {
  return (
    <button
      type="button"
      className="print-btn"
      onClick={() => window.print()}
      aria-label="Print this guide"
      title="Print or save as PDF"
    >
      <span aria-hidden>⎙</span> Print / PDF
    </button>
  );
}

/* ============================================================
   HomeMiniMap — compact grid of all 25 products on the home page
   ============================================================ */
export function HomeMiniMap() {
  const { navigate } = useRouter();

  const open = (p: FlatProduct) => {
    navigate({ name: "category", slug: p.categorySlug });
    setTimeout(() => {
      document.getElementById(`p-${p.rank}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  return (
    <section className="container-editorial py-12 border-t border-[var(--border)]">
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-eyebrow">All 25 at a glance</span>
        <span className="flex-1 rule" />
        <span className="text-eyebrow">Click any to jump</span>
      </div>
      <h3 className="text-h2 mb-5 max-w-2xl">The full tested catalog</h3>
      <div className="minimap">
        {categories.map((c) => (
          <div key={c.slug} className="minimap-group">
            <button
              type="button"
              className="minimap-cat"
              onClick={() => navigate({ name: "category", slug: c.slug })}
              style={{ color: c.accent }}
            >
              <span className="mm-bar" style={{ background: c.accent }} />
              <span className="mm-name">{c.hero}</span>
              <span className="mm-count">{c.products.length}</span>
            </button>
            <div className="minimap-products">
              {c.products.map((p) => (
                <button
                  key={p.rank}
                  type="button"
                  className="minimap-product"
                  onClick={() => open({ ...p, categorySlug: c.slug, categoryName: c.name, categoryAccent: c.accent, categoryHero: c.hero })}
                  title={`${p.name} — ${formatINR(p.price)}`}
                  style={{ ["--accent" as string]: c.accent }}
                >
                  <span className="mp-rank">{String(p.rank).padStart(2, "0")}</span>
                  <span className="mp-name">{p.name}</span>
                  <span className="mp-price">{formatINR(p.price)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
