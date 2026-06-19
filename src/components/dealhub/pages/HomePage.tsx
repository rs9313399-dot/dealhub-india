"use client";

import { categories } from "@/data/products";
import { useRouter } from "../Router";
import { formatINR } from "../Blocks";
import { NewsletterApi, RecentlyViewed } from "../Phase3";
import { DealOfTheDayBanner, HomeMiniMap } from "../Phase5";
import { HomeProgressBar, HomeBackToTop } from "../Phase7";
import { HomeReadingTime } from "../Phase8";

// Asymmetric category layouts — each one distinct
const layouts = [
  "smartwatches",
  "gaming-peripherals",
  "desk-setup",
  "powerbanks",
  "grooming",
] as const;

export function HomePage() {
  const { navigate } = useRouter();
  const topDealCategory = categories[0]; // smartwatches
  const topDeal = topDealCategory.products[0];

  return (
    <div>
      <HomeProgressBar />
      <HomeBackToTop />
      {/* ===== TOP STRIP: This Week's Top Deal — editorial hero ===== */}
      <section className="container-editorial py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-start">
          {/* Left: headline */}
          <div>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-eyebrow" style={{ color: topDealCategory.accent }}>This week&apos;s top deal</span>
              <span className="flex-1 rule" />
              <HomeReadingTime />
              <span className="text-eyebrow">{topDealCategory.lastUpdated}</span>
            </div>
            <h2 className="text-h1 mb-4">
              The ₹1,799 smartwatch that <span className="italic font-normal">actually</span> takes calls
            </h2>
            <p className="text-[1.05rem] leading-relaxed text-[var(--text-primary)] mb-5 max-w-2xl">
              {topDealCategory.intro.split(".")[0]}. After three weeks of daily wear — commute, gym, sleep tracking — the {topDeal.name} held up where ₹3,000 rivals wobbled. {topDeal.pullquote}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate({ name: "category", slug: topDealCategory.slug })}
                className="cta-btn"
                style={{ background: topDealCategory.accent }}
              >
                Read the full review →
              </button>
              <button
                onClick={() => navigate({ name: "best-of" })}
                className="cta-btn cta-btn-ghost"
              >
                See all 5 #1 picks →
              </button>
              <div className="font-mono text-sm">
                <span className="text-2xl font-semibold">{formatINR(topDeal.price)}</span>
                <span className="text-[var(--text-muted)] line-through ml-2">{formatINR(topDeal.mrp)}</span>
              </div>
            </div>
          </div>

          {/* Right: data card */}
          <div className="border border-[var(--border)] bg-[var(--surface)] p-5">
            <div
              className="product-image mb-4"
              style={{
                aspectRatio: topDeal.aspect,
                background: `linear-gradient(135deg, ${topDealCategory.accent}22 0%, ${topDealCategory.accent}08 100%)`,
              }}
            >
              <span className="font-serif text-base tracking-tight opacity-80 px-4 text-center">{topDeal.imageLabel}</span>
            </div>
            <dl className="spec-strip mb-3">
              {topDeal.specs.slice(0, 4).map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2">
              {topDeal.pros.slice(0, 2).map((p) => <span key={p} className="tag">{p}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY STRIP — magazine sections ===== */}
      <section className="border-y-2 border-[var(--text-primary)] bg-[var(--surface-tint)]">
        <div className="container-editorial py-5">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-eyebrow">The five sections</span>
            <span className="flex-1 rule" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => navigate({ name: "category", slug: c.slug })}
                className="text-left group"
              >
                <div
                  className="h-1 mb-3"
                  style={{ background: c.accent }}
                />
                <div className="font-mono text-xs text-[var(--text-muted)] mb-1">
                  {String(categories.indexOf(c) + 1).padStart(2, "0")} / 05
                </div>
                <div className="font-serif text-[1.05rem] font-medium leading-tight group-hover:underline">
                  {c.hero}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{c.testedCount} products tested</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEAL OF THE DAY ===== */}
      <DealOfTheDayBanner />

      {/* ===== CATEGORY BLOCKS — each visually distinct ===== */}
      <CategoryBlocks />

      {/* ===== RECENTLY VIEWED (localStorage) ===== */}
      <RecentlyViewed />

      {/* ===== NEWSLETTER ===== */}
      <NewsletterApi variant="section" source="home" />

      {/* ===== ALL 25 AT A GLANCE ===== */}
      <HomeMiniMap />

      {/* ===== PUBLISH LOG ===== */}
      <section className="container-editorial py-12 border-t border-[var(--border)]">
        <div className="flex items-baseline gap-3 mb-5">
          <span className="text-eyebrow">Recently updated</span>
          <span className="flex-1 rule" />
          <span className="text-eyebrow">Publish log</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {[
            { date: "12 Nov", cat: "Smartwatches", title: "Re-tested Fire-Boltt Phoenix Pro after v4.2 firmware update", editor: "Aarav" },
            { date: "11 Nov", cat: "Power Banks", title: "Added Mi Power Bank 3i long-term capacity retention data", editor: "Priya" },
            { date: "10 Nov", cat: "Gaming", title: "Cosmic Byte Equinox Kronos promoted to #3 after 3-month retest", editor: "Kabir" },
            { date: "9 Nov", cat: "Grooming", title: "boAt Misfit T200 demoted — blade pulling reported by 4 readers", editor: "Meera" },
            { date: "7 Nov", cat: "Desk Setup", title: "Otus Eye-Care Pro added after CRI Ra 90+ verification", editor: "Aarav" },
            { date: "5 Nov", cat: "Smartwatches", title: "Crossbeats Nexus demoted — software stutter unacceptable at #2", editor: "Kabir" },
            { date: "3 Nov", cat: "Power Banks", title: "Anker Redux review refreshed; USB-C omission noted prominently", editor: "Priya" },
            { date: "1 Nov", cat: "Grooming", title: "Nova NHT-1053 added as ultra-budget fallback option", editor: "Meera" },
          ].map((entry, i) => (
            <div key={i} className="py-3 border-b border-[var(--border)] flex items-baseline gap-4">
              <span className="font-mono text-xs text-[var(--text-muted)] w-14 shrink-0">{entry.date}</span>
              <div className="flex-1">
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] mr-2">{entry.cat}</span>
                <span className="text-[0.95rem]">{entry.title}</span>
              </div>
              <span className="font-mono text-xs text-[var(--text-muted)] hidden sm:inline">— {entry.editor}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CategoryBlocks() {
  const { navigate } = useRouter();

  return (
    <>
      {/* Block 1: Smartwatches — large editorial, image left, text right */}
      <section className="container-editorial py-12 border-b border-[var(--border)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <button
            onClick={() => navigate({ name: "category", slug: "smartwatches" })}
            className="product-image has-img block text-left"
            style={{ aspectRatio: "16 / 10" }}
            aria-label="Open smartwatches guide"
          >
            <img src="/images/categories/smartwatches.png" alt="Smartwatch on warm paper background — editorial product photography" className="category-hero-img" />
            <span className="img-label">Smartwatch lab · 14-day wear cycle</span>
          </button>
          <div>
            <div className="text-eyebrow mb-2" style={{ color: categories[0].accent }}>Section 01 · Smartwatches</div>
            <h3 className="text-h2 mb-3">Budget wrists that don&apos;t lie about battery</h3>
            <p className="text-[1rem] leading-relaxed text-[var(--text-muted)] mb-4">
              We logged brightness at noon, SpO2 against a reference oximeter, and real battery across 14 days per watch. 23 in, 5 out — the rest were either dim outdoors or fibbed about runtime.
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {["IP67 vs 5 ATM", "Calling clarity", "SpO2 variance", "AOD penalty"].map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            <button onClick={() => navigate({ name: "category", slug: "smartwatches" })} className="cta-btn" style={{ background: categories[0].accent }}>
              See the 5 picks →
            </button>
          </div>
        </div>
      </section>

      {/* Block 2: Gaming — text-heavy, two columns + numbered list */}
      <section className="container-editorial py-12 border-b border-[var(--border)] bg-[var(--surface-tint)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10">
          <div>
            <button
              onClick={() => navigate({ name: "category", slug: "gaming-peripherals" })}
              className="product-image has-img block w-full mb-4"
              style={{ aspectRatio: "5 / 4" }}
              aria-label="Open gaming peripherals guide"
            >
              <img src="/images/categories/gaming.png" alt="Mechanical gaming keyboard and mouse on warm paper — editorial product photography" className="category-hero-img" />
              <span className="img-label">Keyboard teardown · switch verification</span>
            </button>
            <div className="text-eyebrow mb-2" style={{ color: categories[1].accent }}>Section 02 · Gaming Peripherals</div>
            <h3 className="text-h2 mb-3">Mechanical that isn&apos;t membrane in disguise</h3>
            <p className="text-[1rem] leading-relaxed text-[var(--text-muted)]">
              Most ₹1,500 &quot;RGB mechanical&quot; keyboards are membrane with clicky sound. We opened the chassis. Tested latency. Tracked double-clicks across 3 months of Valorant.
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {categories[1].products.slice(0, 4).map((p) => (
                <button key={p.rank} onClick={() => navigate({ name: "category", slug: "gaming-peripherals" })} className="text-left flex gap-3 items-start group">
                  <span className="rank-number !text-3xl !opacity-30 leading-none">{String(p.rank).padStart(2, "0")}</span>
                  <div>
                    <div className="font-serif text-[1.05rem] font-medium group-hover:underline">{p.name}</div>
                    <div className="font-mono text-xs text-[var(--text-muted)]">{formatINR(p.price)} · {p.brand}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-5">
              <button onClick={() => navigate({ name: "category", slug: "gaming-peripherals" })} className="cta-btn cta-btn-ghost" style={{ borderColor: categories[1].accent, color: categories[1].accent }}>
                Read all 5 reviews →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Block 3: Desk Setup — single hero quote, vertical accent bar */}
      <section className="container-editorial py-14 border-b border-[var(--border)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr] gap-10 items-start">
          <div className="lg:sticky lg:top-24">
            <div className="text-eyebrow mb-2" style={{ color: categories[2].accent }}>Section 03 · Desk Setup</div>
            <h3 className="text-h2 mb-3">The flicker you can&apos;t see but your eyes feel</h3>
            <p className="text-[1rem] leading-relaxed text-[var(--text-muted)] mb-4">
              18 lamps. 30 nights. A slow-motion phone camera caught what your retina blurs out. Only five flicker-free enough for a 4-hour study session.
            </p>
            <button onClick={() => navigate({ name: "category", slug: "desk-setup" })} className="cta-btn" style={{ background: categories[2].accent }}>
              See the lamp tests →
            </button>
          </div>
          <blockquote className="pullquote !text-2xl !pl-8" style={{ borderLeftWidth: "4px" }}>
            &ldquo;Cheap drivers me ripple rehta hai, jisse light microscopically flicker karti hai. Long exposure me eye strain + headache cause karta hai — aur tum pata bhi nahi chalta kyun ho raha hai.&rdquo;
            <footer className="mt-4 text-eyebrow !text-sm not-italic">— from the desk lamp FAQ, verified by slow-mo capture</footer>
          </blockquote>
          <button
            onClick={() => navigate({ name: "category", slug: "desk-setup" })}
            className="product-image has-img block"
            style={{ aspectRatio: "3 / 4" }}
            aria-label="Open desk setup guide"
          >
            <img src="/images/categories/desk.png" alt="LED desk lamp on warm paper background — editorial product photography" className="category-hero-img" />
            <span className="img-label">Lamp lab · 30-night test</span>
          </button>
        </div>
      </section>

      {/* Block 4: Power Banks — data-forward, fake mAh exposed */}
      <section className="container-editorial py-12 border-b border-[var(--border)] bg-[var(--bg-dark)] text-[var(--bg-primary)]">
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-eyebrow !text-[var(--bg-primary)]/70" style={{ color: categories[3].accent }}>Section 04 · Power Banks</span>
          <span className="flex-1 border-b border-[var(--bg-primary)]/20" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 items-center">
          <div>
            <button
              onClick={() => navigate({ name: "category", slug: "powerbanks" })}
              className="product-image has-img block w-full mb-5"
              style={{ aspectRatio: "16 / 9" }}
              aria-label="Open power banks guide"
            >
              <img src="/images/categories/powerbanks.png" alt="Portable power bank on warm paper — editorial product photography" className="category-hero-img" />
              <span className="img-label">Discharge rig · calibrated dummy load</span>
            </button>
            <h3 className="text-h2 !text-[var(--bg-primary)] mb-3">10,000 mAh claim ≠ 10,000 mAh in your phone</h3>
            <p className="text-[1rem] leading-relaxed text-[var(--bg-primary)]/75 mb-5">
              We discharged each bank into a calibrated load. Industry efficiency is 60–65%, but some brands lie even below that. Here&apos;s what actually came out.
            </p>
            <button onClick={() => navigate({ name: "category", slug: "powerbanks" })} className="cta-btn" style={{ background: categories[3].accent }}>
              See real mAh tested →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories[3].products.map((p) => {
              const real = p.specs.find((s) => s.label === "Real tested")?.value ?? "—";
              const claimed = p.specs.find((s) => s.label === "Claimed")?.value ?? "—";
              return (
                <button key={p.rank} onClick={() => navigate({ name: "category", slug: "powerbanks" })} className="text-left p-3 border border-[var(--bg-primary)]/15 hover:border-[var(--bg-primary)]/40 transition-colors">
                  <div className="font-mono text-xs text-[var(--bg-primary)]/60 mb-1">{String(p.rank).padStart(2, "0")}</div>
                  <div className="font-serif text-sm font-medium !text-[var(--bg-primary)] mb-2">{p.name}</div>
                  <div className="font-mono text-xs text-[var(--bg-primary)]/70">Claimed: {claimed}</div>
                  <div className="font-mono text-sm font-semibold" style={{ color: categories[3].accent }}>{real}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Block 5: Grooming — tight 3-col with verdicts */}
      <section className="container-editorial py-12">
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-eyebrow" style={{ color: categories[4].accent }}>Section 05 · Grooming</span>
          <span className="flex-1 rule" />
          <span className="text-eyebrow">6-week blade retention test</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 mb-8 items-center">
          <h3 className="text-h2 max-w-2xl">Sharp blades, honest runtimes — and the &quot;self-sharpening&quot; lie</h3>
          <button
            onClick={() => navigate({ name: "category", slug: "grooming" })}
            className="product-image has-img block"
            style={{ aspectRatio: "16 / 9" }}
            aria-label="Open grooming guide"
          >
            <img src="/images/categories/grooming.png" alt="Cordless beard trimmer on warm paper — editorial product photography" className="category-hero-img" />
            <span className="img-label">Blade sharpness log · 6-week cycle</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories[4].products.map((p) => (
            <button key={p.rank} onClick={() => navigate({ name: "category", slug: "grooming" })} className="text-left p-4 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-tint)] transition-colors" style={{ borderTop: `3px solid ${categories[4].accent}` }}>
              <div className="rank-number !text-2xl !opacity-25 mb-1">{String(p.rank).padStart(2, "0")}</div>
              <div className="font-serif text-[0.95rem] font-medium leading-tight mb-2 min-h-[2.5rem]">{p.name}</div>
              <div className="font-mono text-xs text-[var(--text-muted)] mb-2">{formatINR(p.price)}</div>
              <p className="text-xs text-[var(--text-muted)] leading-snug line-clamp-3">{p.verdict}</p>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
