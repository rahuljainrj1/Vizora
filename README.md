# Vizora MVP1 Catalog Platform

Lightweight fabrication/interior catalog workflow tester for a single vendor. It is intentionally not ecommerce, not a marketplace, and not a complex SaaS dashboard.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and fill in the Supabase values.
4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## AI Product Image Edge Function

`supabase/functions/product-image-ai` analyzes a product image with OpenAI,
generates premium catalog metadata, and can write a transparent PNG cutout back
to `product-images`.

Deploy it after the Supabase project is connected:

```bash
supabase functions deploy product-image-ai
supabase secrets set OPENAI_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=...
```

Optional model/quality controls:

```bash
supabase secrets set OPENAI_VISION_MODEL=gpt-5-mini OPENAI_IMAGE_MODEL=gpt-image-1.5 OPENAI_IMAGE_QUALITY=high OPENAI_IMAGE_SIZE=auto
```

The product page uses `/api/products/[id]/ai-enrich`, which invokes the Edge
Function with the primary product image, updates description/material/finish/tags,
stores the full AI analysis in `products.ai_metadata`, and saves the
background-removed transparent PNG cutout as an additional product image.

## MVP Boundaries

- No login.
- No payments.
- No marketplace.
- No customer accounts.
- No AR.
- No recommendation engine.
- No full analytics.

Admin routes are intentionally unprotected for MVP1 and should be shared only through an unlisted/private deployment URL.
