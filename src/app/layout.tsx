import type { Metadata } from "next";
import { Fraunces, Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DealHub India — Tested Deals, Honest Reviews",
  description:
    "DealHub India tests and reviews budget gadgets under ₹3000 — smartwatches, gaming peripherals, desk lamps, power banks and trimmers. Hinglish reviews, real specs, no fluff.",
  keywords: [
    "best smartwatch under 3000",
    "gaming mouse under 1500",
    "desk lamp india",
    "power bank under 1500",
    "trimmer under 1000",
    "deal reviews india",
  ],
  authors: [{ name: "DealHub India Editorial" }],
  metadataBase: new URL("https://dealhub.in"),
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  alternates: {
    canonical: "https://dealhub.in",
  },
  openGraph: {
    title: "DealHub India — Tested Deals, Honest Reviews",
    description: "Budget gadgets, properly tested. Smartwatches, gaming gear, desk lamps, power banks, trimmers — reviewed over multi-week cycles.",
    type: "website",
    siteName: "DealHub India",
    locale: "en_IN",
    url: "https://dealhub.in",
    images: [
      { url: "/images/categories/smartwatches.png", width: 1344, height: 768, alt: "DealHub India — editorial product photography" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DealHub India",
    description: "Budget gadgets, properly tested. No paid placements.",
    images: ["/images/categories/smartwatches.png"],
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DealHub India",
  url: "https://dealhub.in",
  description: "Editorial affiliate deals website covering budget gadgets for the Indian market. Products are bought anonymously, tested over multi-week cycles, and reviewed honestly.",
  foundingDate: "2023",
  areaServed: "IN",
  knowsLanguage: ["en", "hi"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560038",
    addressCountry: "IN",
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function s(){document.querySelectorAll('[fdprocessedid]').forEach(function(e){e.removeAttribute('fdprocessedid')});document.querySelectorAll('[style]').forEach(function(e){var s=e.getAttribute('style');if(s&&s.indexOf('darkreader')!==-1){e.setAttribute('style',s.replace(/--darkreader[^;]*;?/g,'').replace(/;\\s*;/g,';').replace(/^;|;$/g,''))}});['data-darkreader-inline-bg','data-darkreader-inline-color','data-darkreader-inline-bgimage','data-darkreader-inline-bgcolor','data-darkreader-inline-border-top','data-darkreader-inline-border-right','data-darkreader-inline-border-bottom','data-darkreader-inline-border-left'].forEach(function(a){document.querySelectorAll('['+a+']').forEach(function(e){e.removeAttribute(a)})})}s();setTimeout(s,0);var o=new MutationObserver(function(m){m.forEach(function(r){if(r.type==='attributes'&&(r.attributeName==='fdprocessedid'||(r.attributeName||'').indexOf('darkreader')!==-1)){s()}})});if(document.documentElement)o.observe(document.documentElement,{attributes:true,subtree:true})})();`,
          }}
        />
      </head>
      <body
        className={`${fraunces.variable} ${sourceSans.variable} ${plexMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
