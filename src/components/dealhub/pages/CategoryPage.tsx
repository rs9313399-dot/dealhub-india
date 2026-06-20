"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/data/products";
import {
  Toc,
  TopPickCallout,
  ProductReview,
  ComparisonTable,
  Faq,
  OtherGuides,
} from "../Blocks";
import {
  ReadingProgress,
  BackToTop,
  FilterBar,
  CompareProvider,
  CompareDock,
  CompareModal,
  CategoryJsonLd,
  useActiveSection,
  type SortKey,
} from "../Phase2";
import {
  SideToc,
  ShareRow,
  ReadingTime,
} from "../Phase3";
import { TrustBadges } from "../Phase4";
import { CompareAll5Button } from "../Phase6";
import { CategoryAlert } from "../Phase9";

function sortProducts(products: Category["products"], sort: SortKey) {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "rank":
    default:
      return copy.sort((a, b) => a.rank - b.rank);
  }
}

/**
 * Public entry. Keyed by category slug so navigating between categories
 * remounts the inner component and resets all filter/sort state cleanly,
 * without needing a setState-in-effect.
 */
export function CategoryPage({ category }: { category: Category }) {
  return <CategoryPageImpl key={category.slug} category={category} />;
}

function CategoryPageImpl({ category }: { category: Category }) {
  const [sort, setSort] = useState<SortKey>("rank");
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState(() =>
    Math.max(...category.products.map((p) => p.price))
  );

  const filtered = useMemo(() => {
    let list = category.products.filter((p) => p.price <= maxPrice);
    if (brand) list = list.filter((p) => p.brand === brand);
    return sortProducts(list, sort);
  }, [category.products, sort, brand, maxPrice]);

  const ranks = useMemo(() => category.products.map((p) => p.rank), [category]);
  useActiveSection(ranks);

  const resetFilters = () => {
    setBrand("");
    setSort("rank");
    setMaxPrice(Math.max(...category.products.map((p) => p.price)));
  };

  return (
    <CompareProvider categorySlug={category.slug}>
      <CategoryJsonLd category={category} />
      <div
        className="category-page"
        style={{
          ["--accent" as string]: category.accent,
          ["--accent-soft" as string]: category.accentSoft,
        }}
      >
        <ReadingProgress />

        {/* Category header */}
        <section
          className="border-b-2 border-[var(--accent)]"
          style={{
            background: `linear-gradient(180deg, ${category.accentSoft} 0%, transparent 100%)`,
          }}
        >
          <div className="container-editorial py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-end">
              <div>
                <div className="flex flex-wrap items-baseline gap-3 mb-3">
                  <span className="text-eyebrow" style={{ color: category.accent }}>
                    Section guide
                  </span>
                  <span className="flex-1 rule" />
                  <span className="text-eyebrow">Last updated {category.lastUpdated}</span>
                </div>
                <h1 className="text-h1 mb-3">{category.name}</h1>
                <p className="font-serif italic text-[1.15rem] text-[var(--text-muted)] mb-5">
                  {category.tagline}
                </p>
                <div className="flex flex-wrap items-center gap-5 text-sm font-mono text-[var(--text-muted)]">
                  <span>
                    <strong className="font-semibold text-[var(--text-primary)]">{category.testedCount}</strong> products tested
                  </span>
                  <span className="text-[var(--border)]">·</span>
                  <span>
                    <strong className="font-semibold text-[var(--text-primary)]">5</strong> made the cut
                  </span>
                  <span className="text-[var(--border)]">·</span>
                  <span>
                    <strong className="font-semibold text-[var(--text-primary)]">
                      {category.products.reduce((s, p) => s + p.testWeeks, 0)}
                    </strong>{" "}
                    total test-weeks
                  </span>
                </div>
              </div>
              <div className="product-image has-img" style={{ aspectRatio: "16 / 9" }}>
                <img
                  src={`/images/categories/${category.slug === "gaming-peripherals" ? "gaming" : category.slug === "desk-setup" ? "desk" : category.slug}.png`}
                  alt={`${category.hero} — editorial product photography`}
                  className="category-hero-img"
                  loading="eager"
                />
                <span className="img-label">{category.hero} · tested in lab</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sticky filter/sort bar */}
        <FilterBar
          category={category}
          sort={sort}
          onSort={setSort}
          brand={brand}
          onBrand={setBrand}
          maxPrice={maxPrice}
          onMaxPrice={setMaxPrice}
          resultCount={category.products.length}
          visibleCount={filtered.length}
        />

        <div className="container-editorial">
          {/* Intro with drop cap + reading time + share */}
          <section className="py-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <ReadingTime category={category} />
              <span className="text-xs font-mono text-[var(--text-muted)]">·</span>
              <span className="text-xs font-mono text-[var(--text-muted)]">By DealHub India Editorial</span>
            </div>
            <p className="dropcap text-[1.08rem] leading-[1.8]">{category.intro}</p>
            <TrustBadges category={category} />
          </section>

          {/* TOC (top, horizontal) + compare-all + category alert */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Toc category={category} />
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryAlert category={category} />
              <CompareAll5Button ranks={category.products.map((p) => p.rank)} />
            </div>
          </div>

          {/* Share row */}
          <ShareRow category={category} />

          {/* Top pick callout */}
          <TopPickCallout category={category} />

          {/* 3-column layout: main content + sticky side TOC (desktop only) */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8">
            <div>
              {/* Product reviews (filtered + sorted) */}
              {filtered.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-[var(--border)]">
                  <p className="font-serif text-xl mb-3">No products match these filters.</p>
                  <button onClick={resetFilters} className="cta-btn cta-btn-ghost">
                    Reset filters
                  </button>
                </div>
              ) : (
                filtered.map((p) => <ProductReview key={p.rank} product={p} category={category} />)
              )}

              {/* Comparison */}
              <ComparisonTable category={category} />

              {/* FAQ */}
              <Faq category={category} />

              {/* Other guides */}
              <OtherGuides currentSlug={category.slug} />
            </div>

            {/* Sticky side TOC — desktop only */}
            <aside className="hidden lg:block">
              <SideToc category={category} />
            </aside>
          </div>
        </div>

        {/* Compare tray + modal */}
        <CompareDock products={category.products} category={category} />
        <CompareModal products={category.products} category={category} />
        <BackToTop />
      </div>
    </CompareProvider>
  );
}
