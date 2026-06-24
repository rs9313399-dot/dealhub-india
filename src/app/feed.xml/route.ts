import { categories } from "@/data/products";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

// Build the publish log entries (same as the home page publish log)
const publishLog = [
  { date: "12 Nov 2025", cat: "Smartwatches", title: "Re-tested Fire-Boltt Phoenix Pro after v4.2 firmware update", editor: "Aarav" },
  { date: "11 Nov 2025", cat: "Power Banks", title: "Added Mi Power Bank 3i long-term capacity retention data", editor: "Priya" },
  { date: "10 Nov 2025", cat: "Gaming", title: "Cosmic Byte Equinox Kronos promoted to #3 after 3-month retest", editor: "Kabir" },
  { date: "9 Nov 2025", cat: "Grooming", title: "boAt Misfit T200 demoted — blade pulling reported by 4 readers", editor: "Meera" },
  { date: "7 Nov 2025", cat: "Desk Setup", title: "Otus Eye-Care Pro added after CRI Ra 90+ verification", editor: "Aarav" },
  { date: "5 Nov 2025", cat: "Smartwatches", title: "Crossbeats Nexus demoted — software stutter unacceptable at #2", editor: "Kabir" },
  { date: "3 Nov 2025", cat: "Power Banks", title: "Anker Redux review refreshed; USB-C omission noted prominently", editor: "Priya" },
  { date: "1 Nov 2025", cat: "Grooming", title: "Nova NHT-1053 added as ultra-budget fallback option", editor: "Meera" },
];

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

export function GET() {
  const items = publishLog
    .map(
      (entry) => `    <item>
      <title>${escapeXml(entry.title)}</title>
      <category>${escapeXml(entry.cat)}</category>
      <dc:creator>${escapeXml(entry.editor)}</dc:creator>
      <pubDate>${new Date(entry.date).toUTCString()}</pubDate>
      <guid isPermaLink="false">dealhub-${escapeXml(entry.date)}-${escapeXml(entry.cat)}</guid>
      <description>${escapeXml(entry.title)} — by ${escapeXml(entry.editor)}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>DealHub India — Recently Updated</title>
    <link>${SITE_URL}</link>
    <description>Latest guide updates, retests, and ranking changes from the DealHub India editorial team. Budget gadgets tested over multi-week cycles.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>360</ttl>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
