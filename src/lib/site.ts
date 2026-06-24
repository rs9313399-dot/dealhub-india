/** Canonical site URL — set NEXT_PUBLIC_SITE_URL in .env.local for production. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://dealhub-india.vercel.app";

/** Maps category slug to the filename under /images/categories/. */
export function categoryImageFilename(slug: string): string {
  if (slug === "gaming-peripherals") return "gaming";
  if (slug === "desk-setup") return "desk";
  return slug;
}

export function categoryImagePath(slug: string): string {
  return `/images/categories/${categoryImageFilename(slug)}.png`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
