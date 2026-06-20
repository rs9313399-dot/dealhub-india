"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import type { Category, Product } from "@/data/products";
import { useRouter } from "./Router";
import { formatINR } from "./Blocks";

/* ============================================================
   ReaderComments — localStorage-based comments per product
   No auth needed; readers type a name + comment, stored locally.
   Shows seeded "editor" replies to feel populated.
   ============================================================ */
type Comment = {
  id: string;
  author: string;
  text: string;
  date: string; // ISO
  isEditor?: boolean;
};

// Seeded base comments so the section isn't empty on first visit
function seedComments(productKey: string): Comment[] {
  const seeds: Record<string, { author: string; text: string; isEditor?: boolean }[]> = {
    "smartwatches:1": [
      { author: "Rohan", text: "Bought this last month, calling clarity is decent but mic picks up wind noise on bike. Otherwise solid for the price." },
      { author: "Aarav (Editor)", text: "@Rohan — agree on the wind noise. We noted it in the review but it's manageable if you position the watch closer to your mouth. Thanks for the real-world feedback!", isEditor: true },
    ],
    "smartwatches:2": [
      { author: "Priya", text: "AMOLED display is genuinely good. Battery barely lasts 4 days with AOD on though — had to turn it off." },
    ],
    "gaming-peripherals:1": [
      { author: "Karthik", text: "Outemu Red switches are loud but tactile. For ₹1,400 this combo is unbeatable, especially the mouse sensor." },
    ],
  };
  const seed = seeds[productKey] || [];
  return seed.map((s, i) => ({
    id: `seed-${i}`,
    author: s.author,
    text: s.text,
    isEditor: s.isEditor,
    date: new Date(Date.now() - (i + 1) * 86400000 * (2 + i)).toISOString(),
  }));
}

function commentsKey(productKey: string) {
  return `dealhub:comments:${productKey}`;
}

function readComments(productKey: string): Comment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(commentsKey(productKey));
    const userComments: Comment[] = raw ? JSON.parse(raw) : [];
    return [...userComments, ...seedComments(productKey)];
  } catch {
    return seedComments(productKey);
  }
}

function writeUserComments(productKey: string, comments: Comment[]) {
  try {
    // Only persist user comments (not seeds)
    const userOnly = comments.filter((c) => !c.id.startsWith("seed-"));
    localStorage.setItem(commentsKey(productKey), JSON.stringify(userOnly));
    window.dispatchEvent(new CustomEvent("dealhub:comments-change", { detail: { productKey } }));
  } catch { /* ignore */ }
}

