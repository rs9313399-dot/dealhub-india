"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { categories, allProducts, discountPct } from "@/data/products";
import type { FlatProduct } from "@/data/products";
import { useRouter } from "./Router";
import { formatINR } from "./Blocks";
import { ProductImage } from "./Phase4";
import { AdminStats } from "./Phase9";
import { ArchiveProgressBar, AdminCommentPanel } from "./Phase10";

/* ============================================================
   AdminPage — moderation dashboard for product submissions
   Lists all submissions, lets you filter by status + update status
   ============================================================ */
type Submission = {
  id: string;
  productName: string;
  brand: string;
  category: string;
  price: number;
  url: string | null;
  submitterEmail: string;
  submitterName: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#b8650f",
  reviewed: "#2e5266",
  accepted: "#4a6741",
  rejected: "#8b2635",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  accepted: "Accepted",
  rejected: "Rejected",
};

export function AdminPage() {
  const { navigate } = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/submissions${filter ? `?status=${filter}` : ""}`);
      const data = await res.json();
      if (data.ok) {
        setSubmissions(data.submissions);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      }
    } catch {
      /* ignore */
    } finally {
      setUpdating(null);
    }
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, reviewed: 0, accepted: 0, rejected: 0 };
    submissions.forEach((s) => { c[s.status] = (c[s.status] || 0) + 1; });
    return c;
  }, [submissions]);

  return (
    <div style={{ ["--accent" as string]: "var(--accent-neutral)" }}>
      <section className="border-b-2 border-[var(--text-primary)]">
        <div className="container-editorial py-10">
          <div className="flex flex-wrap items-baseline gap-3 mb-3">
            <span className="text-eyebrow">Editorial tools</span>
            <span className="flex-1 rule" />
            <span className="text-eyebrow">Internal · no auth in demo</span>
          </div>
          <h1 className="text-h1 mb-3">Submissions moderation</h1>
          <p className="font-serif italic text-[1.15rem] text-[var(--text-muted)] max-w-2xl">
            Review products readers have submitted for testing. Update status to track what&apos;s in the editorial pipeline.
          </p>
        </div>
      </section>

      <div className="container-editorial py-8">
        {/* Dashboard stats */}
        <AdminStats />

        {/* Comment moderation */}
        <AdminCommentPanel />

        {/* Status filter tabs */}
        <div className="admin-tabs mb-6">
          {["pending", "reviewed", "accepted", "rejected"].map((s) => (
            <button
              key={s}
              type="button"
              className={`admin-tab ${filter === s ? "is-active" : ""}`}
              onClick={() => setFilter(s)}
              style={filter === s ? { background: STATUS_COLORS[s], borderColor: STATUS_COLORS[s] } : {}}
            >
              {STATUS_LABELS[s]} ({counts[s] || 0})
            </button>
          ))}
          <button
            type="button"
            className={`admin-tab ${filter === "" ? "is-active" : ""}`}
            onClick={() => setFilter("")}
          >
            All
          </button>
        </div>

        {/* Submissions list */}
        {loading ? (
          <div className="empty-state">Loading submissions…</div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <p className="font-serif text-lg mb-2">No {filter === "" ? "" : STATUS_LABELS[filter]?.toLowerCase() + " "}submissions.</p>
            <p className="text-sm text-[var(--text-muted)]">
              Reader-submitted products will appear here for review. Submit one from the <button onClick={() => navigate({ name: "about" })} className="text-[var(--accent)] underline">About page</button>.
            </p>
          </div>
        ) : (
          <div className="admin-list">
            {submissions.map((s) => (
              <div key={s.id} className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <div className="admin-product-name">{s.productName}</div>
                    <div className="admin-meta">
                      {s.brand} · {formatINR(s.price)} · {categories.find((c) => c.slug === s.category)?.hero || s.category}
                    </div>
                  </div>
                  <span className="admin-status" style={{ background: STATUS_COLORS[s.status], color: "#faf8f3" }}>
                    {STATUS_LABELS[s.status] || s.status}
                  </span>
                </div>
                <div className="admin-card-body">
                  {s.url && (
                    <div className="admin-field">
                      <span className="admin-field-label">Link</span>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="admin-link">{s.url}</a>
                    </div>
                  )}
                  {s.notes && (
                    <div className="admin-field">
                      <span className="admin-field-label">Notes</span>
                      <span className="admin-notes">{s.notes}</span>
                    </div>
                  )}
                  <div className="admin-field">
                    <span className="admin-field-label">Submitter</span>
                    <span className="admin-submitter">
                      {s.submitterName ? `${s.submitterName} · ` : ""}{s.submitterEmail}
                    </span>
                  </div>
                  <div className="admin-field">
                    <span className="admin-field-label">Submitted</span>
                    <span className="admin-date">{new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
                <div className="admin-actions">
                  <button type="button" className="admin-action accept" onClick={() => updateStatus(s.id, "accepted")} disabled={updating === s.id}>
                    ✓ Accept
                  </button>
                  <button type="button" className="admin-action review" onClick={() => updateStatus(s.id, "reviewed")} disabled={updating === s.id}>
                    ◐ Mark reviewed
                  </button>
                  <button type="button" className="admin-action reject" onClick={() => updateStatus(s.id, "rejected")} disabled={updating === s.id}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   NewsletterArchivePage — past deal-alert emails
   Shows a mock archive of weekly deal-alert newsletters
   ============================================================ */
type ArchiveEntry = {
  id: string;
  date: string;
  subject: string;
  drops: number;
  topDrop: { name: string; price: number; was: number };
  preview: string;
};

const ARCHIVE: ArchiveEntry[] = [
  {
    id: "2025-w46",
    date: "10 Nov 2025",
    subject: "3 price drops this week — including the Noise ColorFit at ₹1,999",
    drops: 3,
    topDrop: { name: "Noise ColorFit Pro 5", price: 1999, was: 2299 },
    preview: "This week's biggest drop: the Noise ColorFit Pro 5 fell from ₹2,299 to ₹1,999 — the lowest we've tracked. Also: Mi Power Bank 3i dropped ₹100, and the Ant Esports KM500W is back in stock at ₹999.",
  },
  {
    id: "2025-w45",
    date: "3 Nov 2025",
    subject: "Diwali sale survivors — 4 genuine drops worth a look",
    drops: 4,
    topDrop: { name: "Ambrane 10000mAh Stylo", price: 699, was: 799 },
    preview: "Post-Diwali cleanup: most \"sale\" prices have reverted, but 4 products are genuinely cheaper than their pre-sale levels. The Ambrane Stylo hit ₹699 — a new low.",
  },
  {
    id: "2025-w44",
    date: "27 Oct 2025",
    subject: "Redragon combo at ₹1,299 (was ₹1,399) + 2 more",
    drops: 3,
    topDrop: { name: "Redragon Kumara Pro Combo", price: 1299, was: 1399 },
    preview: "The Redragon Kumara Pro + M601 combo dropped to ₹1,299 — the first sub-₹1,300 we've seen. Plus: Philips Air 5W lamp at ₹1,149 and the boAt Wave Call 2 at ₹1,399.",
  },
  {
    id: "2025-w43",
    date: "20 Oct 2025",
    subject: "Quiet week — 1 genuine drop (Philips trimmer)",
    drops: 1,
    topDrop: { name: "Philips Norelco BT1232", price: 799, was: 899 },
    preview: "A slow week for genuine deals. The Philips BT1232 trimmer dropped to ₹799 — still above its all-time low of ₹749, but worth a look if you've been waiting.",
  },
  {
    id: "2025-w42",
    date: "13 Oct 2025",
    subject: "Fastrack Reflex Vybe at ₹1,699 — 2 other drops",
    drops: 3,
    topDrop: { name: "Fastrack Reflex Vybe", price: 1699, was: 1995 },
    preview: "The Fastrack Reflex Vybe hit ₹1,699 — a solid ₹296 drop. Also: Cosmic Byte Kronos mouse at ₹1,149 and the Otus Eye-Care lamp at ₹1,349.",
  },
  {
    id: "2025-w41",
    date: "6 Oct 2025",
    subject: "5 drops this week — the biggest in months",
    drops: 5,
    topDrop: { name: "Mi Power Bank 3i 20K", price: 1299, was: 1449 },
    preview: "A big week: the Mi 20K power bank dropped to ₹1,299 — a ₹150 fall. Plus 4 more drops across gaming, desk setup, and grooming categories.",
  },
];

export function NewsletterArchivePage() {
  const { navigate } = useRouter();

  return (
    <div style={{ ["--accent" as string]: "var(--accent-neutral)" }}>
      <ArchiveProgressBar />
      <section className="border-b-2 border-[var(--text-primary)]">
        <div className="container-editorial py-10">
          <div className="flex flex-wrap items-baseline gap-3 mb-3">
            <span className="text-eyebrow">Newsletter archive</span>
            <span className="flex-1 rule" />
            <span className="text-eyebrow">{ARCHIVE.length} issues</span>
          </div>
          <h1 className="text-h1 mb-3">Past deal alerts</h1>
          <p className="font-serif italic text-[1.15rem] text-[var(--text-muted)] max-w-2xl">
            Every weekly deal-alert email we&apos;ve sent, archived for reference. See what you missed before subscribing.
          </p>
        </div>
      </section>

      <div className="container-editorial py-8">
        <div className="archive-list">
          {ARCHIVE.map((entry) => (
            <article key={entry.id} className="archive-entry">
              <div className="archive-date">{entry.date}</div>
              <div className="archive-body">
                <h3 className="archive-subject">{entry.subject}</h3>
                <p className="archive-preview">{entry.preview}</p>
                <div className="archive-stats">
                  <span className="archive-stat">{entry.drops} price drop{entry.drops === 1 ? "" : "s"}</span>
                  <span className="archive-stat archive-top-drop">
                    Top: {entry.topDrop.name} — {formatINR(entry.topDrop.price)}{" "}
                    <span className="archive-was">was {formatINR(entry.topDrop.was)}</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Subscribe CTA */}
        <div className="archive-cta mt-8">
          <div>
            <h3 className="text-h3 mb-2">Want these in your inbox?</h3>
            <p className="text-[1rem] text-[var(--text-muted)]">
              One email per week, only genuine verified price drops. Unsubscribe anytime.
            </p>
          </div>
          <button onClick={() => navigate({ name: "home" })} className="cta-btn">
            Subscribe on the home page →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HomeReadingTime — reading time estimate for the home page
   ============================================================ */
export function HomeReadingTime() {
  // Estimate based on the publish log + category blocks text
  const mins = useMemo(() => {
    let words = 0;
    // Publish log
    words += 8 * 12; // ~12 words per entry
    // Category blocks
    categories.forEach((c) => {
      words += c.intro.split(/\s+/).length;
      words += c.products[0]?.verdict.split(/\s+/).length || 0;
    });
    return Math.max(4, Math.round(words / 200));
  }, []);

  return (
    <span className="reading-time" title="Estimated time to browse the full front page">
      <span aria-hidden>◐</span> ~{mins} min browse
    </span>
  );
}

/* ============================================================
   DealsRecentlyUpdatedFilter — a toggle on the deals page
   that sorts by "recently updated" instead of discount
   ============================================================ */
export function DealsSortToggle({
  sortBy,
  onSortChange,
}: {
  sortBy: "discount" | "recent";
  onSortChange: (s: "discount" | "recent") => void;
}) {
  return (
    <div className="deals-sort-toggle">
      <span className="dst-label">Sort by</span>
      <div className="seg">
        <button
          type="button"
          aria-pressed={sortBy === "discount"}
          onClick={() => onSortChange("discount")}
        >
          Biggest discount
        </button>
        <button
          type="button"
          aria-pressed={sortBy === "recent"}
          onClick={() => onSortChange("recent")}
        >
          Recently updated
        </button>
      </div>
    </div>
  );
}
