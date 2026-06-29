# DealHub India

DealHub India is a Next.js product discovery and deal-review platform for Indian shoppers. It organizes buying guides, curated categories, price alerts, product submissions, comments, and SEO-friendly content in one modern storefront experience.

## Highlights

- Curated product categories for smartwatches, power banks, grooming, gaming peripherals, and desk setup gear.
- Category pages with product cards, images, rankings, pricing, and review-focused content.
- Newsletter subscription flow for deal alerts.
- Product submission workflow for reader-recommended products.
- Price alert support for per-product target prices.
- Reader comments with moderation-friendly data models.
- SEO support with sitemap, feed route, robots file, and canonical URL helpers.
- Standalone production build flow for deployment.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js, React, TypeScript |
| Styling | Tailwind CSS, Radix UI, shadcn/ui patterns |
| Database | Prisma, SQLite or libSQL-compatible setup |
| UI and motion | Framer Motion, Lucide React, Recharts |
| Product data | TypeScript data modules and Prisma-backed user actions |

## Project Structure

```text
dealhub-india/
├── prisma/schema.prisma        # Newsletter, price alert, submission, and comments models
├── public/images/              # Category and product imagery
├── scripts/                    # Production asset copy helpers
├── src/app/                    # Next.js app routes and API endpoints
├── src/components/dealhub/     # DealHub pages, shell, header, footer, and sections
├── src/data/products.ts        # Curated product data
└── src/lib/site.ts             # Canonical URLs and image helpers
```

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- SQLite/libSQL database URL for Prisma

### Installation

```bash
git clone https://github.com/rs9313399-dot/dealhub-india.git
cd dealhub-india
bun install
```

Create `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Prepare the database:

```bash
bun run db:generate
bun run db:push
```

Start the app:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server |
| `bun run build` | Build the standalone app and copy required assets |
| `bun run start` | Run the standalone production server |
| `bun run lint` | Run lint checks |
| `bun run db:migrate` | Create a local Prisma migration |

## API Areas

- `/api/newsletter`
- `/api/price-alerts`
- `/api/price-check`
- `/api/submissions`
- `/api/submit-product`
- `/api/comments`

## Author

Built by [Ratnesh Singh](https://github.com/rs9313399-dot).