export function ReaderComments({ productKey, product }: { productKey: string; product: Product }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setComments(readComments(productKey));
  }, [productKey]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !author.trim()) return;
    const newComment: Comment = {
      id: `user-${Date.now()}`,
      author: author.trim(),
      text: text.trim(),
      date: new Date().toISOString(),
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    writeUserComments(productKey, [newComment, ...comments.filter((c) => !c.id.startsWith("seed-"))]);
    setText("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const sorted = [...comments].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="reader-comments" aria-label="Reader comments">
      <div className="rc-header">
        <span className="rc-label">Reader comments</span>
        <span className="flex-1 rule" />
        <span className="rc-count">{sorted.length}</span>
      </div>

      {/* Comment form */}
      <form onSubmit={submit} className="rc-form">
        <input
          type="text"
          className="rc-input rc-author"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          maxLength={40}
          aria-label="Your name"
        />
        <textarea
          className="rc-input rc-text"
          placeholder={`Share your experience with ${product.name}…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={500}
          rows={3}
          aria-label="Your comment"
        />
        <div className="rc-form-footer">
          {submitted && <span className="rc-submitted">✓ Comment posted</span>}
          <button type="submit" className="rc-submit">Post comment →</button>
        </div>
      </form>

      {/* Comments list */}
      <div className="rc-list">
        {sorted.length === 0 ? (
          <p className="rc-empty">No comments yet. Be the first to share your experience.</p>
        ) : (
          sorted.map((c) => (
            <div key={c.id} className={`rc-item ${c.isEditor ? "rc-editor" : ""}`}>
              <div className="rc-avatar">{c.author.charAt(0).toUpperCase()}</div>
              <div className="rc-body">
                <div className="rc-meta">
                  <span className="rc-author">{c.author}</span>
                  {c.isEditor && <span className="rc-badge">Editor</span>}
                  <span className="rc-date">{new Date(c.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                </div>
                <p className="rc-text">{c.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* ============================================================
   AdminStats — dashboard stats widget for the admin page
   Shows: total submissions, pending, acceptance rate, newsletter subs
   ============================================================ */
type Stats = {
  totalSubmissions: number;
  pending: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
  newsletterSubs: number;
};

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [subsRes, nlRes] = await Promise.all([
          fetch("/api/submissions"),
          fetch("/api/newsletter"),
        ]);
        const subsData = await subsRes.json();
        const nlData = await nlRes.json();
        const subs = subsData.submissions || [];
        const accepted = subs.filter((s: { status: string }) => s.status === "accepted").length;
        const rejected = subs.filter((s: { status: string }) => s.status === "rejected").length;
        const pending = subs.filter((s: { status: string }) => s.status === "pending").length;
        const decided = accepted + rejected;
        setStats({
          totalSubmissions: subs.length,
          pending,
          accepted,
          rejected,
          acceptanceRate: decided > 0 ? Math.round((accepted / decided) * 100) : 0,
          newsletterSubs: nlData.count || 0,
        });
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    load();
    // Refresh every 30s
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="admin-stats-loading">Loading stats…</div>;
  }

  const items = [
    { label: "Total submissions", value: stats.totalSubmissions, accent: "var(--text-primary)" },
    { label: "Pending review", value: stats.pending, accent: "#b8650f" },
    { label: "Accepted", value: stats.accepted, accent: "#4a6741" },
    { label: "Rejected", value: stats.rejected, accent: "#8b2635" },
    { label: "Acceptance rate", value: `${stats.acceptanceRate}%`, accent: "#2e5266" },
    { label: "Newsletter subs", value: stats.newsletterSubs, accent: "#4a4458" },
  ];

  return (
    <div className="admin-stats">
      <div className="as-header">
        <span className="as-label">Dashboard</span>
        <span className="flex-1 rule" />
        <span className="as-live"><span className="live-dot" />Live</span>
      </div>
      <div className="as-grid">
        {items.map((it) => (
          <div key={it.label} className="as-item">
            <div className="as-value" style={{ color: it.accent }}>{it.value}</div>
            <div className="as-text">{it.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   CategoryAlert — "notify me when any product in this category
   drops below ₹X" — a category-level price alert
   ============================================================ */
export function CategoryAlert({ category }: { category: Category }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [target, setTarget] = useState<number>(Math.round(Math.min(...category.products.map((p) => p.price)) * 0.85));
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ ok: false, msg: "Enter a valid email" });
      return;
    }
    setSubmitting(true);
    try {
      // Use the price-alerts API with a special productKey format: `${slug}:any`
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          productKey: `${category.slug}:any`,
          targetPrice: target,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ ok: true, msg: `Alert set — we'll email you when any ${category.hero.toLowerCase()} drops to ${formatINR(target)} or below` });
      } else {
        setStatus({ ok: false, msg: data.error || "Could not set alert" });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className="category-alert-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span aria-hidden>🔔</span> Alert me on any {category.hero.toLowerCase()} deal
      </button>
      {open && (
        <div className="alert-popover category-alert-popover" role="dialog">
          <h5>Category-wide price alert</h5>
          <p>
            We&apos;ll email you the moment <strong>any</strong> of the 5 {category.hero.toLowerCase()} on this page drops to your target price or below.
          </p>
          <form onSubmit={submit}>
            <label htmlFor={`ca-email-${category.slug}`}>Email</label>
            <input
              id={`ca-email-${category.slug}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.in"
              required
            />
            <label htmlFor={`ca-target-${category.slug}`}>Target price (₹) — lowest current is {formatINR(Math.min(...category.products.map((p) => p.price)))}</label>
            <input
              id={`ca-target-${category.slug}`}
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              min={1}
              max={Math.max(...category.products.map((p) => p.price))}
              step={50}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Setting…" : `Alert me at ${formatINR(target)} →`}
            </button>
          </form>
          {status && <div className={`ap-status ${status.ok ? "" : "err"}`}>{status.msg}</div>}
        </div>
      )}
    </div>
  );
}
