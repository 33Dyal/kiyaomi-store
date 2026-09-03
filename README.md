# Kiyomi Online Store

A boutique fashion e-commerce platform — Next.js 16, React 19, Prisma/PostgreSQL, Stripe, Cloudinary, Resend.

## ⚠️ Build status (read this first)

This repo is being built in phases. **Phases 1–2 (project setup, design system,
full database schema) are done and verified.** Everything below that is
planned but not yet implemented — see [Roadmap](#roadmap).

What "verified" means here: this project was scaffolded and built inside a
sandboxed environment with **no access to Google Fonts, Prisma's binary
CDN, or any live database/Stripe/Cloudinary/Resend service**. `next build`
was confirmed to compile and prerender successfully with those two network
calls stubbed out. Once you clone this locally with normal internet access
and real credentials, run through [Local development](#local-development)
below to get a fully working `next build`.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, JavaScript, Tailwind CSS 4, Framer Motion, TanStack Query, Zustand, React Hook Form + Zod
- **Backend:** Next.js Route Handlers, Prisma ORM, PostgreSQL, JWT auth
- **Integrations:** Stripe, Cloudinary, Resend, Google Maps, optional Twilio/WhatsApp

## Folder structure

```
src/
  app/            # App Router pages + API routes
  components/ui/  # Design system primitives (Button, PriceDisplay, ...)
  config/brand.js # Single source of truth for brand colors, copy, categories
  lib/
    db/prisma.js  # Prisma client singleton
    env.js        # Zod-validated environment config
    utils/        # cn(), formatPrice(), apiResponse() helpers
prisma/
  schema.prisma   # Full data model (25 models — see below)
```

## Brand & content note

We could not verify a real Instagram account at **@kyomi___store** — public
search returned no matching, verifiable account. Per the project brief's own
instruction, `src/config/brand.js` ships with an original, tasteful
"premium boutique" design system (warm neutrals + oxblood accent, serif
display + clean sans body) rather than invented brand facts. Every
brand-specific value — colors, logo, copy, categories, currency (currently
KES) — lives in that one file, so re-skinning the whole site is a config
change, not a rewrite.

## Database schema

`prisma/schema.prisma` implements the full 25-model schema from the spec:
User, RefreshToken, Address, Category, Product, ProductImage,
ProductVariant, Inventory, InventoryHistory, Cart, CartItem, Wishlist,
WishlistItem, Order, OrderItem, Payment, Refund, Coupon, CouponUsage,
DeliveryZone, DeliveryMethod, Delivery, Review, SupportTicket,
SupportMessage, ReturnRequest, Notification, NewsletterSubscriber,
StoreSettings, AuditLog — plus supporting enums for order/payment/delivery/
ticket/coupon/review status. Prices are stored as integer minor units
(cents) to avoid floating-point rounding bugs.

## Local development

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in real values — see comments in `.env.example` for where to get
   each credential (Neon/Supabase, Stripe dashboard, Cloudinary console,
   Resend, Google Cloud Console). At minimum for local dev you need
   `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`.
3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. **Run the dev server**
   ```bash
   npm run dev
   ```

## Testing

```bash
npm run test        # vitest run
npm run test:watch
```

Test coverage will grow alongside each phase; see Roadmap.

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Project setup + design system | ✅ Done |
| 2 | Database + Prisma schema | ✅ Done |
| 3 | Authentication (JWT, refresh tokens, RBAC) | ⏳ Not started |
| 4 | Product/catalog system + search | ⏳ Not started |
| 5 | Cart + wishlist | ⏳ Not started |
| 6 | Checkout | ⏳ Not started |
| 7 | Stripe payments + webhooks | ⏳ Not started |
| 8 | Orders + inventory | ⏳ Not started |
| 9 | Delivery + Google Maps | ⏳ Not started |
| 10 | Email + notifications | ⏳ Not started |
| 11 | Customer dashboard | ⏳ Not started |
| 12 | Admin dashboard | ⏳ Not started |
| 13 | Support + returns + reviews | ⏳ Not started |
| 14 | SEO + performance + security hardening | ⏳ Not started |
| 15 | Testing + deployment | ⏳ Not started |

## Deployment (once later phases are done)

Target: Vercel + Neon/Supabase Postgres + Stripe production mode. See
`.env.example` for the full variable list; the app fails fast with a clear
error (via `src/lib/env.js`) if anything required is missing at runtime.
