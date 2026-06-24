"use client";

import { Category } from "@/data/products";
import { DealHubShell } from "./DealHubShell";
import { CategoryPage } from "./pages/CategoryPage";

export function CategoryRouteWrapper({ category }: { category: Category }) {
  return (
    <DealHubShell category={category}>
      <CategoryPage category={category} />
    </DealHubShell>
  );
}
