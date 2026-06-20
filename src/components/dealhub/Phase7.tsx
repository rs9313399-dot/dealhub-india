"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { categories, productImageSlug, type FlatProduct } from "@/data/products";
import type { Category, Product } from "@/data/products";
import { useRouter } from "./Router";
import { formatINR } from "./Blocks";
import { ProductImage } from "./Phase4";

/* ============================================================
   ProductDetailPage — full price history + specs + review
   A dedicated page per product with a large interactive chart
   ============================================================ */
export function ProductDetailPage({ categorySlug, rank }: { categorySlug: string; rank: number }) {
  const { navigate } = useRouter();
  const category = categories.find((c) => c.slug === categorySlug);
  const product = category?.products.find((p) => p.rank === rank);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  if (!category || !product) {
    return (
      <div className="container-editorial py-16 text-center">
        <h1 className="text-h2 mb-3">Product not found</h1>
        <button onClick={() => navigate({ name: "home" })} className="cta-btn">Go home →</button>
      </div>
    );
  }
  const history = product.priceHistory || [];
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const first = history[0] || product.price;
  const last = history[history.length - 1] || product.price;
  const pctChange = first ? ((last - first) / first) * 100 : 0;

  // Large chart dimensions
  const W = 700;
  const H = 240;
  const pad = { top: 20, right: 30, bottom: 30, left: 50 };
  const stepX = (W - pad.left - pad.right) / Math.max(1, history.length - 1);

  const points = history.map((v, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + (1 - (v - min) / range) * (H - pad.top - pad.bottom);
    return { x, y, v, i };
  });

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x},${H - pad.bottom} L ${points[0]?.x},${H - pad.bottom} Z`;

  // Y-axis ticks
  const yTicks = [min, Math.round((min + max) / 2), max];

  const monthLabels = ["6 mo ago", "5 mo", "4 mo", "3 mo", "2 mo", "1 mo", "now"];

  return (
    <div
      className="category-page"
      style={{ ["--accent" as string]: category.accent, ["--accent-soft" as string]: category.accentSoft }}
    >
      {/* Breadcrumb + header */}
      <section className="border-b-2 border-[var(--accent)]" style={{ background: `linear-gradient(180deg, ${category.accentSoft} 0%, transparent 100%)` }}>
        <div className="container-editorial py-8">
          <div className="flex items-baseline gap-3 mb-3 text-sm">
            <button onClick={() => navigate({ name: "category", slug: category.slug })} className="text-[var(--accent)] hover:underline font-mono text-xs uppercase tracking-wider">
              ← {category.hero}
            </button>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="font-mono text-xs text-[var(--text-muted)]">#{String(product.rank).padStart(2, "0")}</span>
          </div>
          <h1 className="text-h1 mb-2">{product.name}</h1>
          <div className="flex flex-wrap items-baseline gap-4">
            <span className="font-mono text-3xl font-bold">{formatINR(product.price)}</span>
            <span className="font-mono text-sm text-[var(--text-muted)] line-through">{formatINR(product.mrp)}</span>
            <span className="tag tag-accent" style={{ background: "var(--accent)", borderColor: "var(--accent)" }}>
              {Math.round((1 - product.price / product.mrp) * 100)}% off
            </span>
            {product.bestFor && (
              <span className="best-for-tag" style={{ ["--accent" as string]: category.accent }}>
                <span className="bft-icon">◆</span>{product.bestFor}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="container-editorial py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main: chart + review */}
          <div>
            {/* Large price history chart */}
            <section className="mb-8">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-eyebrow">Price history · last 6 months</span>
                <span className="flex-1 rule" />
                <span className={`font-mono text-sm font-semibold ${pctChange < 0 ? "text-[var(--accent-desk,#4a6741)]" : "text-[var(--accent-gaming,#8b2635)]"}`}>
                  {pctChange < 0 ? "▼" : "▲"} {Math.abs(pctChange).toFixed(1)}%
                </span>
              </div>
              <div className="price-chart-wrap">
                <svg
                  className="price-chart"
                  viewBox={`0 0 ${W} ${H}`}
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                  aria-label="Price history chart"
                  style={{ width: "100%", height: "auto" }}
                >
                  {/* Y-axis gridlines + labels */}
                  {yTicks.map((t, i) => {
                    const y = pad.top + (1 - (t - min) / range) * (H - pad.top - pad.bottom);
                    return (
                      <g key={i}>
                        <line className="gridline" x1={pad.left} y1={y} x2={W - pad.right} y2={y} />
                        <text x={pad.left - 8} y={y + 4} textAnchor="end" className="axis-label" fill="var(--text-muted)">
                          {formatINR(t)}
                        </text>
                      </g>
                    );
                  })}
                  {/* X-axis labels */}
                  {history.map((_, i) => (
                    <text key={i} x={pad.left + i * stepX} y={H - 8} textAnchor="middle" className="axis-label" fill="var(--text-muted)">
                      {monthLabels[i] || ""}
                    </text>
                  ))}
                  {/* Area + line */}
                  <path className="area" d={areaPath} />
                  <path className="line" d={linePath} />
                  {/* Hover + touch targets + dots */}
                  {points.map((p) => (
                    <g key={p.i}>
                      <circle
                        className={hoveredPoint === p.i ? "dot dot-active" : "dot"}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPoint === p.i ? 6 : 3.5}
                      />
                      <rect
                        x={p.x - stepX / 2}
                        y={pad.top}
                        width={stepX}
                        height={H - pad.top - pad.bottom}
                        fill="transparent"
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoveredPoint(p.i)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => setHoveredPoint((prev) => (prev === p.i ? null : p.i))}
                        onTouchStart={() => setHoveredPoint(p.i)}
                      />
                    </g>
                  ))}
                  {/* Hover tooltip */}
                  {hoveredPoint !== null && points[hoveredPoint] && (
                    <g>
                      <rect
                        x={Math.min(Math.max(points[hoveredPoint].x - 45, pad.left), W - pad.right - 90)}
                        y={points[hoveredPoint].y - 38}
                        width={90}
                        height={26}
                        className="tooltip-bg"
                      />
                      <text
                        x={Math.min(Math.max(points[hoveredPoint].x, pad.left + 45), W - pad.right - 45)}
                        y={points[hoveredPoint].y - 21}
                        textAnchor="middle"
                        className="tooltip-text"
                      >
                        {formatINR(points[hoveredPoint].v)}
                      </text>
                    </g>
                  )}
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="chart-stat">
                  <div className="cs-label">Lowest</div>
                  <div className="cs-value">{formatINR(min)}</div>
                </div>
                <div className="chart-stat">
                  <div className="cs-label">Average</div>
                  <div className="cs-value">{formatINR(Math.round(history.reduce((s, v) => s + v, 0) / history.length))}</div>
                </div>
                <div className="chart-stat">
                  <div className="cs-label">Current</div>
                  <div className="cs-value" style={{ color: "var(--accent)" }}>{formatINR(product.price)}</div>
                </div>
              </div>
            </section>

            {/* Review text */}
            <section className="mb-8">
              <div className="text-eyebrow mb-3">The review</div>
              <div className="space-y-4 text-[1.05rem] leading-[1.75] max-w-2xl">
                <p className="dropcap">{product.review[0]}</p>
                <p>{product.review[1]}</p>
              </div>
              <blockquote className="pullquote my-6 max-w-2xl">
                &ldquo;{product.pullquote}&rdquo;
              </blockquote>
            </section>

            {/* Pros/Cons */}
            <section className="mb-8">
              <div className="proscons">
                <div className="pros">
                  <h4>The good</h4>
                  <ul>{product.pros.map((p) => <li key={p}>{p}</li>)}</ul>
                </div>
                <div className="cons">
                  <h4>The trade-offs</h4>
                  <ul>{product.cons.map((c) => <li key={c}>{c}</li>)}</ul>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar: specs + CTA */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="product-image has-img mb-4" style={{ aspectRatio: product.aspect, ["--accent" as string]: category.accent }}>
              <img
                src={productImageSlug(category.slug, product.rank)}
                alt={`${product.name} — editorial product photography`}
                className="category-hero-img"
              />
              <span className="img-label">{product.brand}</span>
            </div>
            <h3 className="text-h3 mb-3">Specs</h3>
            <dl className="spec-strip mb-5" style={{ gridTemplateColumns: "1fr" }}>
              {product.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-3">
              <a href={`https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer sponsored" className="cta-btn text-center">
                Check on Amazon →
              </a>
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer sponsored" className="cta-btn cta-btn-ghost text-center">
                Check on Flipkart →
              </a>
              <button
                onClick={() => navigate({ name: "category", slug: category.slug })}
                className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] mt-2"
              >
                ← Back to {category.hero} guide
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SubmitProductForm — "Submit a product for review" form
   POSTs to /api/submit-product
   ============================================================ */
