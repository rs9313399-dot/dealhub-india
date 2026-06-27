"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { categories, bestOfPicks, productImageSlug } from "@/data/products";
import type { Category, Product } from "@/data/products";
import { useRouter } from "./Router";
import { formatINR } from "./Blocks";

/* ============================================================
   DarkMode — warm-dark variant with localStorage persistence
   ============================================================ */
type Theme = "light" | "dark";
type ThemeCtx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };
const TCtx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with "light" on both server and client to avoid hydration mismatch.
  // Read from localStorage in an effect AFTER hydration, then update.
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dealhub:theme");
      if (saved === "dark" || saved === "light") {
        // Syncing from external storage (localStorage) is a valid effect use case.
        // This runs AFTER hydration, preventing server/client mismatch.
        setThemeState(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("dealhub:theme", t);
      document.documentElement.setAttribute("data-theme", t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return <TCtx.Provider value={{ theme, toggle, setTheme }}>{children}</TCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(TCtx);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  // suppressHydrationWarning because theme is read from localStorage in an effect,
  // so the initial server render (light) may differ from a returning user's saved theme.
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      suppressHydrationWarning
    >
      <span className="tt-icon" aria-hidden suppressHydrationWarning>{theme === "light" ? "◐" : "◑"}</span>
      <span className="tt-label" suppressHydrationWarning>{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );
}

/* ============================================================
   BestFor tag — small "best for X" badge on product cards
   ============================================================ */
export function BestForTag({ product }: { product: Product }) {
  if (!product.bestFor) return null;
  return (
    <span className="best-for-tag" title={product.bestFor}>
      <span className="bft-icon" aria-hidden>◆</span>
      {product.bestFor}
    </span>
  );
}

/* ============================================================
   TrustBadges — "why trust us" row on category pages
   ============================================================ */
export function TrustBadges({ category }: { category: Category }) {
  const totalTestWeeks = category.products.reduce((s, p) => s + p.testWeeks, 0);
  const items = [
    { num: String(category.testedCount), label: "products tested" },
    { num: String(totalTestWeeks), label: "test-weeks logged" },
    { num: "4", label: "editors involved" },
    { num: "0", label: "paid placements" },
  ];
  return (
    <div className="trust-badges" aria-label="Why you can trust this guide">
      <div className="tb-label">Why trust this guide</div>
      <div className="tb-row">
        {items.map((it) => (
          <div key={it.label} className="tb-item">
            <span className="tb-num">{it.num}</span>
            <span className="tb-text">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ProductImage — renders real photo if available, else gradient fallback
   ============================================================ */
export function ProductImage({
  product,
  category,
  className = "",
  showLabel = true,
}: {
  product: Product;
  category: Category;
  className?: string;
  showLabel?: boolean;
}) {
  const src = productImageSlug(category.slug, product.rank);
  // Key the inner impl by src so it remounts (resetting imgOk state) when the product changes,
  // without needing a setState-in-effect.
  return (
    <ProductImageImpl
      key={src}
      src={src}
      product={product}
      category={category}
      className={className}
      showLabel={showLabel}
    />
  );
}

function ProductImageImpl({
  src,
  product,
  category,
  className = "",
  showLabel = true,
}: {
  src: string;
  product: Product;
  category: Category;
  className?: string;
  showLabel?: boolean;
}) {
  const [imgOk, setImgOk] = useState<boolean | null>(null);

  // Fallback: if the image hasn't loaded or errored within 10s, show the gradient placeholder.
  // Uses a longer timeout because lazy-loaded images may not start loading until they scroll into view.
  useEffect(() => {
    const t = setTimeout(() => {
      setImgOk((prev) => (prev === null ? false : prev));
    }, 10000);
    return () => clearTimeout(t);
  }, [src]);

  return (
    <div
      className={`product-image ${imgOk === true ? "has-img" : ""} ${className}`}
      style={{ aspectRatio: product.aspect, ["--accent" as string]: category.accent }}
      aria-label={`Product image: ${product.name}`}
    >
      {imgOk !== true && (
        <div className="img-skeleton absolute inset-0" />
      )}
      {imgOk !== false && (
        <img
          src={src}
          alt={`${product.name} — editorial product photography`}
          className="category-hero-img"
          onLoad={() => setImgOk(true)}
          onError={() => setImgOk(false)}
          style={{ display: imgOk === null ? "none" : "block" }}
        />
      )}
      {imgOk === false && (
        <span className="font-serif text-sm tracking-tight opacity-80 px-4 text-center">
          {product.imageLabel}
        </span>
      )}
      {showLabel && imgOk === true && (
        <span className="img-label">{product.brand} · {product.name.split(" ").slice(0, 2).join(" ")}</span>
      )}
    </div>
  );
}

/* ============================================================
   CompareUrlState — sync compare selections to URL query param
   so compare links can be shared. Reads ?compare=slug:rank,slug:rank
   ============================================================ */
export function getCompareFromUrl(): string[] {
  if (typeof window === "undefined") return [];
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("compare");
  if (!raw) return [];
  return raw.split(",").filter((s) => /^[a-z0-9-]+:\d+$/.test(s));
}

export function setCompareInUrl(keys: string[]) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (keys.length === 0) {
    url.searchParams.delete("compare");
  } else {
    url.searchParams.set("compare", keys.join(","));
  }
  window.history.replaceState(null, "", url.toString());
}

/* ============================================================
   BestOfPage — "Best of DealHub" landing page aggregating #1 picks
   ============================================================ */
export function BestOfPage() {
  const { navigate } = useRouter();

  return (
    <div style={{ ["--accent" as string]: "var(--accent-neutral)" }}>
      <section className="border-b-2 border-[var(--text-primary)]">
        <div className="container-editorial py-10">
          <div className="flex flex-wrap items-baseline gap-3 mb-3">
            <span className="text-eyebrow">Editor&apos;s choice</span>
            <span className="flex-1 rule" />
            <span className="text-eyebrow">Updated weekly</span>
          </div>
          <h1 className="text-h1 mb-3 max-w-3xl">
            The one pick from each category <span className="italic font-normal">we&apos;d actually buy.</span>
          </h1>
          <p className="font-serif italic text-[1.15rem] text-[var(--text-muted)] max-w-2xl">
            Five categories, twenty-five tested products, five survivors. These are the #1 picks that survived multi-week testing and still cost under ₹3,000.
          </p>
        </div>
      </section>

      <div className="container-editorial py-10">
        {/* Picks grid — alternating layout */}
        <div className="space-y-10">
          {bestOfPicks.map(({ category, product }, i) => {
            const isReversed = i % 2 === 1;
            return (
              <article
                key={category.slug}
                className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center pb-10 border-b border-[var(--border)]"
                style={{ ["--accent" as string]: category.accent }}
              >
                <div className={isReversed ? "lg:order-2" : ""}>
                  <ProductImage product={product} category={category} className="!aspect-[4/3]" />
                </div>
                <div className={isReversed ? "lg:order-1" : ""}>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="kicker" style={{ color: category.accent, ["--accent" as string]: category.accent }}>
                      {category.hero}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">Pick #{String(i + 1).padStart(2, "0")} of 05</span>
                  </div>
                  <h2 className="text-h2 mb-2">{product.name}</h2>
                  <div className="flex flex-wrap items-baseline gap-3 mb-3">
                    <span className="font-mono text-2xl font-semibold">{formatINR(product.price)}</span>
                    <span className="font-mono text-sm text-[var(--text-muted)] line-through">{formatINR(product.mrp)}</span>
                    <BestForTag product={product} />
                  </div>
                  <p className="text-[1rem] leading-relaxed text-[var(--text-muted)] mb-4">{product.verdict}</p>
                  <blockquote className="pullquote text-base mb-4">
                    &ldquo;{product.pullquote}&rdquo;
                  </blockquote>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate({ name: "category", slug: category.slug })}
                      className="cta-btn"
                      style={{ background: category.accent }}
                    >
                      Read full {category.hero} guide →
                    </button>
                    <a
                      href={`https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="cta-btn cta-btn-ghost"
                      style={{ borderColor: category.accent, color: category.accent }}
                    >
                      Check on Amazon →
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-12 mt-4">
          <div className="text-eyebrow mb-3">Want the full picture?</div>
          <p className="font-serif text-xl mb-5 max-w-xl mx-auto">
            Each category has 5 ranked picks with spec tables, pros/cons, and comparison charts.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => navigate({ name: "category", slug: c.slug })}
                className="cta-btn cta-btn-ghost"
                style={{ borderColor: c.accent, color: c.accent }}
              >
                {c.hero} →
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
