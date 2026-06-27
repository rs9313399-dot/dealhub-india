"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Category, Product } from "@/data/products";
import { absoluteUrl, categoryImagePath } from "@/lib/site";
import { useRouter } from "./Router";
import { formatINR } from "./Blocks";

/* ============================================================
   ReadingProgress — thin accent bar at the top that fills
   as the reader scrolls through the category page.
   ============================================================ */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
      setProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="read-progress" style={{ width: `${progress}%` }} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress" />
  );
}

/* ============================================================
   BackToTop — floating button that appears after scrolling
   ============================================================ */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      className={`back-top ${visible ? "visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>
  );
}

/* ============================================================
   PriceHistory — inline SVG sparkline showing 6-month trend
   ============================================================ */
export function PriceHistory({ product, categorySlug }: { product: Product; categorySlug?: string }) {
  const history = product.priceHistory;
  const { navigate } = useRouter();
  if (!history || history.length < 2) return null;

  const W = 280;
  const H = 56;
  const pad = 4;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const stepX = (W - pad * 2) / (history.length - 1);

  const points = history.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / range) * (H - pad * 2);
    return { x, y, v };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x},${H - pad} L ${points[0].x},${H - pad} Z`;

  const first = history[0];
  const last = history[history.length - 1];
  const delta = last - first;
  const pct = (delta / first) * 100;
  const trend = Math.abs(pct) < 1 ? "flat" : pct < 0 ? "down" : "up";
  const arrow = trend === "down" ? "▼" : trend === "up" ? "▲" : "—";
  const monthLabels = ["6mo", "5mo", "4mo", "3mo", "2mo", "now"];

  return (
    <div className="price-history" aria-label={`Price history for ${product.name}`}>
      <div className="price-history-header">
        <span className="ph-label">Price history · last 6 months</span>
        <span className={`ph-trend ${trend}`}>
          {arrow} {trend === "flat" ? "stable" : `${Math.abs(pct).toFixed(1)}%`} · low {formatINR(min)}
        </span>
      </div>
      <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
        {/* mid gridline */}
        <line className="gridline" x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} />
        <path className="area" d={areaPath} />
        <path className="line" d={linePath} />
        {points.map((p, i) => (
          <circle key={i} className={i === points.length - 1 ? "dot dot-current" : "dot"} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2} />
        ))}
      </svg>
      <div className="flex justify-between mt-1 font-mono text-[0.6rem] text-[var(--text-muted)] tracking-wider">
        {monthLabels.map((m, i) => (
          <span key={m} className={i === monthLabels.length - 1 ? "text-[var(--accent)] font-semibold" : ""}>{m}</span>
        ))}
      </div>
      {categorySlug && (
        <button
          type="button"
          className="ph-full-link"
          onClick={() => navigate({ name: "product", categorySlug, rank: product.rank })}
        >
          View full chart + details →
        </button>
      )}
    </div>
  );
}

/* ============================================================
   FilterBar — sticky sort + brand + price-range filter
   ============================================================ */
export type SortKey = "rank" | "price-asc" | "price-desc" | "rating";

