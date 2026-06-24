"use client";

import { usePathname } from "next/navigation";
import type { Category } from "@/data/products";
import { getCategory, isDirectCategorySlug } from "@/data/products";
import { RouterProvider } from "./Router";
import { Header, StickyMiniNav, Ticker } from "./Header";
import { Footer } from "./Footer";
import { ThemeProvider } from "./Phase4";
import { KeyboardShortcutsHelp } from "./Phase6";

type DealHubShellProps = {
  children: React.ReactNode;
  /** Passed from the server on direct category routes for reliable SSR. */
  category?: Category;
};

export function DealHubShell({ children, category }: DealHubShellProps) {
  const pathname = usePathname() ?? "/";
  const slugFromPath = pathname.replace(/^\//, "");
  const resolvedCategory = category ?? (isDirectCategorySlug(slugFromPath) ? getCategory(slugFromPath) : undefined);
  const isDirectCategory = !!resolvedCategory && pathname === `/${resolvedCategory.slug}`;

  return (
    <ThemeProvider>
      <RouterProvider
        initialRoute={isDirectCategory ? { name: "category", slug: resolvedCategory.slug } : undefined}
        disableHashSync={isDirectCategory}
      >
        <div className="min-h-screen flex flex-col" suppressHydrationWarning>
          <StickyMiniNav />
          <Header />
          <Ticker />
          <main className="flex-1">{children}</main>
          <Footer />
          <KeyboardShortcutsHelp />
        </div>
      </RouterProvider>
    </ThemeProvider>
  );
}
