"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Category, Product } from "@/data/products";
import { categories } from "@/data/products";
import { useRouter, type Route } from "./Router";
import { formatINR } from "./Blocks";

/* ============================================================
   SearchIndex — built once from all categories/products
   ============================================================ */
type SearchEntry = {
  productKey: string; // `${slug}:${rank}`
  rank: number;
  name: string;
  brand: string;
  price: number;
  categorySlug: string;
  categoryName: string;
  categoryAccent: string;
  haystack: string; // lowercased searchable text
};

function buildIndex(): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const c of categories) {
    for (const p of c.products) {
      out.push({
        productKey: `${c.slug}:${p.rank}`,
        rank: p.rank,
        name: p.name,
        brand: p.brand,
        price: p.price,
        categorySlug: c.slug,
        categoryName: c.hero,
        categoryAccent: c.accent,
        haystack: `${p.name} ${p.brand} ${c.hero} ${c.name} ${p.specs.map((s) => s.value).join(" ")}`.toLowerCase(),
      });
    }
  }
  return out;
}

const INDEX = buildIndex();

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const q = query.trim().toLowerCase();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

/* ============================================================
   GlobalSearch — search bar with live results dropdown
   ============================================================ */
export function GlobalSearch() {
  const { navigate } = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return INDEX.filter((e) => e.haystack.includes(q)).slice(0, 8);
  }, [query]);

  // Keyboard shortcut: "/" focuses the search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Click outside to close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (entry: SearchEntry) => {
    navigate({ name: "category", slug: entry.categorySlug });
    setOpen(false);
    setQuery("");
    // Defer scroll-to-product until after route change
    setTimeout(() => {
      const el = document.getElementById(`p-${entry.rank}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIdx]) go(results[activeIdx]);
    }
  };

  return (
    <div className="search-wrap" ref={wrapRef}>
      <span className="search-icon" aria-hidden>⌕</span>
      <input
        ref={inputRef}
        type="search"
        className="search-input"
        placeholder="Search 25 tested products…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIdx(0);
        }}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onKeyDown={onKeyDown}
        aria-label="Search products"
        aria-autocomplete="list"
        aria-controls="search-results-listbox"
      />
      <span className="search-kbd" aria-hidden>/</span>

      {open && query.trim().length >= 2 && (
        <div className="search-results" role="listbox" id="search-results-listbox">
          {results.length === 0 ? (
            <div className="sr-empty">
              No matches for &ldquo;{query}&rdquo;. Try a brand (Noise, Philips), a spec (PMW3389, AMOLED), or a category.
            </div>
          ) : (
            <>
              <div className="sr-header">{results.length} result{results.length === 1 ? "" : "s"} · ↑↓ navigate · ↵ open</div>
              {results.map((r, i) => (
                <button
                  key={r.productKey}
                  type="button"
                  className={`search-result ${i === activeIdx ? "is-active" : ""}`}
                  onClick={() => go(r)}
                  onMouseEnter={() => setActiveIdx(i)}
                  role="option"
                  aria-selected={i === activeIdx}
                  style={{ ["--accent" as string]: r.categoryAccent }}
                >
                  <span className="sr-rank">#{String(r.rank).padStart(2, "0")}</span>
                  <span>
                    <span className="sr-name">{highlight(r.name, query)}</span>
                    <span className="sr-cat">{r.categoryName} · {r.brand}</span>
                  </span>
                  <span className="sr-price">{formatINR(r.price)}</span>
                </button>
              ))}
              <button
                type="button"
                className="search-result search-view-all"
                onClick={() => {
                  navigate({ name: "search", query: query.trim() });
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span className="sr-rank">→</span>
                <span>
                  <span className="sr-name">View all results for &ldquo;{query}&rdquo; on the search page</span>
                  <span className="sr-cat">Refine + filter</span>
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   RecentlyViewed — localStorage-based recently viewed products
   ============================================================ */
type RvEntry = {
  productKey: string;
  rank: number;
  name: string;
  brand: string;
  price: number;
  categorySlug: string;
  categoryName: string;
  categoryAccent: string;
  viewedAt: number;
};

const RV_KEY = "dealhub:recently-viewed";
const RV_MAX = 8;

export function pushRecentlyViewed(product: Product, category: Category) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RV_KEY);
    const list: RvEntry[] = raw ? JSON.parse(raw) : [];
    const entry: RvEntry = {
      productKey: `${category.slug}:${product.rank}`,
      rank: product.rank,
      name: product.name,
      brand: product.brand,
      price: product.price,
      categorySlug: category.slug,
      categoryName: category.hero,
      categoryAccent: category.accent,
      viewedAt: Date.now(),
    };
    const filtered = list.filter((e) => e.productKey !== entry.productKey);
    filtered.unshift(entry);
    localStorage.setItem(RV_KEY, JSON.stringify(filtered.slice(0, RV_MAX)));
    // Dispatch an event so the home page can refresh without a reload
    window.dispatchEvent(new CustomEvent("dealhub:rv-change"));
  } catch {
    /* ignore quota / parse errors */
  }
}

export function RecentlyViewed() {
  const { navigate } = useRouter();
  const [items, setItems] = useState<RvEntry[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(RV_KEY);
        setItems(raw ? JSON.parse(raw) : []);
      } catch {
        setItems([]);
      }
    };
    load();
    window.addEventListener("dealhub:rv-change", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("dealhub:rv-change", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const clear = () => {
    try {
      localStorage.removeItem(RV_KEY);
      setItems([]);
      window.dispatchEvent(new CustomEvent("dealhub:rv-change"));
    } catch {
      /* ignore */
    }
  };

  if (items.length === 0) return null;

  const go = (e: RvEntry) => {
    navigate({ name: "category", slug: e.categorySlug });
    setTimeout(() => {
      document.getElementById(`p-${e.rank}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  return (
    <section className="recently-viewed" aria-label="Recently viewed products">
      <div className="container-editorial recently-viewed-inner">
        <div className="rv-header">
          <span className="rv-label">Your recently viewed</span>
          <span className="text-xs font-mono text-[var(--text-muted)]">{items.length} of last {RV_MAX}</span>
          <button className="rv-clear" onClick={clear} type="button">Clear</button>
        </div>
        <div className="rv-row">
          {items.map((e) => (
            <button
              key={e.productKey}
              className="rv-card"
              onClick={() => go(e)}
              type="button"
              style={{ ["--accent" as string]: e.categoryAccent }}
            >
              <span className="rv-cat">{e.categoryName}</span>
              <span className="rv-name">{e.name}</span>
              <span className="rv-price">{formatINR(e.price)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PriceAlertBell — per-product price-drop alert
   Uses localStorage for "watching" state, posts to /api/price-alerts
   ============================================================ */
type WatchRecord = { productKey: string; targetPrice: number; email: string };

function watchKey() {
  return "dealhub:watches";
}

function readWatches(): WatchRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(watchKey()) || "[]");
  } catch {
    return [];
  }
}

function writeWatches(list: WatchRecord[]) {
  try {
    localStorage.setItem(watchKey(), JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("dealhub:watches-change"));
  } catch {
    /* ignore */
  }
}

export function PriceAlertBell({ product, category }: { product: Product; category: Category }) {
  const productKey = `${category.slug}:${product.rank}`;
  const [open, setOpen] = useState(false);
  const [watches, setWatches] = useState<WatchRecord[]>([]);
  const [email, setEmail] = useState("");
  const [target, setTarget] = useState<number>(Math.round(product.price * 0.85));
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => setWatches(readWatches());
    load();
    window.addEventListener("dealhub:watches-change", load);
    return () => window.removeEventListener("dealhub:watches-change", load);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const watching = watches.find((w) => w.productKey === productKey);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ ok: false, msg: "Enter a valid email" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productKey, targetPrice: target }),
      });
      const data = await res.json();
      if (data.ok) {
        const list = readWatches().filter((w) => w.productKey !== productKey);
        list.push({ productKey, targetPrice: target, email });
        writeWatches(list);
        setStatus({ ok: true, msg: `Alert set — we'll email when price drops to ${formatINR(target)}` });
      } else {
        setStatus({ ok: false, msg: data.error || "Could not set alert" });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  const remove = () => {
    const list = readWatches().filter((w) => w.productKey !== productKey);
    writeWatches(list);
    setStatus(null);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className={`alert-bell ${watching ? "is-watching" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={watching ? `Manage price alert for ${product.name}` : `Set price alert for ${product.name}`}
      >
        <span className="bell-icon" aria-hidden>{watching ? "🔔" : "◜"}</span>
        {watching ? "Watching" : "Alert"}
        {watches.length > 0 && <span className="watch-count">{watches.length}</span>}
      </button>
      {open && (
        <div className="alert-popover" role="dialog" aria-label={`Price alert for ${product.name}`}>
          {watching ? (
            <>
              <h5>Price alert active</h5>
              <p>You&apos;ll get an email at <strong style={{ color: "var(--text-primary)" }}>{watching.email}</strong> when {product.name} drops to <strong style={{ color: "var(--accent)" }}>{formatINR(watching.targetPrice)}</strong> or below.</p>
              <button type="button" className="ap-remove" onClick={remove}>Remove alert</button>
            </>
          ) : (
            <>
              <h5>Set a price alert</h5>
              <p>We&apos;ll email you the moment {product.name} drops to your target. No spam, one email per drop.</p>
              <form onSubmit={submit}>
                <label htmlFor={`ap-email-${productKey}`}>Email</label>
                <input
                  id={`ap-email-${productKey}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.in"
                  required
                />
                <label htmlFor={`ap-target-${productKey}`}>Target price (₹) — currently {formatINR(product.price)}</label>
                <input
                  id={`ap-target-${productKey}`}
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  min={1}
                  max={product.price}
                  step={10}
                  required
                />
                <button type="submit" disabled={submitting}>
                  {submitting ? "Setting…" : `Alert me at ${formatINR(target)}`}
                </button>
              </form>
              {status && <div className={`ap-status ${status.ok ? "" : "err"}`}>{status.msg}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ShareRow — share-this-guide social buttons + copy link
   ============================================================ */
export function ShareRow({ category }: { category: Category }) {
  const [copied, setCopied] = useState(false);
  const text = `${category.name} — tested and ranked on DealHub India`;

  const share = async (kind: "whatsapp" | "twitter" | "email" | "copy") => {
    const fullUrl = typeof window !== "undefined" ? window.location.href : `https://dealhub.in/#${category.slug}`;
    if (kind === "copy") {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* ignore */
      }
      return;
    }
    const u = encodeURIComponent(fullUrl);
    const t = encodeURIComponent(text);
    const targets = {
      whatsapp: `https://wa.me/?text=${t}%20${u}`,
      twitter: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      email: `mailto:?subject=${t}&body=Thought you might find this useful:%0A%0A${u}`,
    };
    window.open(targets[kind], "_blank", "noopener,noreferrer");
  };

  return (
    <div className="share-row" aria-label="Share this guide">
      <span className="sr-label">Share</span>
      <button className="share-btn" onClick={() => share("whatsapp")} aria-label="Share on WhatsApp" type="button" title="WhatsApp">
        <span className="share-icon">W</span>
      </button>
      <button className="share-btn" onClick={() => share("twitter")} aria-label="Share on Twitter / X" type="button" title="Twitter / X">
        <span className="share-icon">X</span>
      </button>
      <button className="share-btn" onClick={() => share("email")} aria-label="Share via email" type="button" title="Email">
        <span className="share-icon">@</span>
      </button>
      <button className={`share-copy ${copied ? "copied" : ""}`} onClick={() => share("copy")} type="button">
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}

/* ============================================================
   ReadingTime — estimate minutes to read the category guide
   ============================================================ */
export function ReadingTime({ category }: { category: Category }) {
  // Rough word count: intro + all reviews + verdicts + faqs
  const words = useMemo(() => {
    let w = category.intro.split(/\s+/).length;
    for (const p of category.products) {
      w += p.review.join(" ").split(/\s+/).length;
      w += p.verdict.split(/\s+/).length;
      w += p.pros.concat(p.cons).join(" ").split(/\s+/).length;
    }
    for (const f of category.faqs) {
      w += f.q.split(/\s+/).length + f.a.split(/\s+/).length;
    }
    return w;
  }, [category]);
  const mins = Math.max(3, Math.round(words / 220));
  return (
    <span className="reading-time" title={`${words} words`}>
      <span aria-hidden>◐</span> ~{mins} min read
    </span>
  );
}

/* ============================================================
   SideToc — sticky desktop table of contents with active tracking
   ============================================================ */
export function SideToc({ category }: { category: Category }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const ids = category.products.map((p) => `p-${p.rank}`).concat(["comparison", "faq"]);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.2, 0.5] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [category]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const items = [
    ...category.products.map((p) => ({ id: `p-${p.rank}`, num: String(p.rank).padStart(2, "0"), label: p.name.split(" ").slice(0, 4).join(" ") + (p.name.split(" ").length > 4 ? "…" : "") })),
    { id: "comparison", num: "≡", label: "Compare all" },
    { id: "faq", num: "?", label: "FAQ" },
  ];

  return (
    <nav className="side-toc" aria-label="On this page">
      <div className="st-label">On this page</div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`st-link ${activeId === item.id ? "is-active" : ""}`}
              onClick={() => go(item.id)}
            >
              <span className="num">{item.num}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ============================================================
   Newsletter — updated to POST to the real /api/newsletter route
   ============================================================ */
export function NewsletterApi({ variant = "section", source = "home" }: { variant?: "section" | "compact"; source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState<number | null>(null);

  // Fetch live subscriber count (best-effort, non-blocking)
  useEffect(() => {
    fetch("/api/newsletter")
      .then((r) => r.json())
      .then((d) => { if (d.ok && typeof d.count === "number") setCount(d.count); })
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("done");
        setEmail("");
        setCount((c) => (c !== null ? c + 1 : c));
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Could not subscribe");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error");
    }
  };

  const displayCount = count !== null ? count.toLocaleString("en-IN") : "4,210";

  return (
    <section className={`newsletter ${variant === "compact" ? "compact" : ""}`} aria-label="Deal alert newsletter">
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
              <span><strong>{displayCount}</strong> subscribers</span>
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
          {status === "done" && <span className="nl-success">You&apos;re on the list. Check your inbox for a confirmation.</span>}
          {status === "error" && <span className="nl-success" style={{ color: "var(--accent-gaming)" }}>{errorMsg}</span>}
        </form>
      </div>
    </section>
  );
}

/* ============================================================
   RatingBar — visual rating bar for product review headers
   ============================================================ */
export function RatingBar({ rating }: { rating: number }) {
  const pct = (rating / 5) * 100;
  return (
    <span className="rating-bar" title={`${rating} out of 5`}>
      <span className="rb-track"><span className="rb-fill" style={{ width: `${pct}%` }} /></span>
      <span className="rb-num">★ {rating.toFixed(1)}</span>
    </span>
  );
}
