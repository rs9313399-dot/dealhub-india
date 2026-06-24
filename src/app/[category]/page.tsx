import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/data/products";
import { CategoryRouteWrapper } from "@/components/dealhub/CategoryRouteWrapper";
import { Analytics } from "@vercel/analytics/next";
import { absoluteUrl, categoryImagePath } from "@/lib/site";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  const title = `${category.name} — Tested & Ranked | DealHub India`;
  const description = `${category.testedCount} products tested, 5 made the cut. ${category.tagline}. ${category.intro.slice(0, 120)}…`;
  const canonical = absoluteUrl(`/${category.slug}`);
  const imagePath = categoryImagePath(category.slug);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "DealHub India",
      locale: "en_IN",
      images: [
        {
          url: imagePath,
          width: 1344,
          height: 768,
          alt: `${category.name} — DealHub India editorial guide`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
  };
}

export default async function CategoryRoute({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = getCategory(slug);

  if (!category) return notFound();

  return (
    <>
      <CategoryRouteWrapper category={category} />
      <Analytics />
    </>
  );
}
