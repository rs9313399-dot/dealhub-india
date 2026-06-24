"use client";

import { useRouter } from "@/components/dealhub/Router";
import { DealHubShell } from "@/components/dealhub/DealHubShell";
import { HomePage } from "@/components/dealhub/pages/HomePage";
import { CategoryPage } from "@/components/dealhub/pages/CategoryPage";
import { AboutPage } from "@/components/dealhub/pages/AboutPage";
import { BestOfPage } from "@/components/dealhub/Phase4";
import { DealsPage } from "@/components/dealhub/Phase5";
import { WatchlistPage, SearchResultsPage } from "@/components/dealhub/Phase6";
import { ProductDetailPage } from "@/components/dealhub/Phase7";
import { AdminPage, NewsletterArchivePage } from "@/components/dealhub/Phase8";
import { getCategory } from "@/data/products";
import { Analytics } from "@vercel/analytics/next";

function CurrentView() {
  const { route } = useRouter();

  if (route.name === "home") return <HomePage />;
  if (route.name === "about") return <AboutPage />;
  if (route.name === "best-of") return <BestOfPage />;
  if (route.name === "deals") return <DealsPage />;
  if (route.name === "watchlist") return <WatchlistPage />;
  if (route.name === "search") return <SearchResultsPage query={route.query} />;
  if (route.name === "product") return <ProductDetailPage categorySlug={route.categorySlug} rank={route.rank} />;
  if (route.name === "archive") return <NewsletterArchivePage />;
  if (route.name === "admin") return <AdminPage />;
  if (route.name === "category") {
    const category = getCategory(route.slug);
    if (!category) return <HomePage />;
    return <CategoryPage category={category} />;
  }
  return <HomePage />;
}

export default function Home() {
  return (
    <>
      <DealHubShell>
        <CurrentView />
      </DealHubShell>
      <Analytics />
    </>
  );
}
