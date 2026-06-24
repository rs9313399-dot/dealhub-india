"use client";

import { useRouter, type Route } from "./Router";
import { categories } from "@/data/products";
import { useEffect, useState } from "react";
import { GlobalSearch } from "./Phase3";
import { ThemeToggle } from "./Phase4";

const navItems: { label: string; route: Route }[] = [
  { label: "Best Of", route: { name: "best-of" } },
  { label: "Deals", route: { name: "deals" } },
  { label: "Watchlist", route: { name: "watchlist" } },
  { label: "Smartwatches", route: { name: "category", slug: "smartwatches" } },
  { label: "Gaming", route: { name: "category", slug: "gaming-peripherals" } },
  { label: "Desk Setup", route: { name: "category", slug: "desk-setup" } },
  { label: "Power Banks", route: { name: "category", slug: "powerbanks" } },
  { label: "Grooming", route: { name: "category", slug: "grooming" } },
  { label: "About", route: { name: "about" } },
];

function isActive(current: Route, item: Route): boolean {
  if (current.name !== item.name) return false;
  if (current.name === "category" && item.name === "category") {
    return current.slug === item.slug;
  }
  return true;
}

export function Header() {
  const { route, navigate } = useRouter();

  return (
    <header className="border-b-2 border-[var(--text-primary)]">
      <div className="container-editorial pt-6 pb-3">
        {/* Top meta row */}
        <div className="flex items-center justify-between text-eyebrow mb-4 gap-3">
          <span>Vol. III &middot; Issue 47</span>
          <span className="hidden sm:inline">Tested in India &middot; No paid placements</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            <ThemeToggle />
          </div>
        </div>

        {/* Masthead */}
        <button
          onClick={() => navigate({ name: "home" })}
          className="text-left w-full group"
          aria-label="DealHub India home"
        >
          <h1 className="text-masthead leading-none group-hover:opacity-80 transition-opacity">
            DealHub <span className="italic font-normal">India</span>
          </h1>
        </button>

        {/* Sub-masthead tagline + search */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-[var(--text-muted)]">
            <span className="font-serif italic">Budget gadgets, properly tested.</span>
            <span className="hidden sm:inline text-[var(--border)]">|</span>
            <span className="font-mono text-xs">5 categories &middot; 121 products tested &middot; 4 editors</span>
          </div>
          <div className="hidden md:block"><GlobalSearch /></div>
        </div>
      </div>

      {/* Nav row */}
      <nav className="border-t border-[var(--border)] bg-[var(--bg-primary)]">
        <div className="container-editorial">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 py-2.5">
            <li>
              <button
                onClick={() => navigate({ name: "home" })}
                className="nav-link"
                aria-current={route.name === "home" ? "page" : undefined}
              >
                Front Page
              </button>
            </li>
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => navigate(item.route)}
                  className="nav-link"
                  aria-current={isActive(route, item.route) ? "page" : undefined}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li className="md:hidden ml-auto w-full sm:w-auto">
              <GlobalSearch />
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export function StickyMiniNav() {
  const { route, navigate } = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 480);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const label =
    route.name === "home"
      ? "Front Page"
      : route.name === "about"
      ? "About"
      : route.name === "category"
      ? (categories.find((c) => c.slug === route.slug)?.name ?? "")
      : route.name === "best-of"
      ? "Best Of"
      : route.name === "deals"
      ? "Deals"
      : route.name === "watchlist"
      ? "Watchlist"
      : route.name === "search"
      ? `Search: ${route.query}`
      : route.name === "product"
      ? "Product Review"
      : "";

  return (
    <div className={`sticky-mini ${visible ? "visible" : ""}`}>
      <div className="container-editorial flex items-center justify-between py-2.5 gap-3">
        <button
          onClick={() => navigate({ name: "home" })}
          className="font-serif text-base font-semibold tracking-tight shrink-0"
        >
          DealHub <span className="italic font-normal">India</span>
        </button>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-eyebrow opacity-70 hidden lg:inline shrink-0">You are in</span>
          <span className="font-mono text-xs uppercase tracking-wider opacity-90 shrink-0">{label}</span>
          <div className="hidden md:block ml-auto" style={{ maxWidth: 280 }}><GlobalSearch /></div>
        </div>
      </div>
    </div>
  );
}

export function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        <span>Fire-Boltt Phoenix Pro · ₹1,799 <span className="dot">●</span></span>
        <span>Ambrane 10000mAh Stylo · ₹799 <span className="dot">●</span></span>
        <span>Philips BT1232 Trimmer · ₹899 <span className="dot">●</span></span>
        <span>Redragon Kumara Combo · ₹1,399 <span className="dot">●</span></span>
        <span>Philips Air 5W Lamp · ₹1,299 <span className="dot">●</span></span>
        <span>Mi Power Bank 3i 20K · ₹1,449 <span className="dot">●</span></span>
        <span>Fire-Boltt Phoenix Pro · ₹1,799 <span className="dot">●</span></span>
        <span>Ambrane 10000mAh Stylo · ₹799 <span className="dot">●</span></span>
        <span>Philips BT1232 Trimmer · ₹899 <span className="dot">●</span></span>
        <span>Redragon Kumara Combo · ₹1,399 <span className="dot">●</span></span>
        <span>Philips Air 5W Lamp · ₹1,299 <span className="dot">●</span></span>
        <span>Mi Power Bank 3i 20K · ₹1,449 <span className="dot">●</span></span>
      </div>
    </div>
  );
}
