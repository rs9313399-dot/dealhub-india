"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { allProducts, categories, productImageSlug, discountPct, type FlatProduct } from "@/data/products";
import { useRouter, type Route } from "./Router";
import { formatINR } from "./Blocks";
import { ProductImage } from "./Phase4";

/* ============================================================
   WatchlistPage — "Your watchlist" dashboard
   Shows: active price alerts (from localStorage) + recently viewed
   + compare tray. A personal dashboard pulling from all client state.
   ============================================================ */
type WatchRecord = { productKey: string; targetPrice: number; email: string };
type RvEntry = {
  productKey: string; rank: number; name: string; brand: string;
  price: number; categorySlug: string; categoryName: string;
  categoryAccent: string; viewedAt: number;
};

export function WatchlistPage() {
  const { navigate } = useRouter();
  const [watches, setWatches] = useState<WatchRecord[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RvEntry[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        setWatches(JSON.parse(localStorage.getItem("dealhub:watches") || "[]"));
      } catch { setWatches([]); }
      try {
        setRecentlyViewed(JSON.parse(localStorage.getItem("dealhub:recently-viewed") || "[]"));
      } catch { setRecentlyViewed([]); }
    };
    load();
    window.addEventListener("dealhub:watches-change", load);
    window.addEventListener("dealhub:rv-change", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("dealhub:watches-change", load);
      window.removeEventListener("dealhub:rv-change", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const removeWatch = (productKey: string) => {
    try {
      const list = JSON.parse(localStorage.getItem("dealhub:watches") || "[]") as WatchRecord[];
      const next = list.filter((w) => w.productKey !== productKey);
      localStorage.setItem("dealhub:watches", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("dealhub:watches-change"));
    } catch { /* ignore */ }
  };

  const clearRv = () => {
    try {
      localStorage.removeItem("dealhub:recently-viewed");
      window.dispatchEvent(new CustomEvent("dealhub:rv-change"));
    } catch { /* ignore */ }
  };

  const openProduct = (slug: string, rank: number) => {
    navigate({ name: "category", slug });
    setTimeout(() => {
      document.getElementById(`p-${rank}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  // Map watch productKeys to full product data
  const watchProducts = watches
    .map((w) => {
      const [slug, rankStr] = w.productKey.split(":");
      const rank = Number(rankStr);
      const product = allProducts.find((p) => p.categorySlug === slug && p.rank === rank);
      return product ? { ...w, product } : null;
    })
    .filter((x): x is WatchRecord & { product: FlatProduct } => x !== null);

  return (
    <div style={{ ["--accent" as string]: "var(--accent-neutral)" }}>
      <section className="border-b-2 border-[var(--text-primary)]">
        <div className="container-editorial py-10">
          <div className="flex flex-wrap items-baseline gap-3 mb-3">
            <span className="text-eyebrow">Your dashboard</span>
            <span className="flex-1 rule" />
            <span className="text-eyebrow">Stored locally on this device</span>
          </div>
          <h1 className="text-h1 mb-3">Your watchlist</h1>
          <p className="font-serif italic text-[1.15rem] text-[var(--text-muted)] max-w-2xl">
            Price alerts you&apos;ve set, products you&apos;ve recently viewed, and your compare tray — all in one place. Nothing leaves your browser.
          </p>
        </div>
      </section>

      <div className="container-editorial py-8">
        {/* Price alerts section */}
        <section className="mb-12">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-eyebrow">Price alerts</span>
            <span className="flex-1 rule" />
            <span className="text-xs font-mono text-[var(--text-muted)]">{watchProducts.length} active</span>
          </div>
          {watchProducts.length === 0 ? (
            <div className="empty-state">
              <p className="font-serif text-lg mb-2">No price alerts yet.</p>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Click the <span className="font-mono">◜ Alert</span> button on any product to get notified when its price drops.
              </p>
              <button onClick={() => navigate({ name: "deals" })} className="cta-btn cta-btn-ghost">
                Browse deals →
              </button>
            </div>
          ) : (
            <div className="watchlist-grid">
              {watchProducts.map(({ product, targetPrice, email }) => {
                const cat = categories.find((c) => c.slug === product.categorySlug)!;
                const savings = product.price - targetPrice;
                return (
                  <div
                    key={product.productKey || `${product.categorySlug}:${product.rank}`}
                    className="watch-card"
                    style={{ ["--accent" as string]: product.categoryAccent, borderTopColor: product.categoryAccent }}
                  >
                    <div className="wc-img" onClick={() => openProduct(product.categorySlug, product.rank)}>
                      <ProductImage product={product} category={cat} showLabel={false} className="!aspect-[4/3]" />
                    </div>
                    <div className="wc-body">
                      <div className="wc-cat">{product.categoryHero}</div>
                      <div className="wc-name">{product.name}</div>
                      <div className="wc-prices">
                        <span className="wc-current">{formatINR(product.price)}</span>
                        <span className="wc-target">target {formatINR(targetPrice)}</span>
                      </div>
                      <div className={`wc-status ${savings <= 0 ? "wc-status-met" : ""}`}>
                        {savings <= 0
                          ? "✓ Target met — alert triggered"
                          : `₹${Math.abs(savings)} to go`}
                      </div>
                      <div className="wc-email">{email}</div>
                      <button className="wc-remove" onClick={() => removeWatch(`${product.categorySlug}:${product.rank}`)} type="button">
                        Remove alert
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recently viewed section */}
        <section className="mb-12">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-eyebrow">Recently viewed</span>
            <span className="flex-1 rule" />
            <span className="text-xs font-mono text-[var(--text-muted)]">{recentlyViewed.length} items</span>
            {recentlyViewed.length > 0 && (
              <button className="rv-clear-btn" onClick={clearRv} type="button">Clear</button>
            )}
          </div>
          {recentlyViewed.length === 0 ? (
            <div className="empty-state">
              <p className="font-serif text-lg mb-2">Nothing here yet.</p>
              <p className="text-sm text-[var(--text-muted)]">
                Products you view on category pages will show up here for quick access.
              </p>
            </div>
          ) : (
            <div className="rv-grid">
              {recentlyViewed.map((rv) => {
                const cat = categories.find((c) => c.slug === rv.categorySlug);
                if (!cat) return null;
                const product = allProducts.find((p) => p.categorySlug === rv.categorySlug && p.rank === rv.rank);
                if (!product) return null;
                return (
                  <button
                    key={rv.productKey}
                    className="rv-mini-card"
                    onClick={() => openProduct(rv.categorySlug, rv.rank)}
                    type="button"
                    style={{ ["--accent" as string]: rv.categoryAccent, borderLeftColor: rv.categoryAccent }}
                  >
                    <div className="rv-mini-cat">{rv.categoryName}</div>
                    <div className="rv-mini-name">{rv.name}</div>
                    <div className="rv-mini-price">{formatINR(rv.price)}</div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick links */}
        <section className="border-t border-[var(--border)] pt-8">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-eyebrow">Jump to</span>
            <span className="flex-1 rule" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate({ name: "home" })} className="cta-btn cta-btn-ghost">Front Page</button>
            <button onClick={() => navigate({ name: "best-of" })} className="cta-btn cta-btn-ghost">Best Of</button>
            <button onClick={() => navigate({ name: "deals" })} className="cta-btn cta-btn-ghost">Deals</button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => navigate({ name: "category", slug: c.slug })}
                className="cta-btn cta-btn-ghost"
                style={{ borderColor: c.accent, color: c.accent }}
              >
                {c.hero}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============================================================
   SearchResultsPage — dedicated search results page
   Lets users refine their search instead of jumping directly to a product
   ============================================================ */
export function SearchResultsPage({ query }: { query: string }) {
  const { navigate } = useRouter();
  const [localQuery, setLocalQuery] = useState(query);

  // Sync local input when the route query changes
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return allProducts
      .filter((p) => {
        const haystack = `${p.name} ${p.brand} ${p.categoryName} ${p.categoryHero} ${p.specs.map((s) => s.value).join(" ")}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        // Name matches first, then brand, then spec matches
        const aName = a.name.toLowerCase().includes(q) ? 0 : 1;
        const bName = b.name.toLowerCase().includes(q) ? 0 : 1;
        if (aName !== bName) return aName - bName;
        return b.rating - a.rating;
      });
  }, [query]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim().length >= 2) {
      navigate({ name: "search", query: localQuery.trim() });
    }
  };

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
            <span className="text-eyebrow">Search</span>
            <span className="flex-1 rule" />
            <span className="text-eyebrow">{results.length} result{results.length === 1 ? "" : "s"}</span>
          </div>
          <h1 className="text-h1 mb-4">
            {query ? (
              <>Results for <span className="italic font-normal">&ldquo;{query}&rdquo;</span></>
            ) : (
              <>Search 25 tested products</>
            )}
          </h1>
          <form onSubmit={submitSearch} className="search-page-form">
            <input
              type="search"
              className="search-input"
              placeholder="Search by name, brand, spec, or category…"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              aria-label="Search query"
              autoFocus
            />
            <button type="submit" className="cta-btn">Search →</button>
          </form>
        </div>
      </section>

      <div className="container-editorial py-8">
        {results.length === 0 ? (
          <div className="empty-state">
            <p className="font-serif text-xl mb-2">
              {query.trim().length < 2 ? "Type at least 2 characters to search." : `No results for "${query}".`}
            </p>
            {query.trim().length >= 2 && (
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Try a brand name (Noise, Philips, boAt), a spec (AMOLED, PMW3389, IP67), or a category (smartwatches, gaming).
              </p>
            )}
          </div>
        ) : (
          <div className="search-results-grid">
            {results.map((p) => {
              const cat = categories.find((c) => c.slug === p.categorySlug)!;
              return (
                <button
                  key={`${p.categorySlug}-${p.rank}`}
                  className="search-result-card"
                  onClick={() => openProduct(p)}
                  type="button"
                  style={{ ["--accent" as string]: p.categoryAccent, borderTopColor: p.categoryAccent }}
                >
                  <div className="src-img">
                    <ProductImage product={p} category={cat} showLabel={false} className="!aspect-[4/3]" />
                  </div>
                  <div className="src-body">
                    <div className="src-cat">{p.categoryHero} · #{String(p.rank).padStart(2, "0")}</div>
                    <div className="src-name">{p.name}</div>
                    <div className="src-verdict">{p.verdict}</div>
                    <div className="src-prices">
                      <span className="src-price">{formatINR(p.price)}</span>
                      {p.bestFor && <span className="src-bestfor">{p.bestFor}</span>}
                    </div>
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
   KeyboardShortcutsHelp — ? key shows a cheat sheet overlay
   Also handles g-prefixed navigation shortcuts (g h/b/d/w)
   ============================================================ */
export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const { navigate } = useRouter();
  const gPrefixRef = useRef(false);
  const gTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput = document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA";
      if (inInput) return;

      // ? key — toggle cheat sheet
      if (e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }

      // g-prefixed shortcuts: g h/b/d/w
      if (e.key === "g" && !gPrefixRef.current) {
        gPrefixRef.current = true;
        // Reset the prefix after 800ms if no second key
        if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current);
        gTimeoutRef.current = setTimeout(() => { gPrefixRef.current = false; }, 800);
        return;
      }
      if (gPrefixRef.current) {
        e.preventDefault();
        const k = e.key.toLowerCase();
        if (k === "h") navigate({ name: "home" });
        else if (k === "b") navigate({ name: "best-of" });
        else if (k === "d") navigate({ name: "deals" });
        else if (k === "w") navigate({ name: "watchlist" });
        gPrefixRef.current = false;
        if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current);
    };
  }, [open, navigate]);

  if (!open) return null;

  const shortcuts = [
    { keys: "/", desc: "Focus the search bar" },
    { keys: "?", desc: "Show/hide this cheat sheet" },
    { keys: "Esc", desc: "Close modals / overlays" },
    { keys: "↑ ↓", desc: "Navigate search results" },
    { keys: "Enter", desc: "Open the active search result" },
    { keys: "g h", desc: "Go home" },
    { keys: "g b", desc: "Go to Best Of" },
    { keys: "g d", desc: "Go to Deals" },
    { keys: "g w", desc: "Go to your Watchlist" },
  ];

  return (
    <div className="kbd-overlay" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="kbd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kbd-header">
          <h3>Keyboard shortcuts</h3>
          <button className="kbd-close" onClick={() => setOpen(false)} type="button" aria-label="Close">✕</button>
        </div>
        <ul className="kbd-list">
          {shortcuts.map((s) => (
            <li key={s.keys}>
              <kbd className="kbd-key">{s.keys}</kbd>
              <span className="kbd-desc">{s.desc}</span>
            </li>
          ))}
        </ul>
        <p className="kbd-footer">Press <kbd className="kbd-key">?</kbd> anytime to open this again.</p>
      </div>
    </div>
  );
}

/* ============================================================
   CompareAll5Button — one-click button on category pages
   that pre-selects all 5 products into the compare tray
   ============================================================ */
export function CompareAll5Button({ ranks }: { ranks: number[] }) {
  // This component needs access to the compare context, which is inside
  // the CategoryPage's CompareProvider. We'll use a simpler approach:
  // dispatch a custom event that the CompareProvider listens for.
  const { } = useRouter();

  const selectAll = () => {
    // Dispatch a custom event with the ranks to select
    window.dispatchEvent(new CustomEvent("dealhub:compare-all", { detail: { ranks } }));
  };

  return (
    <button type="button" className="compare-all-btn" onClick={selectAll}>
      <span aria-hidden>≡</span> Compare all 5
    </button>
  );
}
