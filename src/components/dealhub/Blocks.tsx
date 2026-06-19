"use client";

import { useEffect, useRef } from "react";
import type { Category, Product } from "@/data/products";
import { categories } from "@/data/products";
import { useRouter } from "./Router";
import { PriceHistory, CompareToggle } from "./Phase2";
import { PriceAlertBell, RatingBar, pushRecentlyViewed } from "./Phase3";
import { ProductImage, BestForTag } from "./Phase4";
import { RelatedProducts, PrintButton } from "./Phase5";
import { ReaderVotes } from "./Phase7";
import { ServerComments } from "./Phase10";

export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

/* ===== Toc ===== */
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function Toc({ category }: { category: Category }) {
  return (
    <nav aria-label="Table of contents" className="my-6">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-eyebrow">Jump to product</span>
        <span className="flex-1 rule" />
      </div>
      <div className="flex flex-wrap gap-2">
        {category.products.map((p) => (
          <button
            key={p.rank}
            type="button"
            onClick={() => scrollToId(`p-${p.rank}`)}
            className="toc-pill"
            data-target={`p-${p.rank}`}
          >
            <span className="num">{String(p.rank).padStart(2, "0")}</span>
            {p.name.split(" ").slice(0, 3).join(" ")}…
          </button>
        ))}
        <button type="button" onClick={() => scrollToId("comparison")} className="toc-pill" data-target="comparison">Compare all</button>
        <button type="button" onClick={() => scrollToId("faq")} className="toc-pill" data-target="faq">FAQ</button>
      </div>
    </nav>
  );
}