export function FilterBar({
  category,
  sort,
  onSort,
  brand,
  onBrand,
  maxPrice,
  onMaxPrice,
  resultCount,
  visibleCount,
}: {
  category: Category;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  brand: string;
  onBrand: (b: string) => void;
  maxPrice: number;
  onMaxPrice: (n: number) => void;
  resultCount: number;
  visibleCount: number;
}) {
  const brands = useMemo(() => Array.from(new Set(category.products.map((p) => p.brand))).sort(), [category]);
  const priceCeiling = useMemo(() => Math.max(...category.products.map((p) => p.price)), [category]);

  return (
    <div className="filterbar">
      <div className="container-editorial filterbar-inner">
        {/* Sort */}
        <div className="fb-group">
          <span className="fb-label">Sort</span>
          <div className="seg" role="group" aria-label="Sort by">
            {([
              ["rank", "Rank"],
              ["price-asc", "₹ Low"],
              ["price-desc", "₹ High"],
              ["rating", "Rating"],
            ] as [SortKey, string][]).map(([key, label]) => (
              <button
                key={key}
                aria-pressed={sort === key}
                onClick={() => onSort(key)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Brand filter */}
        <div className="fb-group">
          <span className="fb-label">Brand</span>
          <select
            className="fb-select"
            value={brand}
            onChange={(e) => onBrand(e.target.value)}
            aria-label="Filter by brand"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Price range */}
        <div className="fb-group">
          <span className="fb-label">Max ₹</span>
          <div className="range-wrap">
            <input
              type="range"
              min={Math.floor(Math.min(...category.products.map((p) => p.price)) / 50) * 50}
              max={priceCeiling}
              step={50}
              value={maxPrice}
              onChange={(e) => onMaxPrice(Number(e.target.value))}
              aria-label="Maximum price"
            />
            <span className="font-semibold text-[var(--accent)] tabular-nums">{formatINR(maxPrice)}</span>
          </div>
        </div>

        {/* Result count */}
        <div className="fb-count">
          <strong>{visibleCount}</strong> / {resultCount} shown
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CompareContext — manage the compare tray across a category
   ============================================================ */
type CompareCtx = {
  selected: number[]; // ranks
  toggle: (rank: number) => void;
  remove: (rank: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};
const CmpCtx = React.createContext<CompareCtx | null>(null);

export function CompareProvider({ children, maxItems = 3, categorySlug }: { children: React.ReactNode; maxItems?: number; categorySlug?: string }) {
  // Start with empty selection on both server and client to avoid hydration mismatch.
  // Read pre-selected products from ?compare= URL param in an effect after hydration.
  const [selected, setSelected] = useState<number[]>([]);
  const [isOpen, setOpen] = useState(false);
  const initialAutoOpenRef = React.useRef(false);

  // Read URL compare param after hydration
  useEffect(() => {
    if (!categorySlug) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("compare");
      if (raw) {
        const ranks = raw
          .split(",")
          .filter((s) => s.startsWith(`${categorySlug}:`))
          .map((s) => Number(s.split(":")[1]))
          .filter((n) => Number.isFinite(n) && n > 0)
          .slice(0, maxItems);
        if (ranks.length > 0) {
          // Syncing from URL params after hydration — valid effect use case.
          setSelected(ranks);
        }
      }
    } catch {
      /* ignore */
    }
  }, [categorySlug, maxItems]);

  // Auto-open the modal once if products were pre-selected via shared link (≥2)
  useEffect(() => {
    if (initialAutoOpenRef.current) return;
    if (selected.length >= 2 && categorySlug) {
      initialAutoOpenRef.current = true;
      const t = window.setTimeout(() => setOpen(true), 600);
      return () => window.clearTimeout(t);
    }
  }, [selected, categorySlug]);

  // Sync selections to URL whenever they change
  useEffect(() => {
    if (!categorySlug || typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      const keys = selected.map((r) => `${categorySlug}:${r}`);
      const existing = url.searchParams.get("compare") || "";
      const otherKeys = existing.split(",").filter((s) => s && !s.startsWith(`${categorySlug}:`));
      const allKeys = [...otherKeys, ...keys];
      if (allKeys.length === 0) {
        url.searchParams.delete("compare");
      } else {
        url.searchParams.set("compare", allKeys.join(","));
      }
      window.history.replaceState(null, "", url.toString());
    } catch {
      /* ignore */
    }
  }, [selected, categorySlug]);

  const toggle = useCallback((rank: number) => {
    setSelected((prev) => {
      if (prev.includes(rank)) return prev.filter((r) => r !== rank);
      if (prev.length >= maxItems) return prev;
      return [...prev, rank];
    });
  }, [maxItems]);

  const remove = useCallback((rank: number) => {
    setSelected((prev) => prev.filter((r) => r !== rank));
  }, []);

  const clear = useCallback(() => setSelected([]), []);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  // Listen for "compare all" custom event (from the CompareAll5Button)
  useEffect(() => {
    const onCompareAll = (e: Event) => {
      const detail = (e as CustomEvent).detail as { ranks: number[] };
      if (detail?.ranks) {
        setSelected(detail.ranks.slice(0, maxItems));
        // Auto-open the modal after selecting (deferred so state updates first)
        window.setTimeout(() => setOpen(true), 150);
      }
    };
    window.addEventListener("dealhub:compare-all", onCompareAll as EventListener);
    return () => window.removeEventListener("dealhub:compare-all", onCompareAll as EventListener);
  }, [maxItems]);

  // Close modal on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const value = useMemo<CompareCtx>(() => ({ selected, toggle, remove, clear, isOpen, open, close }), [selected, toggle, remove, clear, isOpen, open, close]);
  return <CmpCtx.Provider value={value}>{children}</CmpCtx.Provider>;
}

export function useCompare() {
  const ctx = React.useContext(CmpCtx);
  if (!ctx) throw new Error("useCompare must be inside CompareProvider");
  return ctx;
}

/* ============================================================
   CompareToggle — per-product "Add to compare" checkbox
   ============================================================ */
export function CompareToggle({ rank, disabled }: { rank: number; disabled?: boolean }) {
  const { selected, toggle } = useCompare();
  const checked = selected.includes(rank);
  const full = !checked && selected.length >= 3;
  return (
    <label className={`compare-toggle ${disabled || full ? "opacity-50 pointer-events-none" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => toggle(rank)}
        disabled={disabled || full}
      />
      {full ? "Compare full" : checked ? "In compare" : "Compare"}
    </label>
  );
}

/* ============================================================
   CompareDock — floating bottom bar with selected products
   ============================================================ */
export function CompareDock({ products, category }: { products: Product[]; category: Category }) {
  const { selected, remove, clear, open } = useCompare();
  const [shared, setShared] = useState(false);
  const selectedProducts = products.filter((p) => selected.includes(p.rank));

  if (selectedProducts.length === 0) return null;

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`compare-dock visible`} role="region" aria-label="Compare tray">
      <div className="compare-dock-inner">
        <span className="cd-title">Compare tray · {selectedProducts.length}/3</span>
        <div className="cd-chips">
          {selectedProducts.map((p) => (
            <span key={p.rank} className="compare-chip">
              <span className="opacity-60">#{String(p.rank).padStart(2, "0")}</span>
              {p.name.length > 28 ? p.name.slice(0, 26) + "…" : p.name}
              <button className="x" onClick={() => remove(p.rank)} aria-label={`Remove ${p.name} from compare`} type="button">✕</button>
            </span>
          ))}
        </div>
        <div className="cd-actions">
          <button className="cd-clear" onClick={clear} type="button">Clear</button>
          {selectedProducts.length >= 2 && (
            <button className="cd-share" onClick={shareLink} type="button" title="Copy a shareable compare link">
              {shared ? "Copied ✓" : "Share link"}
            </button>
          )}
          <button className="cd-open" onClick={open} disabled={selectedProducts.length < 2} type="button">
            Compare side-by-side →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CompareModal — full side-by-side comparison overlay
   ============================================================ */
export function CompareModal({ products, category }: { products: Product[]; category: Category }) {
  const { selected, isOpen, close } = useCompare();
  const selectedProducts = products.filter((p) => selected.includes(p.rank)).sort((a, b) => selected.indexOf(a.rank) - selected.indexOf(b.rank));

  if (!isOpen || selectedProducts.length === 0) return null;

  // Build a unified spec row list (union of all spec labels, in category order)
  const specLabels = category.comparisonCols.flatMap((col) => {
    const match = selectedProducts[0]?.specs.find((s) =>
      s.label.toLowerCase().includes(col.toLowerCase().split(" ")[0]) ||
      col.toLowerCase().includes(s.label.toLowerCase().split(" ")[0])
    );
    return match ? [match.label] : [];
  });
  // also add a few extra common ones
  const extraLabels = ["Weight", "Warranty"].filter((l) => selectedProducts.some((p) => p.specs.find((s) => s.label === l)));
  const allLabels = Array.from(new Set([...specLabels, ...extraLabels]));

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `140px repeat(${selectedProducts.length}, 1fr)`,
  };

  return (
    <div className="compare-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Product comparison">
      <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compare-modal-header">
          <div>
            <div className="text-eyebrow mb-1" style={{ color: category.accent }}>{category.hero} · side-by-side</div>
            <h3>Comparing {selectedProducts.length} products</h3>
          </div>
          <button className="compare-modal-close" onClick={close} type="button">Close ✕</button>
        </div>
        <div className="compare-modal-body">
          <div className="compare-grid" style={gridStyle}>
            {/* Header row */}
            <div className="cg-cell cg-label">Product</div>
            {selectedProducts.map((p) => (
              <div key={p.rank} className="cg-cell cg-head">
                <div className="cg-rank">#{String(p.rank).padStart(2, "0")}</div>
                <div className="leading-tight">{p.name}</div>
                <div className="font-mono text-xs text-[var(--text-muted)] mt-0.5">{p.brand}</div>
              </div>
            ))}

            {/* Price row */}
            <div className="cg-cell cg-label">Price</div>
            {selectedProducts.map((p) => (
              <div key={p.rank} className="cg-cell cg-price">{formatINR(p.price)}</div>
            ))}

            {/* Rating row */}
            <div className="cg-cell cg-label">Rating</div>
            {selectedProducts.map((p) => (
              <div key={p.rank} className="cg-cell font-mono">★ {p.rating.toFixed(1)}</div>
            ))}

            {/* Spec rows */}
            {allLabels.map((label) => (
              <React.Fragment key={label}>
                <div className="cg-cell cg-label">{label}</div>
                {selectedProducts.map((p) => {
                  const spec = p.specs.find((s) => s.label === label);
                  return <div key={p.rank} className="cg-cell font-mono text-sm">{spec?.value ?? "—"}</div>;
                })}
              </React.Fragment>
            ))}

            {/* Verdict row */}
            <div className="cg-cell cg-label">Verdict</div>
            {selectedProducts.map((p) => (
              <div key={p.rank} className="cg-cell text-sm font-serif leading-snug">{p.verdict}</div>
            ))}
          </div>

          <p className="mt-4 text-xs font-mono text-[var(--text-muted)]">
            Tip: press <kbd className="border border-[var(--border)] px-1">Esc</kbd> to close. You can compare 2–3 products at a time.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Newsletter — "Deal Alert" signup section
   ============================================================ */
export function Newsletter({ variant = "section" }: { variant?: "section" | "compact" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    // Simulate async submission (no backend)
    setTimeout(() => {
      setStatus("done");
      setEmail("");
    }, 700);
  };

  return (
    <section className={`newsletter ${variant === "compact" ? "py-6" : ""}`} aria-label="Deal alert newsletter">
      <div className="container-editorial newsletter-inner">
        <div>
          <div className="text-eyebrow mb-2" style={{ color: "var(--accent-power)" }}>Deal alert</div>
          <h3>Price drops in your inbox, <em>not spam.</em></h3>
          <p>
            Once a week, we send the biggest genuine price drops we&apos;ve verified across the 5 categories we cover.
            No promo emails, no &quot;deals of the day&quot; noise. Unsubscribe in one click.
          </p>
          {variant === "section" && (
            <div className="newsletter-stats">
              <span><strong>4,210</strong> subscribers</span>
              <span><strong>~3</strong> drops per week</span>
              <span><strong>0</strong> spam emails</span>
            </div>
          )}
        </div>
        <form className="newsletter-form" onSubmit={submit}>
          <input
            type="email"
            placeholder="you@example.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
            disabled={status === "loading" || status === "done"}
          />
          <button type="submit" disabled={status === "loading" || status === "done"}>
            {status === "loading" ? "Subscribing…" : status === "done" ? "Subscribed ✓" : "Subscribe →"}
          </button>
          {status === "done" && <span className="nl-success">Check your inbox for a confirmation.</span>}
        </form>
      </div>
    </section>
  );
}

/* ============================================================
   ActiveSectionTracker — highlights the TOC pill for the
   product currently in view. Returns nothing; side-effects
   via DOM class toggling on the toc-pill buttons.
   ============================================================ */
export function useActiveSection(productRanks: number[]) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const pill = document.querySelector(`.toc-pill[data-target="${id}"]`);
          if (!pill) return;
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            document.querySelectorAll(".toc-pill.is-active").forEach((el) => el.classList.remove("is-active"));
            pill.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.3, 0.6] }
    );

    productRanks.forEach((r) => {
      const el = document.getElementById(`p-${r}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [productRanks]);
}

/* ============================================================
   CategoryJsonLd — SEO structured data for a category page.
   Emits an ItemList of Products, each with Review + Offer.
   ============================================================ */
export function CategoryJsonLd({ category }: { category: Category }) {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    description: category.intro.slice(0, 200),
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: category.products.length,
    itemListElement: category.products.map((p) => ({
      "@type": "ListItem",
      position: p.rank,
      item: {
        "@type": "Product",
        name: p.name,
        brand: { "@type": "Brand", name: p.brand },
        description: p.verdict,
        image: absoluteUrl(categoryImagePath(category.slug)),
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`,
        },
        review: {
          "@type": "Review",
          reviewBody: p.pullquote,
          author: { "@type": "Person", name: "DealHub India Editorial" },
          datePublished: category.lastUpdated,
          reviewRating: {
            "@type": "Rating",
            ratingValue: p.rating,
            bestRating: 5,
            worstRating: 1,
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: p.rating,
          reviewCount: Math.max(1, Math.round(p.testWeeks * 4)),
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
    />
  );
}
