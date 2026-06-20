"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { categories, getCategory } from "@/data/products";

export type Route =
  | { name: "home" }
  | { name: "category"; slug: string }
  | { name: "about" }
  | { name: "best-of" }
  | { name: "deals" }
  | { name: "watchlist" }
  | { name: "search"; query: string }
  | { name: "product"; categorySlug: string; rank: number }
  | { name: "archive" }
  | { name: "admin" };

type RouterCtx = {
  route: Route;
  navigate: (route: Route) => void;
};

const Ctx = createContext<RouterCtx | null>(null);

function parseHash(): Route | null {
  if (typeof window === "undefined") return { name: "home" };
  const raw = window.location.hash;
  // Only hashes starting with "#/" are routes; everything else is an in-page anchor.
  if (!raw.startsWith("#/")) {
    return null; // signal "no route change" — handled by caller
  }
  const h = raw.replace(/^#\/?/, "");
  if (!h || h === "home") return { name: "home" };
  if (h === "about") return { name: "about" };
  if (h === "best-of") return { name: "best-of" };
  if (h === "deals") return { name: "deals" };
  if (h === "watchlist") return { name: "watchlist" };
  if (h === "archive") return { name: "archive" };
  if (h === "admin") return { name: "admin" };
  if (h.startsWith("search/")) {
    return { name: "search", query: decodeURIComponent(h.slice("search/".length)) };
  }
  if (h.startsWith("product/")) {
    const rest = h.slice("product/".length);
    const parts = rest.split("/");
    if (parts.length === 2) {
      const rank = Number(parts[1]);
      if (Number.isFinite(rank) && rank > 0) {
        return { name: "product", categorySlug: decodeURIComponent(parts[0]), rank };
      }
    }
  }
  return { name: "category", slug: h };
}

// Keep a module-level cache so anchor-only hash changes don't reset the route.
let currentRouteCache: Route = { name: "home" };

function toHash(route: Route): string {
  if (route.name === "home") return "#/home";
  if (route.name === "about") return "#/about";
  if (route.name === "best-of") return "#/best-of";
  if (route.name === "deals") return "#/deals";
  if (route.name === "watchlist") return "#/watchlist";
  if (route.name === "archive") return "#/archive";
  if (route.name === "admin") return "#/admin";
  if (route.name === "search") return `#/search/${encodeURIComponent(route.query)}`;
  if (route.name === "product") return `#/product/${encodeURIComponent(route.categorySlug)}/${route.rank}`;
  return `#/${route.slug}`;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  // Start with home to match SSR output; the mount effect syncs the real hash.
  const [route, setRoute] = useState<Route>({ name: "home" });

  useEffect(() => {
    const applyHash = () => {
      const parsed = parseHash();
      if (parsed === null) {
        // In-page anchor change — keep current route, let the browser handle the scroll.
        return;
      }
      currentRouteCache = parsed;
      setRoute((prev) => {
        // Same route name + same distinguishing field = no change needed
        if (prev.name !== parsed.name) return parsed;
        if (prev.name === "category" && parsed.name === "category") {
          return prev.slug === parsed.slug ? prev : parsed;
        }
        if (prev.name === "search" && parsed.name === "search") {
          return prev.query === parsed.query ? prev : parsed;
        }
        if (prev.name === "product" && parsed.name === "product") {
          return prev.categorySlug === parsed.categorySlug && prev.rank === parsed.rank ? prev : parsed;
        }
        return parsed;
      });
    };
    const onHash = () => {
      applyHash();
      // Only scroll-to-top on actual route changes (not in-page anchors)
      const parsed = parseHash();
      if (parsed !== null) {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };
    window.addEventListener("hashchange", onHash);
    // Initialize hash if empty
    if (!window.location.hash) {
      window.history.replaceState(null, "", "#/home");
    }
    // On mount, sync state with the current hash (handles direct loads with #/route)
    applyHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((r: Route) => {
    const target = toHash(r);
    if (window.location.hash === target) {
      // Same route — just scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = target;
  }, []);

  return <Ctx.Provider value={{ route, navigate }}>{children}<RouteMeta route={route} /></Ctx.Provider>;
}

/** Updates document.title + meta description per route (client-side, for hash router) */
function RouteMeta({ route }: { route: Route }) {
  useEffect(() => {
    const titles: Record<string, string> = {
      home: "DealHub India — Tested Deals, Honest Reviews",
      "best-of": "Best of DealHub India — The #1 Pick From Each Category",
      deals: "Deals Under ₹X — All 25 Tested Products, Filtered | DealHub India",
      watchlist: "Your Watchlist — Price Alerts & Recently Viewed | DealHub India",
      archive: "Newsletter Archive — Past Deal Alerts | DealHub India",
      admin: "Editorial Tools — Submissions Moderation | DealHub India",
      about: "About DealHub India — How We Test, Who We Are",
    };
    const descriptions: Record<string, string> = {
      home: "Budget gadgets, properly tested. Smartwatches, gaming gear, desk lamps, power banks, trimmers — reviewed over multi-week cycles.",
      "best-of": "The one pick from each of our 5 categories that we'd actually buy. Tested over multi-week cycles, ranked honestly.",
      deals: "Filter all 25 tested products across 5 categories by price and discount. Every product survived multi-week testing.",
      watchlist: "Your price alerts, recently viewed products, and compare tray — all in one place.",
      archive: "Every weekly deal-alert email we've sent, archived for reference.",
      admin: "Editorial moderation dashboard for product submissions.",
      about: "How DealHub India tests products, who runs the site, and our affiliate disclosure.",
    };

    let title = titles[route.name] || "DealHub India";
    let desc = descriptions[route.name] || descriptions.home;

    if (route.name === "category") {
      const cat = getCategory(route.slug);
      if (cat) {
        title = `${cat.name} — Tested & Ranked | DealHub India`;
        desc = `${cat.testedCount} products tested, 5 made the cut. ${cat.tagline}.`;
      }
    } else if (route.name === "search") {
      title = `Search: ${route.query} | DealHub India`;
      desc = `Search results for "${route.query}" across all 25 tested products.`;
    } else if (route.name === "product") {
      const cat = getCategory(route.categorySlug);
      const product = cat?.products.find((p) => p.rank === route.rank);
      if (product && cat) {
        title = `${product.name} — Review & Price History | DealHub India`;
        desc = `${product.verdict} Tested ${product.testWeeks} weeks. ${formatINR_meta(product.price)} — ${product.bestFor || ""}`;
      }
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);
  }, [route]);

  return null;
}

function formatINR_meta(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function useRouter() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRouter must be inside RouterProvider");
  return ctx;
}
