"use client";

import { categories } from "@/data/products";
import { useRouter } from "../Router";
import { SubmitProductForm } from "../Phase7";

export function AboutPage() {
  const { navigate } = useRouter();

  return (
    <div style={{ ["--accent" as string]: "var(--accent-neutral)" }}>
      <section className="border-b-2 border-[var(--text-primary)]">
        <div className="container-editorial py-10">
          <div className="flex flex-wrap items-baseline gap-3 mb-3">
            <span className="text-eyebrow">About the publication</span>
            <span className="flex-1 rule" />
            <span className="text-eyebrow">Founded 2023 · Bengaluru</span>
          </div>
          <h1 className="text-h1 mb-3 max-w-3xl">
            We test, then we write. <span className="italic font-normal">Never the other way around.</span>
          </h1>
          <p className="font-serif italic text-[1.15rem] text-[var(--text-muted)] max-w-2xl">
            DealHub India is a small editorial team reviewing budget gadgets the way consumer magazines used to — anonymously bought, multi-week tested, honestly written.
          </p>
        </div>
      </section>

      <div className="container-editorial py-10">
        {/* Methodology */}
        <section className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 mb-14">
          <div>
            <div className="text-eyebrow mb-2">Methodology</div>
            <h2 className="text-h2">How we test</h2>
          </div>
          <div className="space-y-5 text-[1.05rem] leading-[1.75] max-w-3xl">
            <p className="dropcap">
              Every product on DealHub India is bought anonymously — either retail or via the same affiliate links you see — and lives with an editor for two to six weeks before a single word is written. We do not accept review units from brands for the products we rank. If a brand insists on sending a sample, it goes into a separate &quot;sponsored first look&quot; stream that never enters the ranked guides.
            </p>
            <p>
              Each category has its own test protocol — smartwatches get a 14-day wear cycle with reference HR and SpO2 devices; power banks are discharged into a calibrated dummy load to measure real mAh; desk lamps are slow-mo captured for flicker and lux-metered for uniformity; gaming peripherals are opened up and latency-tested across 3 months of actual gameplay; trimmers are run across three beard types and re-sharpening cycles. The numbers in our spec tables are measured, not transcribed from spec sheets.
            </p>
            <p>
              Products are ranked on a simple principle: would the editor still recommend this to a friend at full price, six months later? If the answer is &quot;with caveats&quot;, those caveats are the first thing you read — not buried in a footnote. We demote and promote based on long-term reader feedback and our own retests; the publish log on the front page is real, not decorative.
            </p>
          </div>
        </section>

        {/* Three pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 border-y border-[var(--border)] py-10">
          {[
            { n: "01", t: "Anonymous purchase", d: "No review units, no brand seeding. If we can't buy it like a normal customer, we don't rank it." },
            { n: "02", t: "Multi-week testing", d: "Two to six weeks per product, in real Indian conditions — heat, dust, power cuts, commute, the works." },
            { n: "03", t: "Honest demotion", d: "Products drop from the list when they stop earning it. Reader reports trigger retests within 30 days." },
          ].map((p) => (
            <div key={p.n} className="border-l-2 border-[var(--text-primary)] pl-5">
              <div className="rank-number !text-4xl !opacity-25 mb-2">{p.n}</div>
              <h3 className="font-serif text-[1.2rem] font-medium mb-2">{p.t}</h3>
              <p className="text-[0.95rem] leading-relaxed text-[var(--text-muted)]">{p.d}</p>
            </div>
          ))}
        </section>

        {/* Team */}
        <section className="mb-14">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-eyebrow">The editorial team</span>
            <span className="flex-1 rule" />
            <span className="text-eyebrow">Four humans, no AI writers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: "Aarav Mehta", role: "Editor-in-chief", cats: "Smartwatches, Desk Setup", bio: "Ex-Wirecutter contributor. Lives with three watches on rotation. Refuses to recommend anything he wouldn't gift his mother." },
              { name: "Priya Nair", role: "Senior reviewer", cats: "Power Banks, Desk Setup", bio: "Electrical engineer by training. Built the dummy-load rig in her garage. Will fact-check your mAh claim at parties." },
              { name: "Kabir Singh", role: "Gaming & peripherals", cats: "Gaming Peripherals", bio: "Immortal rank, Valorant. Has opened more keyboards than most people have owned. Hates RGB on principle." },
              { name: "Meera Iyer", role: "Lifestyle & grooming", cats: "Grooming, Smartwatches", bio: "Trained cosmetologist. Tests trimmers on three beard types — stubble, full, body. Maintains the blade-sharpness retention log." },
            ].map((m) => (
              <div key={m.name} className="border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="font-mono text-xs text-[var(--text-muted)] mb-1">{m.role}</div>
                <div className="font-serif text-[1.2rem] font-medium mb-1">{m.name}</div>
                <div className="text-eyebrow mb-3">{m.cats}</div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ethics / money */}
        <section className="mb-14 border-t border-[var(--border)] pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
            <div>
              <div className="text-eyebrow mb-2">How we make money</div>
              <h2 className="text-h2">The affiliate question</h2>
            </div>
            <div className="space-y-4 text-[1.02rem] leading-[1.75] max-w-3xl">
              <p>
                DealHub India earns a commission when you buy through the Amazon, Flipkart or Croma links on our product pages. This is standard for editorial review sites and does not add to your cost. What it does <em>not</em> do is influence our rankings.
              </p>
              <p>
                We do not accept paid placements in the ranked guides. We do not let brands see reviews before publication. We do not &quot;adjust&quot; a ranking because a brand threatens to pull affiliate partnership — and two have, in our short history. We are small enough to afford that luxury.
              </p>
              <p>
                If you want to support us without clicking affiliate links, sharing a guide with one friend who needs it is worth more to us than the commission. We mean that.
              </p>
            </div>
          </div>
        </section>

        {/* Contact + categories */}
        <section className="border-t border-[var(--border)] pt-10 mb-10">
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-eyebrow">Jump back into the guides</span>
            <span className="flex-1 rule" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => navigate({ name: "category", slug: c.slug })}
                className="text-left p-4 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-tint)] transition-colors"
                style={{ borderTop: `3px solid ${c.accent}` }}
              >
                <div className="font-serif text-[0.95rem] font-medium leading-tight mb-1">{c.hero}</div>
                <div className="text-xs text-[var(--text-muted)]">{c.testedCount} tested</div>
              </button>
            ))}
          </div>
        </section>

        {/* Submit a product for review */}
        <section className="mb-10">
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-eyebrow">Reader submissions</span>
            <span className="flex-1 rule" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 items-start">
            <div>
              <h3 className="text-h2 mb-3">Suggest a product for us to test</h3>
              <p className="text-[1rem] leading-relaxed text-[var(--text-muted)] mb-4">
                Spotted a budget gadget we haven&apos;t reviewed? Think a product deserves a spot in one of our guides? Tell us about it.
              </p>
              <p className="text-sm text-[var(--text-muted)] mb-2">
                We prioritise products that:
              </p>
              <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc pl-5">
                <li>Are genuinely available in India (Amazon/Flipkart/Croma)</li>
                <li>Fit one of our 5 category budgets</li>
                <li>Have enough reader interest (multiple submissions help)</li>
              </ul>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-4">
                We read every submission. If we test yours, we&apos;ll email you when the review goes live.
              </p>
            </div>
            <SubmitProductForm />
          </div>
        </section>
      </div>
    </div>
  );
}