export function SubmitProductForm() {
  const [form, setForm] = useState({
    productName: "",
    brand: "",
    category: "",
    price: "",
    url: "",
    submitterEmail: "",
    submitterName: "",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/submit-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          url: form.url || undefined,
          submitterName: form.submitterName || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("done");
        setForm({ productName: "", brand: "", category: "", price: "", url: "", submitterEmail: "", submitterName: "", notes: "" });
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Submission failed");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error");
    }
  };

  if (status === "done") {
    return (
      <div className="submit-success">
        <div className="ss-icon">✓</div>
        <h4>Thanks for the suggestion!</h4>
        <p>We&apos;ll review the product and, if it fits our testing criteria, add it to the relevant category guide. We read every submission.</p>
        <button className="cta-btn cta-btn-ghost" onClick={() => setStatus("idle")} type="button">Submit another →</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="submit-form">
      <div className="sf-grid">
        <label className="sf-field">
          <span className="sf-label">Product name *</span>
          <input className="sf-input" type="text" required value={form.productName} onChange={set("productName")} placeholder="e.g. Noise ColorFit Pro 5" />
        </label>
        <label className="sf-field">
          <span className="sf-label">Brand *</span>
          <input className="sf-input" type="text" required value={form.brand} onChange={set("brand")} placeholder="e.g. Noise" />
        </label>
        <label className="sf-field">
          <span className="sf-label">Category *</span>
          <select className="sf-input sf-select" required value={form.category} onChange={set("category")}>
            <option value="">Select…</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.hero}</option>)}
          </select>
        </label>
        <label className="sf-field">
          <span className="sf-label">Approx. price (₹) *</span>
          <input className="sf-input" type="number" required min={1} max={100000} value={form.price} onChange={set("price")} placeholder="e.g. 1799" />
        </label>
        <label className="sf-field sf-wide">
          <span className="sf-label">Product link (optional)</span>
          <input className="sf-input" type="url" value={form.url} onChange={set("url")} placeholder="https://amazon.in/…" />
        </label>
        <label className="sf-field">
          <span className="sf-label">Your email *</span>
          <input className="sf-input" type="email" required value={form.submitterEmail} onChange={set("submitterEmail")} placeholder="you@example.in" />
        </label>
        <label className="sf-field">
          <span className="sf-label">Your name (optional)</span>
          <input className="sf-input" type="text" value={form.submitterName} onChange={set("submitterName")} placeholder="So we can credit you" />
        </label>
        <label className="sf-field sf-wide">
          <span className="sf-label">Why should we test this? (optional)</span>
          <textarea className="sf-input sf-textarea" rows={3} value={form.notes} onChange={set("notes")} placeholder="What makes this product interesting? Any specific claims you want verified?" />
        </label>
      </div>
      {status === "error" && <div className="sf-error">{errorMsg}</div>}
      <button type="submit" className="cta-btn sf-submit" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Submit for review →"}
      </button>
      <p className="sf-note">We read every submission. If we test your suggestion, we&apos;ll email you when the review goes live.</p>
    </form>
  );
}

