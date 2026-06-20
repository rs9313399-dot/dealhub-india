"use client";

import { useRouter, type Route } from "./Router";
import { categories } from "@/data/products";
import { NewsletterApi } from "./Phase3";

export function Footer() {
  const { navigate } = useRouter();

  const go = (r: Route) => () => navigate(r);

  return (
    <footer className="mt-auto bg-[var(--bg-dark)] text-[var(--bg-primary)]">
      {/* Compact newsletter strip at top of footer */}
      <NewsletterApi variant="compact" source="footer" />

      <div className="container-editorial py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Categories */}
          <div>
            <h4 className="text-eyebrow mb-4 text-[var(--bg-primary)] opacity-70">Categories</h4>
            <ul className="space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={go({ name: "category", slug: c.slug })}
                    className="text-[var(--bg-primary)]/80 hover:text-[var(--bg-primary)] hover:underline text-left"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-eyebrow mb-4 text-[var(--bg-primary)] opacity-70">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={go({ name: "best-of" })} className="text-[var(--bg-primary)]/80 hover:text-[var(--bg-primary)] hover:underline text-left">Best of DealHub</button></li>
              <li><button onClick={go({ name: "deals" })} className="text-[var(--bg-primary)]/80 hover:text-[var(--bg-primary)] hover:underline text-left">Deals under ₹X</button></li>
              <li><button onClick={go({ name: "watchlist" })} className="text-[var(--bg-primary)]/80 hover:text-[var(--bg-primary)] hover:underline text-left">Your Watchlist</button></li>
              <li><button onClick={go({ name: "archive" })} className="text-[var(--bg-primary)]/80 hover:text-[var(--bg-primary)] hover:underline text-left">Newsletter archive</button></li>
              <li><button onClick={go({ name: "about" })} className="text-[var(--bg-primary)]/80 hover:text-[var(--bg-primary)] hover:underline text-left">Methodology</button></li>
              <li><button onClick={go({ name: "about" })} className="text-[var(--bg-primary)]/80 hover:text-[var(--bg-primary)] hover:underline text-left">How we test</button></li>
              <li><button onClick={go({ name: "about" })} className="text-[var(--bg-primary)]/80 hover:text-[var(--bg-primary)] hover:underline text-left">The editorial team</button></li>
              <li><button onClick={go({ name: "about" })} className="text-[var(--bg-primary)]/80 hover:text-[var(--bg-primary)] hover:underline text-left">Contact editors</button></li>
              <li><button onClick={go({ name: "admin" })} className="text-[var(--bg-primary)]/50 hover:text-[var(--bg-primary)] hover:underline text-left text-xs">Editorial tools</button></li>
            </ul>
          </div>

          {/* Affiliate Disclosure */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-eyebrow mb-4 text-[var(--bg-primary)] opacity-70">Affiliate Disclosure</h4>
            <p className="text-sm text-[var(--bg-primary)]/70 leading-relaxed">
              DealHub India participates in affiliate programs of Amazon, Flipkart and Croma.
              When you buy through links on our site, we may earn a commission at no extra cost to you.
              This never influences our rankings — products are bought anonymously or borrowed,
              tested across multi-week cycles, and only then considered for inclusion.
              <span className="block mt-2 text-[var(--bg-primary)]/50 text-xs font-mono">
                Reviews are written before any affiliate link is generated.
              </span>
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-eyebrow mb-4 text-[var(--bg-primary)] opacity-70">Contact</h4>
            <ul className="space-y-2 text-sm text-[var(--bg-primary)]/80">
              <li>editors@dealhub.in</li>
              <li>press@dealhub.in</li>
              <li className="pt-2 text-xs font-mono text-[var(--bg-primary)]/50">
                Editorial office:<br />Indiranagar, Bengaluru 560038
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-5 border-t border-[var(--bg-primary)]/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs font-mono text-[var(--bg-primary)]/50">
            © 2025 DealHub India. All reviews original. No content syndicated.
          </p>
          <div className="flex items-center gap-4">
            <a href="/feed.xml" className="text-xs font-mono text-[var(--bg-primary)]/50 hover:text-[var(--bg-primary)] underline" target="_blank" rel="noopener">
              RSS feed
            </a>
            <p className="text-xs font-mono text-[var(--bg-primary)]/50">
              Last site-wide update: 12 Nov 2025 &middot; v3.7.1
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
