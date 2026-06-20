export type Product = {
  rank: number;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  rating: number;
  testWeeks: number;
  specs: { label: string; value: string }[];
  review: string[]; // 2 paragraphs
  pullquote: string;
  pros: string[];
  cons: string[];
  verdict: string;
  imageLabel: string;
  aspect: string; // css aspect ratio
  priceHistory?: number[]; // 6-month price trend (monthly), last value = current price
  testedOn?: string; // ISO date when last tested
  bestFor?: string; // short "best for X" recommendation tag
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  accent: string;
  accentVar: string;
  accentSoft: string;
  testedCount: number;
  lastUpdated: string;
  hero: string;
  intro: string;
  topPickRank: number;
  products: Product[];
  faqs: { q: string; a: string }[];
  comparisonCols: string[];
};

// Deterministic pseudo-random based on a string seed (so price history is stable across renders)
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

function genPriceHistory(name: string, currentPrice: number): number[] {
  // 6 monthly points ending at currentPrice. Trend oscillates ±15% around current.
  const rng = seeded(name);
  const points: number[] = [];
  const start = currentPrice * (1.08 + rng() * 0.12); // started 8-20% higher 6 months ago
  for (let i = 0; i < 5; i++) {
    const t = i / 5;
    // base trend downward from start to current, plus noise
    const base = start + (currentPrice - start) * t;
    const noise = (rng() - 0.5) * currentPrice * 0.1;
    points.push(Math.round(base + noise));
  }
  points.push(currentPrice);
  return points;
}

// Generate a deterministic testedOn date per product, spread across the last ~6 weeks.
// Base date is 2025-11-12 (the site's "last updated" date); each product gets a different
// day offset based on its name hash, so the "recently updated" sort is meaningful.
function genTestedOn(name: string): string {
  const rng = seeded(name + "-tested");
  const offset = Math.floor(rng() * 42); // 0-41 days back
  const base = new Date("2025-11-12T00:00:00Z");
  base.setUTCDate(base.getUTCDate() - offset);
  return base.toISOString().slice(0, 10);
}

const mk = (p: Partial<Product> & { rank: number; name: string; brand: string; price: number }): Product => {
  const price = p.price!;
  return {
    mrp: Math.round(price * 1.4),
    rating: 4,
    testWeeks: 2,
    specs: [],
    review: [],
    pullquote: "",
    pros: [],
    cons: [],
    verdict: "",
    imageLabel: p.name,
    aspect: "4 / 3",
    ...p,
    priceHistory: p.priceHistory ?? genPriceHistory(p.name, price),
    testedOn: p.testedOn ?? genTestedOn(p.name),
    bestFor: p.bestFor ?? (p.rank === 1 ? "Best overall" : p.rank === 2 ? "Best value" : p.rank === 3 ? "Best budget" : p.rank === 4 ? "Best for specific needs" : "Honorable mention"),
  };
};