/* ============================================================
   ReaderVotes — upvote/downvote per product (localStorage)
   Shows community sentiment without requiring accounts
   ============================================================ */
const VOTES_KEY = "dealhub:votes";

type VoteRecord = { [productKey: string]: "up" | "down" };

function readVotes(): VoteRecord {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(VOTES_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeVotes(v: VoteRecord) {
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(v));
    window.dispatchEvent(new CustomEvent("dealhub:votes-change"));
  } catch { /* ignore */ }
}

// Seeded base vote counts (so the UI isn't empty on first visit)
function baseVotes(productKey: string): { up: number; down: number } {
  let h = 0;
  for (let i = 0; i < productKey.length; i++) { h = (h * 31 + productKey.charCodeAt(i)) | 0; }
  const total = 40 + (Math.abs(h) % 180);
  const upPct = 0.55 + (Math.abs(h >> 8) % 40) / 100;
  return { up: Math.round(total * upPct), down: Math.round(total * (1 - upPct)) };
}

export function ReaderVotes({ productKey, category }: { productKey: string; category: Category }) {
  // Start with empty votes on both server and client to avoid hydration mismatch.
  // Read from localStorage in an effect after hydration.
  const [votes, setVotes] = useState<VoteRecord>({});
  const [counts, setCounts] = useState(() => baseVotes(productKey));

  useEffect(() => {
    // Syncing from external storage (localStorage) after hydration — valid effect use case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVotes(readVotes());
  }, []);

  const myVote = votes[productKey];

  const vote = (dir: "up" | "down") => {
    const current = readVotes();
    const prev = current[productKey];
    // Adjust counts: remove previous vote, add new
    setCounts((c) => {
      let up = c.up;
      let down = c.down;
      if (prev === "up") up--;
      if (prev === "down") down--;
      if (prev !== dir) {
        if (dir === "up") up++;
        else down++;
      }
      return { up, down };
    });
    const next = { ...current };
    if (prev === dir) {
      delete next[productKey]; // toggle off
    } else {
      next[productKey] = dir;
    }
    writeVotes(next);
    setVotes(next);
  };

  const total = counts.up + counts.down;
  const upPct = total > 0 ? Math.round((counts.up / total) * 100) : 0;

  return (
    <div className="reader-votes" style={{ ["--accent" as string]: category.accent }}>
      <div className="rv-label">Reader votes</div>
      <div className="rv-bar-wrap">
        <div className="rv-bar">
          <div className="rv-bar-up" style={{ width: `${upPct}%`, background: "var(--accent-desk, #4a6741)" }} />
          <div className="rv-bar-down" style={{ width: `${100 - upPct}%`, background: "var(--accent-gaming, #8b2635)" }} />
        </div>
        <div className="rv-pct">{upPct}% recommend</div>
      </div>
      <div className="rv-buttons">
        <button
          type="button"
          className={`rv-btn rv-up ${myVote === "up" ? "is-active" : ""}`}
          onClick={() => vote("up")}
          aria-pressed={myVote === "up"}
        >
          ▲ Helpful ({counts.up})
        </button>
        <button
          type="button"
          className={`rv-btn rv-down ${myVote === "down" ? "is-active" : ""}`}
          onClick={() => vote("down")}
          aria-pressed={myVote === "down"}
        >
          ▼ Not for me ({counts.down})
        </button>
      </div>
      {myVote && <div className="rv-thanks">Thanks for voting!</div>}
    </div>
  );
}

/* ============================================================
   HomeProgressBar — reading progress on the home page
   (a slimmer version of the category ReadingProgress)
   ============================================================ */
export function HomeProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const st = doc.scrollTop || document.body.scrollTop;
      const sh = doc.scrollHeight - doc.clientHeight;
      setProgress(sh > 0 ? Math.min(100, Math.max(0, (st / sh) * 100)) : 0);
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
    <div className="read-progress" style={{ width: `${progress}%`, background: "var(--text-primary)" }} aria-hidden="true" />
  );
}

/* ============================================================
   HomeBackToTop — floating back-to-top on the home page
   ============================================================ */
export function HomeBackToTop() {
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
      type="button"
    >
      ↑
    </button>
  );
}
