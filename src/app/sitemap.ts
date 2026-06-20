import type { MetadataRoute } from "next";
import { categories } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://dealhub.in";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/#/home`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/#/best-of`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/#/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/#/${c.slug}`,
    lastModified: new Date(c.lastUpdated),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