export const categories: Category[] = [
  {
    id: "smartwatches",
    slug: "smartwatches",
    name: "Smartwatches under ₹3,000",
    tagline: "Budget wrists, tested over 14-day cycles",
    accent: "#2e5266",
    accentVar: "--accent-smartwatches",
    accentSoft: "#e6edeF",
    testedCount: 23,
    lastUpdated: "12 Nov 2025",
    hero: "Smartwatches",
    topPickRank: 1,
    intro:
      "Smartwatch segment ne 2024-25 mein explosion kiya — har doosre brand se ek model aata hai, aur ₹3,000 ke neeche zyada tar calling + notification devices hain, proper fitness trackers nahi. Humne 23 models ko 14-din ka cycle mein test kiya — har watch ko real commute, gym session aur raat ki sleep tracking ke saath. Brightness outdoor mein, SpO2 ki accuracy, aur charging time ne zyada watches ko eliminate kar diya. Jo paanch baache, woh genuinely value de rahe hain.",
    products: [
      mk({
        rank: 1,
        name: "Fire-Boltt Phoenix Pro",
        brand: "Fire-Boltt",
        price: 1799,
        rating: 4.2,
        testWeeks: 3,
        aspect: "4 / 5",
        bestFor: "Best for calling on a budget",
        imageLabel: "Phoenix Pro · 1.39\" TFT",
        specs: [
          { label: "Display", value: "1.39\" TFT, 240×240" },
          { label: "Battery", value: "7 days / 2hr charge" },
          { label: "Water rating", value: "IP67" },
          { label: "Calling", value: "Yes, BT + dialpad" },
          { label: "Sensors", value: "HR, SpO2, accel" },
          { label: "Strap", value: "Silicone" },
          { label: "Weight", value: "48 g" },
          { label: "Sports modes", value: "120+" },
        ],
        review: [
          "Phoenix Pro ₹3,000 ke neeche ka most sensible all-rounder hai. Calling clarity actually kaam kar jaati hai quiet room mein — caller dusre end se thoda \"room-like\" sunta hai but samajh aa jaata hai. Display brightness indoor mein crisp hai, lekin direct 12 baje ki dhoop mein text padhna thoda mushkil. HR sensor ka accuracy ±8 bpm ke around raha resting state mein, jo iss price pe acceptable hai.",
          "Battery 7 din comfortable chalti hai agar always-on display band rakho. AOD on karne se 4 din mein drop. App (Da Fit) thoda cluttered hai but sync stable hai. Strap ka quality medium hai — 6 mahine mein sweating se thoda crack aa sakta hai, ₹200 ka replacement le lena. Overall, agar tumhe calling + decent fitness tracking chahiye ₹2,000 ke around, yeh best pick hai.",
        ],
        pullquote: "Calling clarity actually kaam kar jaati hai — caller dusre end se thoda room-like sunta hai, but samajh aa jaata hai.",
        pros: [
          "BT calling ka mic genuinely usable hai indoor",
          "7-day battery with AAD off, decent for price",
          "120+ sports modes, although zyada marketing hain",
          "USB magnetic charger — no proprietary cable hunt",
        ],
        cons: [
          "Outdoor sunlight mein brightness insufficient",
          "SpO2 reading 2-3% variance deta hai vs oximeter",
          "Da Fit app cluttered, notifications thoda lag",
          "Strap 6-8 mahine mein cracking signs dikhata hai",
        ],
        verdict: "Best all-rounder under ₹2,000 with usable calling. Buy if AAD-band rakh sakte ho.",
      }),
      mk({
        rank: 2,
        name: "Noise ColorFit Pro 5",
        brand: "Noise",
        price: 2299,
        bestFor: "Best display under ₹2,500",
        rating: 4.1,
        testWeeks: 2,
        aspect: "1 / 1",
        imageLabel: "ColorFit Pro 5 · AMOLED",
        specs: [
          { label: "Display", value: "1.85\" AMOLED, 410×502" },
          { label: "Battery", value: "5 days / 1.5hr charge" },
          { label: "Water rating", value: "IP68" },
          { label: "Calling", value: "Yes, single-chip BT" },
          { label: "Sensors", value: "HR, SpO2, accel" },
          { label: "Strap", value: "Silicone + extra" },
          { label: "Weight", value: "52 g" },
          { label: "Refresh", value: "60Hz" },
        ],
        review: [
          "ColorFit Pro 5 ka USP hai uska AMOLED — deep blacks aur 60Hz refresh se UI genuinely premium lagta hai iss price pe. Brightness 550 nits peak, jo outdoor mein bhi readable hai, yahan Phoenix Pro ko hara deta hai. Calling single-chip BT se aati hai, latency kam, lekin speaker volume thoda low hai noisy environment ke liye.",
          "Battery 5 din chalti AMOLED ke saath — yeh trade-off samajh dena. Noise Fit app kaafi clean hai, sleep tracking decently accurate raha (±20 min vs hamara reference). Ek cheez jo bother ki: always-on display ka brightness band low hai, almost padhna mushkil din mein bhi. Strap do options aate hain box mein — thoughtful.",
        ],
        pullquote: "AMOLED + 60Hz refresh se UI genuinely premium lagta hai iss price pe.",
        pros: [
          "Best display in this budget, 550 nits outdoor-readable",
          "Two straps in box (silicone + woven)",
          "Noise Fit app clean, sync reliable",
          "Single-chip BT calling — low latency",
        ],
        cons: [
          "Battery only 5 days with AMOLED",
          "AOD too dim to be useful",
          "Speaker volume low for noisy streets",
          "60Hz refresh ka thoda battery penalty",
        ],
        verdict: "Display-first buyers ke liye best. Battery thoda compromise karna padega.",
      }),
      mk({
        rank: 3,
        name: "boAt Wave Call 2",
        brand: "boAt",
        price: 1499,
        rating: 3.9,
        testWeeks: 2,
        aspect: "4 / 3",
        imageLabel: "Wave Call 2 · Budget pick",
        specs: [
          { label: "Display", value: "1.83\" HD, 240×284" },
          { label: "Battery", value: "8 days / 2hr charge" },
          { label: "Water rating", value: "IP67" },
          { label: "Calling", value: "Yes, BT" },
          { label: "Sensors", value: "HR, SpO2" },
          { label: "Strap", value: "TPU" },
          { label: "Weight", value: "45 g" },
          { label: "Crown", value: "Functional" },
        ],
        review: [
          "₹1,500 ke point pe boAt Wave Call 2 ek solid value pick hai. Display TFT hai but brightness thodi better hai Phoenix Pro se. Calling works, mic thoda muffled hai but ₹1,500 mein functional calling milna itself achievement hai. Crown button functional hai — UI scroll aur navigation mein help karta hai.",
          "Battery 8 din chalti easily, yahan boAt ne thoda optimise kiya hai. App (boAt Hearth) thoda buggy raha hamare test mein — ek baar sync fail hua, force-restart se theek hua. SpO2 aur HR sensors okay-ish hain, resting HR ±6 bpm. Sports modes limited effective hain, mostly marketing. Agar strict ₹1,500 budget hai, yeh safest choice hai.",
        ],
        pullquote: "₹1,500 mein functional calling milna itself achievement hai.",
        pros: [
          "Cheapest with usable BT calling",
          "8-day battery, surprisingly efficient",
          "Functional crown button for navigation",
          "Lightweight (45g), daily wear comfortable",
        ],
        cons: [
          "Mic quality muffled on caller's end",
          "boAt Hearth app buggy, sync fails occasionally",
          "Only IP67, no swimming",
          "Sports modes mostly marketing fluff",
        ],
        verdict: "Strict-budget calling watch. App ka frustration le lo, baaki solid.",
      }),
      mk({
        rank: 4,
        name: "Fastrack Reflex Vybe",
        brand: "Fastrack",
        price: 1995,
        rating: 3.8,
        testWeeks: 2,
        aspect: "5 / 4",
        imageLabel: "Reflex Vybe · Youth pick",
        specs: [
          { label: "Display", value: "1.69\" HD, 240×280" },
          { label: "Battery", value: "10 days / 2.5hr charge" },
          { label: "Water rating", value: "5 ATM" },
          { label: "Calling", value: "No (notify only)" },
          { label: "Sensors", value: "HR, SpO2, accel" },
          { label: "Strap", value: "Silicone" },
          { label: "Weight", value: "40 g" },
          { label: "Warranty", value: "2 years" },
        ],
        review: [
          "Fastrack Reflex Vybe explicitly calling nahi karta — yeh ek proper fitness-tracker-first approach hai. 5 ATM water rating matlab tum isse swimming mein le ja sakte ho, jo iss budget mein rare hai. Battery 10 din chalti, best-in-class. Display decent hai, although sunlight mein thoda wash out ho jaata hai.",
          "Reflex World app clean hai aur Titan ka backing dikhata hai polish mein. HR + SpO2 readings reasonably stable rahi hamare 14-din test mein. Agar calling tumhe chahiye hi nahi aur fitness + notifications kaafi hain, Vybe ek thoughtful pick hai — especially students ke liye jo 2-year warranty ka peace of mind chahte hain.",
        ],
        pullquote: "5 ATM water rating matlab tum isse swimming mein le ja sakte ho, jo iss budget mein rare hai.",
        pros: [
          "5 ATM water resistance — swimming friendly",
          "Best battery (10 days) in this list",
          "2-year warranty, Titan-backed service",
          "Lightest at 40g, unobtrusive daily wear",
        ],
        cons: [
          "No calling — deal-breaker for many",
          "Display washes out in direct sun",
          "Limited watch faces vs competitors",
          "Premium pricing vs feature set",
        ],
        verdict: "No-calling fitness pick with best battery + real water rating.",
      }),
      mk({
        rank: 5,
        name: "Crossbeats Nexus",
        brand: "Crossbeats",
        price: 2799,
        rating: 3.7,
        testWeeks: 2,
        aspect: "4 / 5",
        imageLabel: "Nexus · AMOLED round",
        specs: [
          { label: "Display", value: "1.43\" AMOLED, 466×466" },
          { label: "Battery", value: "4 days / 2hr charge" },
          { label: "Water rating", value: "IP68" },
          { label: "Calling", value: "Yes, BT" },
          { label: "Sensors", value: "HR, SpO2, gyro" },
          { label: "Strap", value: "Metal + silicone" },
          { label: "Weight", value: "58 g" },
          { label: "Faces", value: "150+ cloud faces" },
        ],
        review: [
          "Crossbeats Nexus round dial wala AMOLED dikhne mein premium hai — metal strap option ke saath ₹2,800 ka price point justify karne ki koshish karta hai. Display 466×466 pixel density sharp hai, text crisp padha jaata hai. Lekin software polish ki kami dikh jaati hai — UI mein micro-stutter aate hain, gesture response thoda lag.",
          "Calling ka mic thoda better hai Noise Pro 5 se, but caller pata chal jaata hai ki smartwatch se bol rahe ho. Battery 4 din chalti AMOLED + AAD ke saath — poor. Crossbeats app ka sync occasionally drop hota hai. Build quality good hai, strap solid lagta hai. Agar tumhe round dial chahiye aur software glitches le sakte ho, try kar sakte ho.",
        ],
        pullquote: "Software polish ki kami dikh jaati hai — UI mein micro-stutter aate hain, gesture response thoda lag.",
        pros: [
          "Premium round AMOLED, sharp 466×466",
          "Metal strap included in box",
          "Calling mic better than peers",
          "150+ cloud watch faces",
        ],
        cons: [
          "Software stutter, gesture lag",
          "Battery only 4 days with AAD",
          "App sync drops occasionally",
          "Heaviest at 58g",
        ],
        verdict: "Style-first round-dial pick. Software patience maangta hai.",
      }),
    ],
    faqs: [
      {
        q: "Kya ₹3,000 ke neeche smartwatches accurate HR readings dete hain?",
        a: "Resting HR ±6-8 bpm ke around accurate hain, lekin workout ke beech mein lag aur drift aata hai. Medical-grade accuracy ke liye chest strap ya Garmin-level watch chahiye — budget watches sirf trend tracking ke liye use karo, diagnosis ke liye nahi.",
      },
      {
        q: "Calling feature kitna usable hai ₹3,000 ke neeche?",
        a: "Quiet room mein kaam kar jaata hai. Outdoor noise, traffic, ya wind mein caller ko struggle hota hai. Emergency/quick call ke liye theek hai, long conversations ke liye phone uthao.",
      },
      {
        q: "IP67 vs IP68 vs 5 ATM — kya farq hai?",
        a: "IP67 = dust + 1m water 30 min. IP68 = deeper/longer water. 5 ATM = 50m pressure, swimming/shower allowed. IP67/IP68 watches ko shower mein nahi lena chahiye long-term, 5 ATM wale safely le ja sakte ho.",
      },
      {
        q: "Battery life claims kitne realistic hain?",
        a: "Brand-claimed battery AAD band, minimal notifications ke saath measured hoti hai. Real-world 70-80% of claimed expect karo. AAD on karoge to 50% tak gir jaata hai.",
      },
      {
        q: "Service/warranty mein kaunsa brand best hai?",
        a: "Fastrack (Titan) ka service network strongest hai, 2-year warranty. Noise aur boAt ka online service request decent hai lekin turnaround 2-3 weeks. Fire-Boltt aur Crossbeats ka service inconsistent raha humse.",
      },
    ],
    comparisonCols: ["Display", "Battery", "Calling", "Water", "Weight", "Price"],
  },

  {
    id: "gaming",
    slug: "gaming-peripherals",
    name: "Gaming Mouse & Keyboards under ₹1,500",
    tagline: "Mechanical feel, budget reality",
    accent: "#8b2635",
    accentVar: "--accent-gaming",
    accentSoft: "#f5e6e8",
    testedCount: 31,
    lastUpdated: "9 Nov 2025",
    hero: "Gaming Peripherals",
    topPickRank: 1,
    intro:
      "Gaming peripherals ka ₹1,500 segment Indian market mein over-saturated hai — har brand \"RGB mechanical\" bechta hai jo actual mein membrane hota hai. Humne 19 mice aur 12 keyboards ko 3 mahine ke across Valorant, CS2 aur BGMI-emulation sessions mein test kiya. Switch feel, click latency, weight distribution aur wrist fatigue ne zyada products ko eliminate kiya. Jo paanch baache, woh real gaming ke liye kaam karte hain — sirf RGB-baazi nahi.",
    products: [
      mk({
        rank: 1,
        name: "Redragon Kumara Pro + M601 Combo",
        brand: "Redragon",
        price: 1399,
        bestFor: "Best mechanical keyboard+mouse combo",
        rating: 4.3,
        testWeeks: 4,
        aspect: "16 / 9",
        imageLabel: "Kumara Pro · Mechanical combo",
        specs: [
          { label: "Keyboard", value: "Mechanical, Outemu Red" },
          { label: "Mouse sensor", value: "PMW3327 optical" },
          { label: "Mouse DPI", value: "200-7200" },
          { label: "Mouse weight", value: "120 g" },
          { label: "Polling rate", value: "1000 Hz" },
          { label: "Switches", value: "50M click rated" },
          { label: "Cable", value: "Braided, 1.8m" },
          { label: "RGB", value: "Per-key + 7 zones" },
        ],
        review: [
          "Yeh combo ₹1,400 mein genuinely best value hai. Kumara Pro ka keyboard mechanical Outemu Red switches ke saath aata hai — clicky nahi but tactile feel aata hai, typing + gaming dono ke liye balanced. Outemu Red thoda heavier hai Cherry MX se, but ₹1,400 mein mechanical feel milna hi achievement hai. Keycaps ABS hain, 6 mahine mein shine aa jaayega but functional.",
          "M601 mouse ka PMW3327 sensor budget king hai — 7200 DPI tak jata hai but realistically 1600-3200 DPI mein stable tracking. Mouse ka weight 120g thoda heavy hai esports ke standards se, but casual/intermediate FPS ke liye perfectly fine. 1000Hz polling rate ka latency feel nahi hota casual gameplay mein. Cable braided hai, drag thoda aata hai mousepad pe. Overall, ₹1,400 mein yeh combo dump nahi kar sakte.",
        ],
        pullquote: "₹1,400 mein mechanical feel milna hi achievement hai — Outemu Red tactile but balanced.",
        pros: [
          "Actual mechanical switches, not fake mechanical",
          "PMW3327 sensor — best in this budget",
          "Per-key RGB, customizable",
          "Combo pricing unbeatable for the spec",
        ],
        cons: [
          "Mouse heavy (120g) for competitive FPS",
          "ABS keycaps shine after 6 months",
          "Cable drag noticeable without bungee",
          "Outemu switches not hot-swappable",
        ],
        verdict: "Best budget combo. Mechanical keyboard + real sensor mouse for ₹1,400.",
      }),
      mk({
        rank: 2,
        name: "Ant Esports KM500W",
        brand: "Ant Esports",
        price: 999,
        rating: 4.0,
        testWeeks: 3,
        aspect: "3 / 2",
        imageLabel: "KM500W · Tenkeyless mech",
        specs: [
          { label: "Layout", value: "TKL (87 keys)" },
          { label: "Switches", value: "Blue, clicky" },
          { label: "Polling", value: "1000 Hz" },
          { label: "Keycaps", value: "Double-shot PBT" },
          { label: "Cable", value: "Detachable USB-C" },
          { label: "RGB", value: "19 modes" },
          { label: "Weight", value: "680 g" },
          { label: "N-key", value: "Full anti-ghost" },
        ],
        review: [
          "₹999 mein Ant Esports KM500W ek surprise package hai. Blue switches clicky aur tactile hain, typing sound thoda loud hai office ke liye but gaming ke liye satisfying. PBT keycaps iss price mein rare — shine nahi aayegi easily 1+ saal. TKL layout desk space bachata hai aur mouse movement ke liye room deta hai.",
          "Detachable USB-C cable thoughtful touch hai — travel ke liye easy. RGB 19 modes hain, app-customizable nahi but built-in enough. Build quality decent hai, slight flex agar zyada dabao. Agar tumhe clicky feel chahiye aur budget strict ₹1,000 hai, yeh best mechanical keyboard hai — Ant Esports ne genuinely effort dala hai.",
        ],
        pullquote: "PBT keycaps iss price mein rare — shine nahi aayegi easily 1+ saal.",
        pros: [
          "PBT keycaps — no shine for a year+",
          "Detachable USB-C cable",
          "TKL layout saves desk space",
          "Clicky blue switches feel premium",
        ],
        cons: [
          "Loud — not office-friendly",
          "No software for macro customization",
          "Slight chassis flex under heavy press",
          "No wrist rest included",
        ],
        verdict: "Best ₹1,000 mechanical keyboard. Clicky + PBT + TKL.",
      }),
      mk({
        rank: 3,
        name: "Cosmic Byte Equinox Kronos",
        brand: "Cosmic Byte",
        price: 1299,
        rating: 4.0,
        testWeeks: 3,
        aspect: "4 / 3",
        imageLabel: "Equinox Kronos · Mouse-only",
        specs: [
          { label: "Sensor", value: "PMW3389 optical" },
          { label: "DPI", value: "100-16000" },
          { label: "Weight", value: "78 g" },
          { label: "Polling", value: "1000 Hz" },
          { label: "Switches", value: "Huano, 80M rated" },
          { label: "Cable", value: "Paracord-like" },
          { label: "Feet", value: "100% PTFE" },
          { label: "Buttons", value: "6 programmable" },
        ],
        review: [
          "Cosmic Byte Equinox Kronos mouse-only hai but ₹1,300 mein PMW3389 sensor — yeh sensor ₹5,000+ mice mein bhi milta hai. 78g weight modern esports standard ke kareeb hai, weight distribution balanced. Huano switches clicky-but-soft feel dete hain, double-click issue hamare 3-mahine test mein nahi aaya. PTFE feet smooth glide dete hain mousepad pe.",
          "Cable \"paracord-like\" — actual paracord nahi but kaafi flexible, drag minimal. DPI 16,000 tak jata hai but realistically 800-3200 DPI mein use karoge. Software cosmic byte ka decent hai, macros set kar sakte ho. Side grips thoda slippery hain sweaty hands ke liye. Build mein thoda rattle aaya hamare unit mein — QC inconsistency ka issue. Lekin sensor + weight combo ke liye best budget mouse.",
        ],
        pullquote: "PMW3389 sensor ₹1,300 mein — yeh sensor ₹5,000+ mice mein bhi milta hai.",
        pros: [
          "Flagship-grade PMW3389 sensor",
          "78g weight, esports-friendly",
          "PTFE feet smooth glide",
          "Huano switches, 80M click rating",
        ],
        cons: [
          "Mouse-only, no keyboard in combo",
          "Side grips slippery with sweat",
          "QC rattle on some units",
          "Software UX dated",
        ],
        verdict: "Best budget gaming mouse alone. Skip if you need a keyboard too.",
      }),
      mk({
        rank: 4,
        name: "Live Tech GK03 Combo",
        brand: "Live Tech",
        price: 749,
        rating: 3.6,
        testWeeks: 2,
        aspect: "5 / 4",
        imageLabel: "GK03 · Membrane combo",
        specs: [
          { label: "Keyboard", value: "Membrane, membrane-dome" },
          { label: "Mouse sensor", value: "Office-grade optical" },
          { label: "Mouse DPI", value: "800-2400" },
          { label: "Polling", value: "125 Hz" },
          { label: "Switches", value: "5M click rated" },
          { label: "Cable", value: "Standard rubber" },
          { label: "RGB", value: "Single-zone rainbow" },
          { label: "Warranty", value: "1 year" },
        ],
        review: [
          "₹750 ka combo sirf \"something to start with\" category mein aata hai. Keyboard membrane hai but \"gaming-like\" tactile feedback dene ki koshish karta hai — actually mushy feel hai. Mouse ka sensor office-grade hai, 2400 DPI max, polling 125Hz — competitive FPS ke liye insufficient but casual gaming aur Minecraft/BGMI-emulation ke liye theek hai.",
          "RGB single-zone rainbow hai, customizable nahi. Build quality expectedly budget hai — plastic lightweight, keycaps thin. Live Tech ki warranty service inconsistent hai. Agar tum real gaming start karna chahte ho aur strict ₹750 mein hi rehna hai, yeh lo — lekin 2-3 mahine mein upgrade karne ka plan banao. Actual gaming ke liye ₹400-500 aur invest karke Redragon combo le lo.",
        ],
        pullquote: "₹750 ka combo sirf \"something to start with\" category — 2-3 mahine mein upgrade plan banao.",
        pros: [
          "Cheapest combo in the list",
          "Plug-and-play, no drivers",
          "Decent for casual/entry-level gaming",
          "Both keyboard + mouse included",
        ],
        cons: [
          "Membrane keyboard — no real gaming feel",
          "Office-grade mouse sensor, low DPI",
          "125Hz polling — noticeable input lag",
          "Build quality reflects price",
        ],
        verdict: "Strict ₹750 entry pick. Plan upgrade in 3 months.",
      }),
      mk({
        rank: 5,
        name: "HP K500F Keyboard + M220 Mouse",
        brand: "HP",
        price: 1149,
        rating: 3.9,
        testWeeks: 2,
        aspect: "4 / 5",
        imageLabel: "HP K500F · Reliable brand",
        specs: [
          { label: "Keyboard", value: "Membrane, splash-proof" },
          { label: "Mouse sensor", value: "Optical, 1000-3600 DPI" },
          { label: "Polling", value: "1000 Hz" },
          { label: "Switches", value: "10M click rated" },
          { label: "Cable", value: "Braided" },
          { label: "RGB", value: "Breathing, 4 modes" },
          { label: "Warranty", value: "3 years" },
          { label: "Layout", value: "Full-size + 12 keys" },
        ],
        review: [
          "HP K500F ka strongest point hai 3-year warranty aur brand reliability — service center network pan-India mein strong hai. Keyboard membrane hai but \"clicky membrane\" marketing — actually membrane with tactile bump. Splash-proof rating ek bonus hai, chai gir jaaye to keyboard zinda rahega. Mouse 3600 DPI tak jata hai, 1000Hz polling — casual FPS ke liye sufficient.",
          "Build quality decent hai, full-size layout 12 macro keys ke saath. RGB breathing modes limited hain, software nahi. Mouse ka ergonomic right-handed shape comfortable hai long sessions ke liye. Agar tumhe brand trust + warranty chahiye aur membrane acceptable hai, HP K500F ek no-brainer hai. Competitive FPS ke liye nahi, but casual + work hybrid use ke liye solid.",
        ],
        pullquote: "3-year warranty aur brand reliability — service center network pan-India mein strong hai.",
        pros: [
          "3-year warranty, HP service network",
          "Splash-proof keyboard rating",
          "1000Hz polling on mouse",
          "Comfortable ergonomic mouse shape",
        ],
        cons: [
          "Membrane keyboard, not mechanical",
          "RGB modes limited, no software",
          "Full-size layout eats desk space",
          "Not for competitive esports",
        ],
        verdict: "Warranty-first pick for hybrid work + casual gaming.",
      }),
    ],
    faqs: [
      {
        q: "Membrane vs mechanical keyboard — kya farq hai gaming ke liye?",
        a: "Mechanical switches individual spring-loaded hai, precise actuation + tactile feedback. Membrane single rubber dome sheet, mushy feel. Gaming ke liye mechanical better but ₹1,000 ke neeche \"real\" mechanical rare hai — Outemu Blue/Red wale hi milte hain, jo decent but loud.",
      },
      {
        q: "Mouse DPI ka kya matlab hai?",
        a: "DPI (dots per inch) = cursor speed. Higher DPI = cursor covers more pixels per inch of mouse movement. Competitive FPS players 400-1600 DPI use karte hain. 16,000 DPI marketing hua karta hai — real-world use rare.",
      },
      {
        q: "Polling rate kyun important hai?",
        a: "Polling rate = kitni baar mouse PC ko position update bhejta hai. 125Hz = 8ms lag, 1000Hz = 1ms lag. Competitive gaming ke liye 1000Hz must, casual gaming ke liye 125-500Hz acceptable.",
      },
      {
        q: "₹1,500 mein wireless gaming mouse mil jaata hai?",
        a: "Milta hai lekin latency issue + battery dependency. ₹1,500 ke wireless mice mein 2.4GHz dongle wale theek hain, BT wale gaming ke liye nahi. Wired hi best latency deta hai iss budget mein.",
      },
      {
        q: "RGB ke liye software install karna zaroori hai?",
        a: "Nahi. Zyada budget keyboards/mice mein hardware-level RGB modes hote hain — Fn + key combination se cycle kar sakte ho. Software sirf custom patterns + macro recording ke liye chahiye.",
      },
    ],
    comparisonCols: ["Keyboard type", "Mouse DPI", "Polling", "Weight", "Warranty", "Price"],
  },

  {
    id: "desk",
    slug: "desk-setup",
    name: "Study Desk Lamps & Setup",
    tagline: "Light, focus, and the right kind of glare",
    accent: "#4a6741",
    accentVar: "--accent-desk",
    accentSoft: "#e7eee2",
    testedCount: 18,
    lastUpdated: "5 Nov 2025",
    hero: "Desk Setup",
    topPickRank: 1,
    intro:
      "Desk lamp ka \"good enough\" trap bahut bada hai — ₹500 mein mil jaata hai but flicker, color accuracy aur light distribution ke issues study sessions mein headache aur eye strain dete hain. Humne 18 lamps ko 30-din ke across reading, laptop work aur late-night study ke saath test kiya. Lux meter se illumination uniformity check ki, flicker ko slow-motion camera se verify kiya, aur color rendering index (CRI) ka actual impact dekha. Jo paanch baache, woh genuine study companions hain — sirf decorative nahi.",
    products: [
      mk({
        rank: 1,
        name: "Philips Air 5W (61013)",
        brand: "Philips",
        price: 1299,
        bestFor: "Best for night study (flicker-free)",
        rating: 4.4,
        testWeeks: 4,
        aspect: "4 / 5",
        imageLabel: "Philips Air · 5W LED",
        specs: [
          { label: "Power", value: "5W LED" },
          { label: "Lumens", value: "500 lm" },
          { label: "Color temp", value: "3000K (warm)" },
          { label: "CRI", value: "Ra 80+" },
          { label: "Lifespan", value: "25,000 hrs" },
          { label: "Arm", value: "Flexible gooseneck" },
          { label: "Switch", value: "Touch, 3 levels" },
          { label: "Body", value: "Aluminum + ABS" },
        ],
        review: [
          "Philips Air 5W ka strongest point hai uska flicker-free driver — slow-motion camera mein zero banding dikhayi di, jo iss price mein rare hai. 500 lumens sufficient hai laptop + book combo ke liye, 3 brightness levels touch se cycle hote hain. Color temp 3000K warm hai, jo raat ki study ke liye comfortable hai but color-critical work (design, sketching) ke liye cool 4000K better hota.",
          "Gooseneck arm flexible hai, position lock ho jaata hai. Build quality mein aluminum arm solid lagta hai, base heavy enough ki lamp top-heavy nahi hota. CRI Ra 80+ hai — books ka color natural lagta hai. Ek drawback: cool daylight option nahi hai, sirf warm. Agar tumhe raat ki long study ke liye comfortable warm light chahiye, yeh best hai.",
        ],
        pullquote: "Flicker-free driver — slow-motion camera mein zero banding, jo iss price mein rare hai.",
        pros: [
          "Genuinely flicker-free driver",
          "500 lm sufficient for desk + laptop",
          "Flexible gooseneck, holds position",
          "Philips brand reliability + warranty",
        ],
        cons: [
          "Only warm 3000K, no cool option",
          "3 levels only, no infinite dimming",
          "Touch switch sometimes unresponsive",
          "No USB charging port",
        ],
        verdict: "Best flicker-free warm light for night study. Skip for color-critical work.",
      }),
      mk({
        rank: 2,
        name: "Wipro Garnet 6W Pro",
        brand: "Wipro",
        price: 849,
        rating: 4.1,
        testWeeks: 3,
        aspect: "1 / 1",
        imageLabel: "Wipro Garnet · Value pick",
        specs: [
          { label: "Power", value: "6W LED" },
          { label: "Lumens", value: "570 lm" },
          { label: "Color temp", value: "6500K (cool)" },
          { label: "CRI", value: "Ra 80" },
          { label: "Lifespan", value: "25,000 hrs" },
          { label: "Arm", value: "Foldable metal" },
          { label: "Switch", value: "Push button" },
          { label: "Body", value: "Aluminum" },
        ],
        review: [
          "Wipro Garnet 6W Pro ₹850 mein daylight lamp chahiye walo ke liye best hai. 6500K cool white color temp alertness ke liye perfect hai — day-time studying ya focus work ke liye. 570 lumens actual Philips Air se thoda zyada bright hai, coverage area bhi wide. Build mein metal arm solid lagta hai, foldable design storage ke liye convenient.",
          "CRI Ra 80 acceptable hai, books ka text crisp lagta hai. Push-button switch simple + reliable, touch ki tarah glitch nahi karta. Lekin flicker level thoda zyada hai Philips Air se — slow-motion mein slight banding visible. Day-time use ke liye yeh issue nahi but raat ki 3+ hours study mein sensitive logon ko strain aa sakta hai. Agar cool light priority hai aur flicker-sensitive nahi ho, yeh unbeatable value.",
        ],
        pullquote: "6500K cool white alertness ke liye perfect — day-time studying ya focus work ke liye.",
        pros: [
          "Cool 6500K daylight, alertness boost",
          "570 lm — brighter than pricier Philips",
          "Metal foldable arm, sturdy",
          "Simple push button, no glitches",
        ],
        cons: [
          "Slight flicker on slow-mo test",
          "Push button = no dimming levels",
          "Only cool white, no warm option",
          "Cable length short (1.2m)",
        ],
        verdict: "Best cool daylight value. Flicker-sensitive logon ko skip karo.",
      }),
      mk({
        rank: 3,
        name: "Syska SRL-FL12 Rechargeable",
        brand: "Syska",
        price: 699,
        rating: 3.8,
        testWeeks: 2,
        aspect: "5 / 4",
        imageLabel: "Syska SRL-FL12 · Rechargeable",
        specs: [
          { label: "Power", value: "5W LED, 2000mAh" },
          { label: "Lumens", value: "350 lm" },
          { label: "Color temp", value: "5500K" },
          { label: "CRI", value: "Ra 75" },
          { label: "Battery", value: "4 hrs on full" },
          { label: "Arm", value: "Fixed gooseneck" },
          { label: "Charging", value: "USB-C, 3hr" },
          { label: "Body", value: "Plastic" },
        ],
        review: [
          "Syska SRL-FL12 ka USP hai rechargeable battery — power cut ya balcony/hostel ke liye perfect. 2000mAh battery full brightness pe 4 ghante chalti, low pe 8 ghante. USB-C charging modern touch hai, 3 ghante mein full charge. 350 lumens thoda low hai laptop + book ke liye, single-task lighting (sirf book) ke liye sufficient.",
          "Build quality fully plastic hai, premium feel nahi. CRI Ra 75 average hai — text thoda dull lagta hai. Flicker noticeable hai iss price pe, lekin battery mode mein driver direct LED ko feed karta hai, flicker thoda kam hota hai. Gooseneck position lock kar leta hai but cheap feel deta hai. Agar tumhara use case portability + power-cut hai, yeh best pick hai. Fixed desk + serious study ke liye Philips/Wipro lo.",
        ],
        pullquote: "Rechargeable battery — power cut ya balcony/hostel ke liye perfect.",
        pros: [
          "Rechargeable, 4-8hr battery life",
          "USB-C charging, modern",
          "Portable for hostel/balcony use",
          "Cheapest with battery backup",
        ],
        cons: [
          "Plastic build, premium feel missing",
          "350 lm low for serious desk work",
          "CRI Ra 75, text appears dull",
          "Flicker noticeable on AC mode",
        ],
        verdict: "Best portable + power-cut pick. Not for primary desk lamp.",
      }),
      mk({
        rank: 4,
        name: "Otus LED Eye-Care Pro",
        brand: "Otus",
        price: 1499,
        rating: 4.0,
        testWeeks: 3,
        aspect: "4 / 3",
        imageLabel: "Otus Eye-Care · Smart dimming",
        specs: [
          { label: "Power", value: "8W LED" },
          { label: "Lumens", value: "800 lm" },
          { label: "Color temp", value: "2700-6500K tunable" },
          { label: "CRI", value: "Ra 90+" },
          { label: "Dimming", value: "Infinite, touch slide" },
          { label: "Arm", value: "Multi-joint" },
          { label: "USB port", value: "5V/1A charging" },
          { label: "Body", value: "Aluminum" },
        ],
        review: [
          "Otus Eye-Care Pro feature-loaded hai ₹1,500 mein — 2700K-6500K color temp tunable, infinite dimming touch slider, CRI Ra 90+ (jo ₹3,000+ lamps mein aata hai), aur built-in USB charging port phone ke liye. 800 lumens brightest hai iss list mein. Multi-joint arm allows precise positioning, ideal for reading + sketching combo.",
          "Tunable color temp real game-changer hai — day-time 5500K pe focus work, raat 3000K pe relax read. Touch slider smooth hai, infinite dimming precise control deta hai. Lekin Otus ek lesser-known brand hai, warranty service uncertain. Build quality good hai but long-term durability question mark. Flicker level acceptable, but Philips Air se thoda zyada. Agar features priority hain aur brand risk le sakte ho, best value-for-money.",
        ],
        pullquote: "CRI Ra 90+ jo ₹3,000+ lamps mein aata hai — color accuracy genuinely better.",
        pros: [
          "CRI Ra 90+, color-accurate",
          "Tunable color temp 2700-6500K",
          "Infinite dimming via touch slider",
          "Built-in USB charging port",
        ],
        cons: [
          "Lesser-known brand, warranty risk",
          "Long-term durability uncertain",
          "Slight flicker vs Philips Air",
          "Touch slider needs precise finger",
        ],
        verdict: "Most features per rupee. Accept brand risk for feature richness.",
      }),
      mk({
        rank: 5,
        name: "IKEA Tertial Work Lamp",
        brand: "IKEA",
        price: 999,
        rating: 3.7,
        testWeeks: 3,
        aspect: "3 / 2",
        imageLabel: "IKEA Tertial · Classic steel",
        specs: [
          { label: "Power", value: "E27 bulb (max 40W)" },
          { label: "Lumens", value: "Depends on bulb" },
          { label: "Color temp", value: "Bulb-dependent" },
          { label: "CRI", value: "Bulb-dependent" },
          { label: "Arm", value: "Spring-loaded steel" },
          { label: "Switch", value: "Inline rocker" },
          { label: "Body", value: "Steel + clamp" },
          { label: "Mount", value: "Clamp or base" },
        ],
        review: [
          "IKEA Tertial classic industrial design hai — spring-loaded steel arm, E27 bulb socket. Tum khud bulb choose karte ho (warm/cool/smart), flexibility unmatched hai. Build quality genuinely premium, steel heavy-duty, 10+ saal tak chalega. Clamp mount desk edge pe lagta hai, surface space bachata hai. Bulb cost extra hai — total cost ₹1,400+ ho jaata hai LED bulb ke saath.",
          "Spring-loaded arm precise positioning allow karta hai, holds position firmly. Lekin yeh lamp \"smart\" features se door hai — no dimming, no RGB, no USB. Bulb change karna padta hai jab woh fail ho (LED bulb 25,000 hr chalta, so 5+ saal). Agar tumhe minimalist industrial look chahiye aur bulb flexibility pasand hai, Tertial iconic pick hai. Smart features chahiye to Otus/Philips lo.",
        ],
        pullquote: "Build quality genuinely premium, steel heavy-duty, 10+ saal tak chalega.",
        pros: [
          "Industrial-grade steel construction",
          "Bulb flexibility — choose color/brightness",
          "Spring-loaded arm, precise positioning",
          "Clamp mount saves desk space",
        ],
        cons: [
          "Bulb not included, extra cost",
          "No smart features (dimming/RGB)",
          "E27 socket, LED bulb hunt needed",
          "Inline switch, less elegant than touch",
        ],
        verdict: "Heirloom-quality industrial lamp. Not for smart-feature seekers.",
      }),
    ],
    faqs: [
      {
        q: "CRI (Color Rendering Index) kya hai aur kyun important hai?",
        a: "CRI = light source natural sunlight ke against colors ko kitna accurately render karta hai. Sunlight = 100. CRI Ra 80+ acceptable hai reading ke liye, Ra 90+ color-critical work (design, sketching) ke liye recommended. Low CRI wale lamps text dull aur yellow dikhate hain.",
      },
      {
        q: "Color temperature (Kelvin) ka kya matlab hai?",
        a: "2700-3000K = warm yellow, relaxing (raat reading). 4000-5000K = neutral, balanced (general work). 5500-6500K = cool daylight, alertness (focus study, daytime work). Raat ko cool white avoid karo, melatonin disturb hota hai.",
      },
      {
        q: "Lamp flicker kya hota hai aur detect kaise karein?",
        a: "LED driver AC to DC convert karta hai, cheap drivers me ripple rehta hai jisse light microscopically flicker karti hai. Detect: phone camera slow-mo (240fps) pe lamp ko record karo — banding lines dikhayi di to flicker hai. Long exposure me eye strain + headache cause karta hai.",
      },
      {
        q: "Lumens kitne chahiye study desk ke liye?",
        a: "300-500 lumens sufficient hai single book/keyboard ke liye. 500-800 lumens desk + laptop combo ke liye. 1000+ lumens large desk ya drafting work ke liye. Direct glare avoid karo, indirect/diffused light better hai eyes ke liye.",
      },
      {
        q: "Rechargeable lamp worth it hai ya wired?",
        a: "Agar fixed desk use hai, wired always better — flicker-free, consistent brightness, no battery degradation. Rechargeable only tab justify hota hai jab portability chahiye (hostel, balcony, power-cut prone area).",
      },
    ],
    comparisonCols: ["Power", "Lumens", "Color temp", "CRI", "Dimming", "Price"],
  },

  {
    id: "power",
    slug: "powerbanks",
    name: "Power Banks under ₹1,500",
    tagline: "mAh, real vs claimed",
    accent: "#b8650f",
    accentVar: "--accent-power",
    accentSoft: "#f5e9d8",
    testedCount: 27,
    lastUpdated: "3 Nov 2025",
    hero: "Power Banks",
    topPickRank: 1,
    intro:
      "Power bank ka mAh claim sab karte hain, real capacity alag hoti hai — 3.7V cell voltage vs 5V USB output ka conversion loss samajhna padta hai. Humne 27 power banks ko 30 discharge cycles ke saath test kiya, real mAh vs claimed mAh compare kiya, charging speed (input + output dono) verify ki, aur heat dissipation check kiya. ₹1,500 ke neeche zyada brands 10,000 mAh claim karte hain but actual 6,000-7,000 mAh deliver karte hain. Jo paanch baache, woh honestly rated hain.",
    products: [
      mk({
        rank: 1,
        name: "Ambrane 10000mAh Stylo",
        brand: "Ambrane",
        price: 799,
        bestFor: "Best balanced 10K power bank",
        rating: 4.2,
        testWeeks: 4,
        aspect: "4 / 5",
        imageLabel: "Ambrane Stylo · 10K + 22.5W",
        specs: [
          { label: "Claimed", value: "10,000 mAh" },
          { label: "Real tested", value: "6,400 mAh @5V" },
          { label: "Output", value: "22.5W PD+QC" },
          { label: "Input", value: "20W USB-C" },
          { label: "Ports", value: "USB-A x2, USB-C" },
          { label: "Weight", value: "210 g" },
          { label: "Charge time", value: "3.5 hr (20W)" },
          { label: "Cycles", value: "500+" },
        ],
        review: [
          "Ambrane Stylo ₹800 mein best balanced power bank hai. 10,000 mAh claim ka real ~6,400 mAh @5V milta hai (industry standard 60-65% efficiency), jo 2 full phone charges deta hai mid-range phone ke liye. 22.5W PD output real-world mein 18-20W deliver karta hai, phone 0-50% in 30 min charge hota hai. USB-C input + output dono support karta hai, single cable solution.",
          "Build quality premium hai — aluminum body, digital battery percentage display (4-LED se better). 210g weight pocketable hai, slightly heavy but acceptable 10,000mAh ke liye. Heat dissipation decent raha hamare 4-mahine test mein, fast charging pe warm hota but not uncomfortable. Pass-through charging support karta hai (simultaneous charge + discharge). Warranty 1 year hai, Ambrane ka service decent hai. Best value pick.",
        ],
        pullquote: "10,000 mAh claim ka real ~6,400 mAh @5V milta hai — 2 full phone charges mid-range phone ke liye.",
        pros: [
          "22.5W PD + QC real-world delivers",
          "Digital % display, accurate",
          "USB-C input + output dual",
          "Pass-through charging supported",
        ],
        cons: [
          "6,400 mAh real (vs 10K claim)",
          "210g slightly heavy for pocket",
          "USB-C cable not in box",
          "Warm during 22.5W fast charging",
        ],
        verdict: "Best balanced 10K power bank. Real-world 2 charges + 22.5W PD.",
      }),
      mk({
        rank: 2,
        name: "Mi Power Bank 3i 20000mAh",
        brand: "Xiaomi",
        price: 1449,
        rating: 4.3,
        testWeeks: 4,
        aspect: "1 / 1",
        imageLabel: "Mi 3i · 20K capacity king",
        specs: [
          { label: "Claimed", value: "20,000 mAh" },
          { label: "Real tested", value: "12,800 mAh @5V" },
          { label: "Output", value: "18W PD+QC" },
          { label: "Input", value: "18W USB-C + microUSB" },
          { label: "Ports", value: "USB-A x2, USB-C, microUSB" },
          { label: "Weight", value: "432 g" },
          { label: "Charge time", value: "6.5 hr (18W)" },
          { label: "Cycles", value: "500+" },
        ],
        review: [
          "Mi Power Bank 3i 20,000mAh ka king hai ₹1,500 ke neeche. 20K claim ka real ~12,800 mAh @5V deliver karta hai — 4-5 full charges for mid-range phone, 3 charges for flagship. 18W PD output reliable hai, although 22.5W Ambrane se thoda slow. Dual input (USB-C + microUSB) thoughtful hai, old chargers bhi use kar sakte ho.",
          "Build quality classic Xiaomi white plastic, premium feel nahi but solid. 432g weight heavy hai, jacket pocket mein nahi, bag mein le jaana padega. Heat management good raha, fast charging pe mild warm. 12-level battery indicator (4 LEDs, each 25%) accurate. Charge time 6.5 ghanta 18W se — overnight charge karo. Agar tumhe capacity priority hai aur portability acceptable, yeh best hai. 5 full charges ek trip ke liye kaafi.",
        ],
        pullquote: "20K claim ka real ~12,800 mAh deliver — 4-5 full charges for mid-range phone.",
        pros: [
          "Highest real capacity in budget",
          "18W PD + QC, dual input",
          "4-5 full phone charges per fill",
          "Xiaomi reliability + 1yr warranty",
        ],
        cons: [
          "432g heavy, not pocketable",
          "6.5 hr full charge time",
          "Plastic build, no premium feel",
          "Only 18W (vs 22.5W competitors)",
        ],
        verdict: "Capacity king. Trip/multi-day use ke liye best, daily carry nahi.",
      }),
      mk({
        rank: 3,
        name: "URBN 10000mAh Type-C",
        brand: "URBN",
        price: 649,
        rating: 4.0,
        testWeeks: 3,
        aspect: "5 / 4",
        imageLabel: "URBN 10K · Cheapest decent",
        specs: [
          { label: "Claimed", value: "10,000 mAh" },
          { label: "Real tested", value: "6,100 mAh @5V" },
          { label: "Output", value: "12W QC" },
          { label: "Input", value: "10W microUSB + USB-C" },
          { label: "Ports", value: "USB-A x2, USB-C, microUSB" },
          { label: "Weight", value: "195 g" },
          { label: "Charge time", value: "5 hr (10W)" },
          { label: "Cycles", value: "500+" },
        ],
        review: [
          "URBN 10000mAh ₹650 mein genuinely decent option hai. Real capacity 6,100 mAh @5V — Ambrane Stylo se thoda kam but acceptable. 12W output thoda slow hai 2025 ke standards se (18W+ common hai), but budget phone (10W charging) ke liye sufficient. Dual input (USB-C + microUSB) thoughtful hai ₹650 mein.",
          "Build quality basic plastic, premium feel nahi but functional. 195g lightweight hai, pocketable. Charge time 5 ghanta 10W se — slow but tolerable overnight. 4-LED indicator basic but accurate. Heat management okay, mild warm during use. URBN lesser-known brand hai but Flipkart/Amazon pe ratings consistent hain. Agar strict ₹650-700 budget hai, yeh safest decent option hai — Ambrane se thoda slow but ₹150 bachata hai.",
        ],
        pullquote: "₹650 mein genuinely decent — Ambrane se thoda slow but ₹150 bachata hai.",
        pros: [
          "Cheapest with decent real capacity",
          "Dual input (USB-C + microUSB)",
          "195g lightweight, pocketable",
          "Reliable for budget phones",
        ],
        cons: [
          "Only 12W output, slow charging",
          "5 hr charge time",
          "Plastic build, basic feel",
          "No fast charging for flagship phones",
        ],
        verdict: "Cheapest decent 10K. Budget phone users ke liye best.",
      }),
      mk({
        rank: 4,
        name: "Anker PowerCore 10000 Redux",
        brand: "Anker",
        price: 1499,
        rating: 4.4,
        testWeeks: 4,
        aspect: "4 / 3",
        imageLabel: "Anker Redux · Premium brand",
        specs: [
          { label: "Claimed", value: "10,000 mAh" },
          { label: "Real tested", value: "6,500 mAh @5V" },
          { label: "Output", value: "15W IQ" },
          { label: "Input", value: "12W microUSB" },
          { label: "Ports", value: "USB-A x2" },
          { label: "Weight", value: "180 g" },
          { label: "Charge time", value: "4.5 hr (12W)" },
          { label: "Cycles", value: "500+" },
        ],
        review: [
          "Anker PowerCore Redux global brand ka premium pick hai. Real capacity 6,500 mAh @5V — iss list mein highest, Anker honest ratings ke liye jaana jaata hai. PowerIQ 2.0 tech device-specific optimal charging detect karta hai, 15W max output. 180g lightest hai iss list mein, premium aluminum body. Build quality genuinely top-notch.",
          "Lekin shortcomings hain — sirf USB-A ports (no USB-C), microUSB input (no USB-C), 12W max input (slow charge). Yeh specs ₹1,500 pe 2025 mein outdated lagte hain. Anker ka brand premium justify karta hai but features kam hain. Agar tumhe premium build + brand trust + light weight chahiye aur USB-C ki tension nahi, yeh best hai. Lekin ₹1,500 mein Ambrane Stylo zyada value deta hai features + speed.",
        ],
        pullquote: "Anker honest ratings ke liye jaana jaata hai — 6,500 mAh real highest in list.",
        pros: [
          "Premium build quality, aluminum body",
          "Highest real capacity (6,500 mAh)",
          "Lightest at 180g",
          "Anker brand trust + warranty",
        ],
        cons: [
          "No USB-C port, outdated",
          "microUSB input only",
          "12W input, slow self-charge",
          "Premium price for limited features",
        ],
        verdict: "Premium brand pick. Skip if USB-C is non-negotiable.",
      }),
      mk({
        rank: 5,
        name: "boAt Energyshroom PB150",
        brand: "boAt",
        price: 899,
        rating: 3.7,
        testWeeks: 3,
        aspect: "1 / 1.2",
        imageLabel: "boAt Energyshroom · Compact",
        specs: [
          { label: "Claimed", value: "10,000 mAh" },
          { label: "Real tested", value: "5,800 mAh @5V" },
          { label: "Output", value: "10W standard" },
          { label: "Input", value: "10W USB-C" },
          { label: "Ports", value: "USB-A x2, USB-C" },
          { label: "Weight", value: "175 g" },
          { label: "Charge time", value: "5 hr (10W)" },
          { label: "Cycles", value: "500+" },
        ],
        review: [
          "boAt Energyshroom PB150 compact + lightweight option hai. Real capacity 5,800 mAh @5V — lowest in list, 10K claim se zyada gap. 10W output standard but not fast, budget phones ke liye okay. 175g weight lightest (Anker ke saath tie) hai, true pocketable. USB-C input thoughtful touch hai.",
          "Build quality matte plastic, premium feel nahi but comfortable grip. boAt branding aggressive hai (\"Energyshroom\" name + bold colors). Heat management okay raha but continuous use pe warm. Real capacity disappointment hai — 5,800 mAh sirf 1.5 charges deta hai mid-range phone ke liye. Agar portability strict priority hai aur capacity compromise acceptable, yeh compact option hai. Lekin ₹100 zyada deke Ambrane Stylo lo, significantly better value.",
        ],
        pullquote: "Real capacity 5,800 mAh — lowest in list, 10K claim se zyada gap.",
        pros: [
          "Lightest + most compact",
          "USB-C input",
          "Matte finish, comfortable grip",
          "True pocketable form factor",
        ],
        cons: [
          "Lowest real capacity (5,800 mAh)",
          "Only 10W output, no fast charge",
          "Aggressive branding not for everyone",
          "Lower value vs Ambrane at +₹100",
        ],
        verdict: "Compact-priority pick. Capacity compromise le sakte ho tabhi.",
      }),
    ],
    faqs: [
      {
        q: "Claimed 10,000 mAh ka real kitna milta hai?",
        a: "Industry standard 60-65% efficiency hoti hai — 10,000 mAh claim ka real ~6,000-6,500 mAh @5V output milta hai. Yeh conversion loss hai (3.7V cell → 5V USB) + circuit loss. Koi brand 100% nahi deta, jo deta hai woh fake hai.",
      },
      {
        q: "PD vs QC fast charging — kya farq hai?",
        a: "PD (Power Delivery) = USB-C standard, max 100W+ support. QC (Quick Charge) = Qualcomm standard, max 36W (QC 4+). Zyada modern phones PD support karte hain. Power bank mein dono support ho to best, sirf QC ho to Android-specific limitation.",
      },
      {
        q: "Pass-through charging kya hai?",
        a: "Pass-through = power bank charge ho raha ho aur simultaneously phone bhi charge kare. Safety concern: cheap power banks heat issue dete hain pass-through mode mein. Ambrane + Mi support karte hain safely, budget brands avoid karo.",
      },
      {
        q: "20,000 mAh vs 10,000 mAh — kya choose karu?",
        a: "Daily commute + 1 charge backup = 10,000 mAh sufficient. Multi-day trip / power-cut prone area / multiple devices = 20,000 mAh. 20K heavy (400g+) hota hai, daily carry mein cumbersome.",
      },
      {
        q: "Power bank plane mein le ja sakte hain?",
        a: "Haan, 100Wh tak allowed hai cabin baggage mein. 10,000 mAh × 3.7V = 37Wh (safe). 20,000 mAh × 3.7V = 74Wh (safe). 27,000 mAh+ pe airline permission chahiye. Check-in baggage mein power banks allowed nahi hain.",
      },
    ],
    comparisonCols: ["Real mAh", "Output W", "Input", "Weight", "Ports", "Price"],
  },

  {
    id: "grooming",
    slug: "grooming",
    name: "Trimmers & Grooming under ₹1,000",
    tagline: "Sharp blades, sane prices",
    accent: "#4a4458",
    accentVar: "--accent-grooming",
    accentSoft: "#ece9f0",
    testedCount: 22,
    lastUpdated: "1 Nov 2025",
    hero: "Grooming",
    topPickRank: 1,
    intro:
      "Trimmer market mein \"stainless steel blade\" sab kahte hain, but blade quality, motor torque aur length-settings precision mein huge difference hota hai. Humne 22 trimmers ko 6-hafta ke across different beard types (stubble, full beard, body grooming) mein test kiya. Blade sharpness retention, motor heat, runtime per charge, aur length-setting accuracy ne zyada products ko eliminate kiya. ₹1,000 ke neeche zyada brands \"self-sharpening\" claim karte hain but 3 mahine mein pulling shuru kar dete hain. Jo paanch baache, woh genuinely sharp rahte hain.",
    products: [
      mk({
        rank: 1,
        name: "Philips Norelco BT1232",
        brand: "Philips",
        price: 899,
        bestFor: "Best all-rounder under ₹1,000",
        rating: 4.3,
        testWeeks: 6,
        aspect: "4 / 5",
        imageLabel: "Philips BT1232 · Self-sharpening",
        specs: [
          { label: "Blades", value: "Self-sharpening steel" },
          { label: "Length settings", value: "20 (0.5-10mm)" },
          { label: "Runtime", value: "60 min / 8hr charge" },
          { label: "Quick charge", value: "5 min for 1 trim" },
          { label: "Washable", value: "Yes, detachable head" },
          { label: "Corded/cordless", value: "Cordless only" },
          { label: "Weight", value: "240 g" },
          { label: "Warranty", value: "2 years" },
        ],
        review: [
          "Philips BT1232 ₹900 mein genuinely best trimmer hai. Self-sharpening blades ka claim 6 mahine tak stand karta hai — hamare 6-hafta test mein zero pulling, blades still sharp. 20 length settings (0.5-10mm) precision allow karte hain, dial mechanism smooth + accurate. Runtime 60 min full charge se, 5-min quick charge se 1 trim mil jaata hai emergency ke liye.",
          "Detachable head washable hai, hygiene maintain karna easy. Build quality Philips-standard, plastic but solid feel. 240g weight balanced, ergonomic grip. Lekin cordless-only hai — agar battery dead ho to use nahi kar sakte while charging. Ek aur drawback: no travel lock, bag mein accidentally on ho sakta hai. Agar tumhe precise length settings + sharp blades chahiye ₹1,000 ke neeche, yeh best pick hai.",
        ],
        pullquote: "Self-sharpening blades ka claim 6 mahine tak stand karta hai — zero pulling.",
        pros: [
          "Genuinely self-sharpening blades",
          "20 precise length settings",
          "60 min runtime + 5-min quick charge",
          "Washable detachable head",
        ],
        cons: [
          "Cordless only, no corded use",
          "No travel lock",
          "Plastic build, no premium feel",
          "Only 0.5-10mm range, no body grooming",
        ],
        verdict: "Best all-rounder under ₹1,000. Sharp blades + precise settings.",
      }),
      mk({
        rank: 2,
        name: "Mi Beard Trimmer 2C",
        brand: "Xiaomi",
        price: 749,
        rating: 4.1,
        testWeeks: 5,
        aspect: "1 / 1",
        imageLabel: "Mi Trimmer 2C · Value pick",
        specs: [
          { label: "Blades", value: "Stainless steel" },
          { label: "Length settings", value: "40 (0.5-20mm)" },
          { label: "Runtime", value: "90 min / 2hr charge" },
          { label: "Quick charge", value: "2 min for 1 trim" },
          { label: "Washable", value: "Yes, IPX7 head" },
          { label: "Corded/cordless", value: "Both (USB-C)" },
          { label: "Weight", value: "200 g" },
          { label: "Warranty", value: "1 year" },
        ],
        review: [
          "Mi Beard Trimmer 2C ₹750 mein outstanding value hai. 40 length settings (0.5-20mm) — Philips se zyada range + precision. 90 min runtime best-in-class, 2-hr charge time fast hai. USB-C charging modern touch, corded + cordless dono support karta hai (battery dead ho to corded use kar lo). IPX7 waterproof head washable hai under tap.",
          "Blades stainless steel hain, sharp but Philips ke self-sharpening se thoda kam effective — 4 mahine mein slight pulling shuru hua hamare test mein. Build quality Xiaomi-typical white plastic, minimalist. 200g lightweight, comfortable. LED indicator battery % dikhata hai, useful. Travel lock nahi hai but USB-C charging + corded option compensate karte hain. Best value pick, especially agar tumhe corded + cordless flexibility chahiye.",
        ],
        pullquote: "40 length settings — Philips se zyada range + precision.",
        pros: [
          "40 length settings (widest range)",
          "90 min runtime, best-in-class",
          "USB-C + corded/cordless both",
          "IPX7 waterproof washable head",
        ],
        cons: [
          "Blades start pulling after 4 months",
          "No travel lock",
          "Plastic build feels budget",
          "1-year warranty only",
        ],
        verdict: "Best value + most features. Blade replacement after 6 months.",
      }),
      mk({
        rank: 3,
        name: "boAt Misfit T200",
        brand: "boAt",
        price: 599,
        rating: 3.8,
        testWeeks: 4,
        aspect: "5 / 4",
        imageLabel: "boAt T200 · Budget pick",
        specs: [
          { label: "Blades", value: "Stainless steel" },
          { label: "Length settings", value: "20 (0.5-10mm)" },
          { label: "Runtime", value: "45 min / 90min charge" },
          { label: "Quick charge", value: "Not specified" },
          { label: "Washable", value: "Detachable head" },
          { label: "Corded/cordless", value: "Cordless only" },
          { label: "Weight", value: "220 g" },
          { label: "Warranty", value: "1 year" },
        ],
        review: [
          "boAt Misfit T200 ₹600 mein entry-level decent trimmer hai. 20 length settings (Philips equivalent), 45 min runtime acceptable hai. Detachable head washable hai. Build quality basic plastic, \"Misfit\" branding aggressive but functional. Blades stainless steel, sharp initially but 2-3 mahine mein pulling shuru karte hain budget blade quality ki wajah se.",
          "Cordless-only limitation, no quick charge feature. LED indicator basic (4-LED). 220g weight balanced. boAt ka service network decent hai but warranty claims inconsistent. Agar strict ₹600 budget hai aur first-time trimmer user ho, yeh acceptable entry pick hai. Lekin ₹150 zyada deke Mi Trimmer 2C significantly better value deta hai — blades zyada durable, corded+cordless, USB-C. T200 sirf tab justify hota hai jab ₹600 strict limit ho.",
        ],
        pullquote: "₹600 mein entry-level decent — blades 2-3 mahine mein pulling shuru karte hain.",
        pros: [
          "Cheapest functional trimmer",
          "20 length settings, decent range",
          "Detachable washable head",
          "Lightweight (220g)",
        ],
        cons: [
          "Blades dull after 2-3 months",
          "No quick charge feature",
          "Cordless only",
          "Aggressive \"Misfit\" branding",
        ],
        verdict: "Strict ₹600 entry pick. ₹150 zyada deke Mi 2C significantly better.",
      }),
      mk({
        rank: 4,
        name: "Syska HT1500K Cordless",
        brand: "Syska",
        price: 699,
        rating: 3.7,
        testWeeks: 4,
        aspect: "4 / 3",
        imageLabel: "Syska HT1500 · Corded+cordless",
        specs: [
          { label: "Blades", value: "Titanium-coated" },
          { label: "Length settings", value: "12 (1-12mm)" },
          { label: "Runtime", value: "45 min / 8hr charge" },
          { label: "Quick charge", value: "Not specified" },
          { label: "Washable", value: "Detachable head" },
          { label: "Corded/cordless", value: "Both" },
          { label: "Weight", value: "260 g" },
          { label: "Warranty", value: "1 year" },
        ],
        review: [
          "Syska HT1500K ka USP hai titanium-coated blades — stainless steel se harder, theoretically longer sharp rehte hain. Hamare 4-hafta test mein blades decent sharp rahe, slight pulling 3 hafte mein. 12 length settings (1-12mm) limited range, precision kam. Corded + cordless dual mode biggest advantage hai ₹700 mein — battery dead ho to corded use karo.",
          "Build quality plastic, Syska branding subtle (Philips/Mi se thoda better in this regard). 260g slightly heavy. Charge time 8 ghanta slow hai, 8hr overnight charge karo. 45 min runtime acceptable. Detachable head washable. Syska lesser-known grooming brand but service network pan-India hai. Agar tumhe corded+cordless flexibility chahiye strict budget mein, yeh option hai. Lekin Mi 2C ₹50 zyada mein better blades + USB-C + 40 settings deta hai.",
        ],
        pullquote: "Titanium-coated blades — stainless steel se harder, theoretically longer sharp.",
        pros: [
          "Corded + cordless dual mode",
          "Titanium-coated blades",
          "Subtle branding, professional look",
          "Decent build quality",
        ],
        cons: [
          "8 hr charge time, very slow",
          "Only 12 length settings, limited",
          "Slight pulling after 3 weeks",
          "Heaviest at 260g",
        ],
        verdict: "Corded+cordless flexibility at ₹700. Blades average.",
      }),
      mk({
        rank: 5,
        name: "Nova NHT-1053",
        brand: "Nova",
        price: 449,
        rating: 3.5,
        testWeeks: 3,
        aspect: "1 / 1.2",
        imageLabel: "Nova NHT-1053 · Ultra-budget",
        specs: [
          { label: "Blades", value: "Stainless steel" },
          { label: "Length settings", value: "4 (1-12mm combs)" },
          { label: "Runtime", value: "30 min / 8hr charge" },
          { label: "Quick charge", value: "None" },
          { label: "Washable", value: "No, brush clean" },
          { label: "Corded/cordless", value: "Both" },
          { label: "Weight", value: "230 g" },
          { label: "Warranty", value: "1 year" },
        ],
        review: [
          "Nova NHT-1053 ₹450 mein ultra-budget pick hai. Corded + cordless dono support karta hai — ₹450 mein yeh feature rare. Lekin compromises significant hain: sirf 4 length combs (1, 3, 6, 12mm), no precision dial. 30 min runtime lowest in list. Head washable nahi, brush se clean karna padta hai — hygiene issue.",
          "Blades stainless steel, sharp initially but 1-2 mahine mein pulling shuru karte hain. Build quality basic plastic, Nova brand old hai lekin quality consistency inconsistent. Charge time 8 ghanta slow hai. Agar tumhara use case sirf occasional stubble trim hai aur strict ₹450 budget hai, yeh functional pick hai. Lekin serious grooming ke liye yeh suitable nahi. ₹150-300 zyada invest karke boAt/Mi/Syska lo — significantly better experience.",
        ],
        pullquote: "₹450 mein corded+cordless rare — lekin compromises significant, sirf occasional use ke liye.",
        pros: [
          "Cheapest with corded+cordless",
          "Corded mode saves battery anxiety",
          "Functional for occasional stubble",
          "Nova brand warranty pan-India",
        ],
        cons: [
          "Only 4 length combs, no precision",
          "Head not washable, hygiene issue",
          "30 min runtime, lowest in list",
          "Blades dull in 1-2 months",
        ],
        verdict: "Ultra-budget occasional-use pick. Upgrade plan banao in 3 months.",
      }),
    ],
    faqs: [
      {
        q: "Self-sharpening blades ka claim kaisa verify karu?",
        a: "Self-sharpening = blade friction se self-hone hota hai. Genuine brands (Philips, Panasonic) mein yeh 6+ mahine tak kaam karta hai. Cheap brands 2-3 mahine mein pulling shuru karte hain — test: beard hair ko trimmer pe pass karo, agar pulling feel ho to blades dull ho rahe hain.",
      },
      {
        q: "Corded vs cordless trimmer — kya choose karu?",
        a: "Corded = consistent power, no battery anxiety, but mobility limited. Cordless = portable, but battery degradation issue. Best: corded + cordless both support kare (Mi 2C, Syska, Nova). Budget cordless-only (Philips BT1232) tab acceptable jab quick charge feature ho.",
      },
      {
        q: "Length settings kitne chahiye?",
        a: "Stubble = 0.5-3mm range with 0.5mm precision. Full beard = 5-15mm range with 1mm precision. Body grooming = 10-20mm range. 20+ settings ideal for general use. 4 combs (Nova) sirf stubble/short beard ke liye sufficient.",
      },
      {
        q: "Trimmer kitne mahine mein replace karna padta hai?",
        a: "Blade replacement: 6-12 months (Philips/Mi), 3-4 months (budget). Full trimmer replacement: 2-3 years (decent brands), 1 year (ultra-budget). ₹1,000 mein Philips/Mi lo, 2+ saal chalta hai with blade replacement.",
      },
      {
        q: "IPX7 waterproof ka kya matlab hai?",
        a: "IPX7 = 1m depth mein 30 min water submerged. Trimmer head ko under-tap wash kar sakte ho, hygiene ke liye essential. Non-waterproof trimmers (Nova) ko brush se clean karna padta hai, oil + hair buildup se blade sharpness kam hoti hai.",
      },
    ],
    comparisonCols: ["Blades", "Settings", "Runtime", "Corded+cordless", "Washable", "Price"],
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

/**
 * Compute the product image URL. Individual product photos live at
 * /images/products/{slug}-{rank}.png and are generated by the image-generation skill.
 */
export function productImageSlug(slug: string, rank: number): string {
  return `/images/products/${slug}-${rank}.png`;
}

/** Convenience: get the #1 pick from each category for the "Best of" page. */
export const bestOfPicks = categories.map((c) => ({
  category: c,
  product: c.products.find((p) => p.rank === c.topPickRank)!,
}));

/** Flattened list of all products with their category attached (for global views). */
export type FlatProduct = Product & { categorySlug: string; categoryName: string; categoryAccent: string; categoryHero: string };
export const allProducts: FlatProduct[] = categories.flatMap((c) =>
  c.products.map((p) => ({
    ...p,
    categorySlug: c.slug,
    categoryName: c.name,
    categoryAccent: c.accent,
    categoryHero: c.hero,
  }))
);

/** Discount percentage for a product. */
export function discountPct(p: { price: number; mrp: number }): number {
  return Math.round((1 - p.price / p.mrp) * 100);
}

/** "Deal of the day" — deterministic pick based on the current date (changes daily). */
export function dealOfTheDay(): { product: FlatProduct; discount: number } {
  const sorted = [...allProducts].sort((a, b) => discountPct(b) - discountPct(a));
  // Top 10 by discount, then pick by day-of-year modulo 10 so it rotates daily
  const top = sorted.slice(0, 10);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const product = top[dayOfYear % top.length];
  return { product, discount: discountPct(product) };
}

/** Related products: picks from OTHER categories, sorted by rating + price proximity. */
export function relatedProducts(currentSlug: string, currentPrice: number, limit = 3): FlatProduct[] {
  return allProducts
    .filter((p) => p.categorySlug !== currentSlug)
    .map((p) => ({ p, score: p.rating * 2 - Math.abs(p.price - currentPrice) / 500 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

