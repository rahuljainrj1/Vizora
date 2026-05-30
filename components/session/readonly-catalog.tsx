/* eslint-disable @next/next/no-img-element */

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Category, ProductWithImages, SessionBundle } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ShareButton } from "./share-button";
import { SessionTracker } from "./session-tracker";

export function ReadonlyCatalog({ bundle }: { bundle: SessionBundle }) {
  const { vendor, catalog, categories, products, session } = bundle;
  const grouped = groupProducts(categories, products);
  const description = getCatalogDescription(catalog.options);
  const layoutByProduct = getLayoutByProduct(catalog.options);
  const heroImage =
    products[0]?.images.find((image) => image.is_primary) ?? products[0]?.images[0];
  const phoneDigits = vendor.phone?.replace(/\D/g, "");

  return (
    <main className="min-h-screen bg-canvas pb-24 text-ink">
      <SessionTracker sessionId={session.id} />
      <section className="border-b border-hairline bg-surface-soft">
        {heroImage ? (
          <img
            src={heroImage.public_url}
            alt={heroImage.alt_text ?? catalog.title}
            className="aspect-[4/5] w-full object-cover sm:aspect-[16/10]"
          />
        ) : null}
        <div className="px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            {vendor.logo_url ? (
              <img
                src={vendor.logo_url}
                alt={`${vendor.business_name} logo`}
                className="h-14 w-14 object-contain"
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center border border-ink text-lg font-bold">
                V
              </div>
            )}
            <div className="vizora-stripe mt-1 h-1 w-32" />
          </div>
          <div className="mt-8">
            <p className="uppercase-label mb-3 text-body">{vendor.business_name}</p>
            <h1 className="text-4xl font-bold uppercase leading-tight">
              {catalog.cover_title ?? catalog.title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-body">
              {description}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-10 px-4 py-10">
        {grouped.map((group) => (
          <div key={group.name} className="grid gap-5">
            <div>
              <p className="uppercase-label text-muted">Category</p>
              <h2 className="mt-2 text-3xl font-bold uppercase">{group.name}</h2>
            </div>
            {group.products.map((product, index) => (
              <ProductArticle
                key={product.id}
                product={product}
                layout={layoutByProduct[product.id] ?? (index === 0 ? "hero" : "image")}
              />
            ))}
          </div>
        ))}
      </section>

      <section className="border-y border-hairline bg-surface-soft px-4 py-8">
        <p className="uppercase-label text-muted">Contact</p>
        <h2 className="mt-2 text-3xl font-bold uppercase">{vendor.business_name}</h2>
        <div className="mt-5 grid gap-3 text-body">
          {vendor.phone ? (
            <a href={`tel:${vendor.phone}`} className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-ink" />
              {vendor.phone}
            </a>
          ) : null}
          {vendor.email ? (
            <a href={`mailto:${vendor.email}`} className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-ink" />
              {vendor.email}
            </a>
          ) : null}
          {vendor.address ? (
            <p className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-ink" />
              {vendor.address}
            </p>
          ) : null}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-canvas/95 p-3 backdrop-blur">
        <div className="grid grid-cols-2 gap-3">
          {phoneDigits ? (
            <a
              href={`https://wa.me/${phoneDigits}`}
              className="inline-flex h-12 items-center justify-center gap-2 border border-ink bg-ink px-4 text-sm font-bold uppercase tracking-[1.5px] text-on-primary"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          ) : (
            <a
              href={vendor.email ? `mailto:${vendor.email}` : "#"}
              className="inline-flex h-12 items-center justify-center gap-2 border border-ink bg-ink px-4 text-sm font-bold uppercase tracking-[1.5px] text-on-primary"
            >
              <Mail className="h-4 w-4" />
              Contact
            </a>
          )}
          <ShareButton />
        </div>
      </div>
    </main>
  );
}

function getCatalogDescription(options: unknown) {
  if (options && typeof options === "object" && !Array.isArray(options)) {
    const value = (options as Record<string, unknown>).description;
    if (typeof value === "string" && value.trim()) return value;
  }

  return "A curated fabrication and interiors selection prepared for mobile viewing, showroom sharing, and quick vendor follow-up.";
}

type ProductLayout = "hero" | "image" | "compact" | "detail";

function ProductArticle({
  product,
  layout,
}: {
  product: ProductWithImages;
  layout: ProductLayout;
}) {
  const image = product.images.find((item) => item.is_primary) ?? product.images[0];

  if (layout === "compact") {
    return (
      <article className="grid grid-cols-[96px_1fr] gap-4 border-b border-hairline pb-6 last:border-b-0">
        {image ? (
          <img
            src={image.public_url}
            alt={image.alt_text ?? product.name}
            className="h-28 w-24 object-cover"
          />
        ) : (
          <div className="h-28 w-24 bg-surface-card" />
        )}
        <ProductInfo product={product} compact />
      </article>
    );
  }

  if (layout === "detail") {
    return (
      <article className="border-b border-hairline pb-8 last:border-b-0">
        <ProductInfo product={product} />
        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-hairline py-4">
          <Spec label="Material" value={product.material_type} />
          <Spec label="Finish" value={product.finish_color} />
        </div>
        {image ? (
          <img
            src={image.public_url}
            alt={image.alt_text ?? product.name}
            className="mt-5 aspect-[16/10] w-full object-cover"
          />
        ) : null}
      </article>
    );
  }

  return (
    <article className="border-b border-hairline pb-8 last:border-b-0">
      {image ? (
        <img
          src={image.public_url}
          alt={image.alt_text ?? product.name}
          className={layout === "hero" ? "aspect-[16/10] w-full object-cover" : "photo-ratio w-full object-cover"}
        />
      ) : null}
      <div className="pt-4">
        <ProductInfo product={product} hero={layout === "hero"} />
        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-hairline py-4">
          <Spec label="Material" value={product.material_type} />
          <Spec label="Finish" value={product.finish_color} />
        </div>
      </div>
    </article>
  );
}

function ProductInfo({
  product,
  compact = false,
  hero = false,
}: {
  product: ProductWithImages;
  compact?: boolean;
  hero?: boolean;
}) {
  return (
    <div>
      <p className="uppercase-label text-muted">{product.sku}</p>
      <h3
        className={`mt-2 font-bold leading-tight ${
          hero ? "text-3xl" : compact ? "text-xl" : "text-2xl"
        }`}
      >
        {product.name}
      </h3>
      {product.description && !compact ? (
        <p className="mt-3 text-base leading-7 text-body">{product.description}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {product.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function getLayoutByProduct(options: unknown): Record<string, ProductLayout> {
  if (options && typeof options === "object" && !Array.isArray(options)) {
    const value = (options as Record<string, unknown>).layoutByProduct;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, ProductLayout] =>
            typeof entry[1] === "string" &&
            ["hero", "image", "compact", "detail"].includes(entry[1]),
        ),
      );
    }
  }

  return {};
}

function Spec({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="uppercase-label text-muted">{label}</p>
      <p className="mt-1 text-sm text-body-strong">{value || "On request"}</p>
    </div>
  );
}

function groupProducts(categories: Category[], products: ProductWithImages[]) {
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const groups = new Map<string, { name: string; products: ProductWithImages[] }>();

  for (const product of products) {
    const name =
      (product.category_id && categoryById.get(product.category_id)?.name) ||
      "Uncategorized";
    groups.set(name, {
      name,
      products: [...(groups.get(name)?.products ?? []), product],
    });
  }

  return Array.from(groups.values());
}