/* ===== Top Pick callout (compact, for category pages) ===== */
export function TopPickCallout({ category }: { category: Category }) {
  const top = category.products.find((p) => p.rank === category.topPickRank)!;
  return (
    <div className="callout my-8">
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        <div className="md:w-2/5">
          <div className="text-eyebrow mb-1">Editor&apos;s top pick</div>
          <h3 className="text-h3 mb-1">{top.name}</h3>
          <p className="text-sm text-[var(--text-muted)] font-mono">{top.brand} &middot; {formatINR(top.price)}</p>
          <p className="mt-3 text-[0.95rem] leading-relaxed">{top.verdict}</p>
        </div>
        <div className="md:w-3/5 md:border-l md:border-[var(--border)] md:pl-5">
          <blockquote className="pullquote text-base">{top.pullquote}</blockquote>
          <div className="mt-3 flex flex-wrap gap-2">
            {top.pros.slice(0, 2).map((pro) => (
              <span key={pro} className="tag">{pro}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Product Review Block ===== */
export function ProductReview({ product, category }: { product: Product; category: Category }) {
  const articleRef = useRef<HTMLElement>(null);

  // Push to recently-viewed when this product scrolls into view (once per mount)
  useEffect(() => {
    if (!articleRef.current) return;
    let pushed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!pushed && entries[0]?.isIntersecting && entries[0].intersectionRatio > 0.4) {
          pushed = true;
          pushRecentlyViewed(product, category);
        }
      },
      { threshold: [0, 0.4, 0.7] }
    );
    observer.observe(articleRef.current);
    return () => observer.disconnect();
  }, [product, category]);

  const isTopPick = product.rank === category.topPickRank;

  return (
    <article
      ref={articleRef}
      id={`p-${product.rank}`}
      className="py-10 border-b border-[var(--border)] scroll-mt-24 relative"
      style={{ borderLeft: `3px solid ${category.accent}`, paddingLeft: "1.25rem", marginLeft: "-1.25rem" }}
    >
      {/* Header row: rank number + name + price */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 lg:gap-8 items-start mb-6">
        <div className="flex items-start gap-4">
          <div className="rank-number select-none">{String(product.rank).padStart(2, "0")}</div>
          <div className="pt-2">
            <div className="serial mb-1">{product.brand}</div>
            <RatingBar rating={product.rating} />
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mt-1">
              <span><span className="live-dot" />{product.testWeeks} wks tested</span>
              {product.testedOn && (
                <>
                  <span>·</span>
                  <span>verified {new Date(product.testedOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-h2 mb-1">{product.name}</h2>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-2xl font-semibold text-[var(--text-primary)]">{formatINR(product.price)}</span>
            <span className="font-mono text-sm text-[var(--text-muted)] line-through">{formatINR(product.mrp)}</span>
            <span className="tag tag-accent" style={{ background: "var(--accent)", borderColor: "var(--accent)" }}>
              {Math.round((1 - product.price / product.mrp) * 100)}% off
            </span>
            {product.bestFor && <BestForTag product={product} />}
          </div>
        </div>
      </div>

      {/* Image + spec strip asymmetric */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-6">
        <div className="md:col-span-2 relative">
          {isTopPick && <span className="ribbon">Editor&apos;s pick</span>}
          <ProductImage product={product} category={category} />
          <PriceHistory product={product} categorySlug={category.slug} />
        </div>
        <dl className="spec-strip md:col-span-3 self-start">
          {product.specs.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Review text */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mb-6">
        <div className="space-y-4 text-[1.02rem] leading-[1.75]">
          <p>{product.review[0]}<sup className="fn">{product.rank}</sup></p>
          <p>{product.review[1]}</p>
        </div>
        <aside className="lg:border-l lg:border-[var(--border)] lg:pl-6">
          <div className="text-eyebrow mb-2">Verdict</div>
          <p className="font-serif text-[1.05rem] leading-snug">{product.verdict}</p>
        </aside>
      </div>

      {/* Pull quote */}
      <blockquote className="pullquote my-7 max-w-3xl">
        &ldquo;{product.pullquote}&rdquo;
      </blockquote>

      {/* Pros / Cons */}
      <div className="proscons mb-6">
        <div className="pros">
          <h4>The good</h4>
          <ul>
            {product.pros.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
        <div className="cons">
          <h4>The trade-offs</h4>
          <ul>
            {product.cons.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      </div>

      {/* Reader votes */}
      <ReaderVotes productKey={`${category.slug}:${product.rank}`} category={category} />

      {/* CTA */}
      <div className="flex flex-wrap items-center gap-3">
        <a href={`https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer sponsored" className="cta-btn">
          Check on Amazon →
        </a>
        <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer sponsored" className="cta-btn cta-btn-ghost">
          Check on Flipkart →
        </a>
        <CompareToggle rank={product.rank} />
        <PriceAlertBell product={product} category={category} />
        <PrintButton />
        <span className="text-xs font-mono text-[var(--text-muted)] ml-auto">Affiliate links · price may vary</span>
      </div>

      {/* Related products from other categories */}
      <RelatedProducts product={product} category={category} />

      {/* Reader comments (server-side) */}
      <ServerComments productKey={`${category.slug}:${product.rank}`} product={product} />
    </article>
  );
}

/* ===== Comparison Table ===== */
export function ComparisonTable({ category }: { category: Category }) {
  const cols = category.comparisonCols;
  return (
    <section id="comparison" className="scroll-mt-24 my-12">
      <div className="flex items-baseline gap-3 mb-1">
        <h2 className="text-h2">All five, side by side</h2>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-4">Spec snapshot. Prices as tested; verified on {category.lastUpdated}.</p>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              {cols.map((c) => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {category.products.map((p) => (
              <tr key={p.rank}>
                <td className="row-rank">{String(p.rank).padStart(2, "0")}</td>
                <td>
                  <button type="button" onClick={() => scrollToId(`p-${p.rank}`)} className="font-medium hover:underline text-left">{p.name}</button>
                  <div className="text-xs text-[var(--text-muted)] font-mono">{p.brand}</div>
                </td>
                {cols.map((c) => {
                  const spec = p.specs.find((s) => s.label.toLowerCase().includes(c.toLowerCase().split(" ")[0]) || c.toLowerCase().includes(s.label.toLowerCase().split(" ")[0]));
                  const val =
                    c.toLowerCase() === "price" ? formatINR(p.price) :
                    c.toLowerCase() === "weight" ? (p.specs.find((s) => s.label.toLowerCase() === "weight")?.value ?? "—") :
                    spec?.value ?? "—";
                  return <td key={c} className="font-mono text-sm">{val}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ===== FAQ ===== */
export function Faq({ category }: { category: Category }) {
  return (
    <section id="faq" className="scroll-mt-24 my-12">
      <div className="flex items-baseline gap-3 mb-2">
        <h2 className="text-h2">Reader questions</h2>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-5">Things we get asked most about {category.name.toLowerCase()}.</p>
      <div className="border-t border-[var(--border)]">
        {category.faqs.map((f, i) => (
          <details key={i} className="faq-item" {...(i === 0 ? { open: true } : {})}>
            <summary>{f.q}</summary>
            <div className="answer"><div>{f.a}</div></div>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ===== Other Guides cross-links ===== */
export function OtherGuides({ currentSlug }: { currentSlug: string }) {
  const { navigate } = useRouter();
  const others = categories.filter((c) => c.slug !== currentSlug);
  return (
    <section className="my-12 border-t border-[var(--border)] pt-8">
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-eyebrow">Other guides</span>
        <span className="flex-1 rule" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {others.map((c) => (
          <button
            key={c.slug}
            onClick={() => navigate({ name: "category", slug: c.slug })}
            className="text-left p-4 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-tint)] transition-colors"
            style={{ borderLeft: `3px solid ${c.accent}` }}
          >
            <div className="text-eyebrow mb-1" style={{ color: c.accent }}>{c.testedCount} tested</div>
            <div className="font-serif text-[1.05rem] font-medium leading-tight mb-1">{c.name}</div>
            <div className="text-xs text-[var(--text-muted)]">{c.tagline}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
