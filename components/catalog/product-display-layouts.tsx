/* eslint-disable @next/next/no-img-element */

import {
  CheckCircle2,
  Heart,
  MessageSquareText,
  Ruler,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DisplayProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  material: string;
  finish: string;
  dimensions: string;
  leadTime: string;
  priceBand: string;
  description: string;
  image: string;
  detailImage: string;
  tags: string[];
  featured?: boolean;
  saved?: boolean;
  note?: string;
};

export const sampleDisplayProducts: DisplayProduct[] = [
  {
    id: "p-rail-bronze",
    sku: "RAIL-012",
    name: "Linear Bronze Railing",
    category: "Railing",
    material: "Powder-coated aluminium",
    finish: "Muted bronze satin",
    dimensions: "Custom length, 42 in height",
    leadTime: "18-24 days",
    priceBand: "Premium",
    description:
      "A slim architectural railing profile for balconies, staircases, and double-height interiors where the linework should feel intentional but quiet.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    detailImage:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85",
    tags: ["Balcony", "Low maintenance", "Custom size"],
    featured: true,
    saved: true,
    note: "Shortlist for staircase landing. Client prefers warm metal tone.",
  },
  {
    id: "p-window-black",
    sku: "WIN-044",
    name: "Slimline Black Window",
    category: "Windows",
    material: "Thermal aluminium frame",
    finish: "Matte black",
    dimensions: "6 ft x 5 ft module",
    leadTime: "21-28 days",
    priceBand: "Signature",
    description:
      "A minimal window system with narrow sightlines, designed for large openings and clean contemporary facades.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    detailImage:
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85",
    tags: ["Thermal", "Minimal profile", "Facade"],
    saved: true,
    note: "Good for master bedroom facade if budget allows.",
  },
  {
    id: "p-laminate-walnut",
    sku: "LAM-203",
    name: "Smoked Walnut Laminate",
    category: "Laminates",
    material: "High-pressure laminate",
    finish: "Open grain walnut",
    dimensions: "8 ft x 4 ft sheet",
    leadTime: "In stock",
    priceBand: "Mid premium",
    description:
      "A warm walnut surface with a restrained grain pattern for wardrobes, panels, and wall details.",
    image:
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1600&q=85",
    detailImage:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=85",
    tags: ["Wardrobes", "Wall panels", "Warm tone"],
    note: "Pair with stone flooring and linen upholstery.",
  },
  {
    id: "p-tile-travertine",
    sku: "TILE-088",
    name: "Travertine Porcelain Slab",
    category: "Tiles",
    material: "Porcelain slab",
    finish: "Honed travertine",
    dimensions: "1200 x 2400 mm",
    leadTime: "10-14 days",
    priceBand: "Premium",
    description:
      "Large-format porcelain with natural travertine movement for bathrooms, lobby walls, and feature surfaces.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85",
    detailImage:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
    tags: ["Large format", "Bathroom", "Lobby"],
  },
];

export function EditorialFullBleed({ product }: { product: DisplayProduct }) {
  return (
    <article className="overflow-hidden rounded-[10px] bg-surface-soft shadow-[0_24px_70px_rgba(40,44,63,0.08)]">
      <div className="relative min-h-[520px]">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/76 via-ink/22 to-transparent" />
        <div className="relative flex min-h-[520px] flex-col justify-end p-6 text-white sm:p-10 lg:p-14">
          <p className="uppercase-label text-white/70">{product.category}</p>
          <h2 className="editorial-title mt-4 max-w-3xl text-5xl leading-[1.02] sm:text-7xl">
            {product.name}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge className="border-white/25 bg-white/12 text-white">
              {product.sku}
            </Badge>
            <Badge className="border-white/25 bg-white/12 text-white">
              {product.finish}
            </Badge>
          </div>
        </div>
      </div>
      <div className="grid gap-6 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr]">
        <p className="text-xl leading-8 text-body-strong">{product.description}</p>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <SpecBlock label="Material" value={product.material} />
          <SpecBlock label="Lead time" value={product.leadTime} />
          <SpecBlock label="Price band" value={product.priceBand} />
        </div>
      </div>
    </article>
  );
}

export function MaterialFocusSplit({ product }: { product: DisplayProduct }) {
  return (
    <article className="grid overflow-hidden rounded-[10px] border border-hairline bg-surface-soft shadow-[0_24px_70px_rgba(40,44,63,0.07)] lg:grid-cols-[minmax(0,1.1fr)_420px]">
      <div className="grid gap-px bg-hairline lg:grid-rows-[1fr_220px]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full min-h-[360px] w-full object-cover"
        />
        <img
          src={product.detailImage}
          alt={`${product.name} detail`}
          className="h-full w-full object-cover"
        />
      </div>
      <aside className="self-start p-6 lg:sticky lg:top-24 lg:p-8">
        <p className="uppercase-label text-muted">{product.sku}</p>
        <h2 className="editorial-title mt-3 text-4xl leading-[1.08]">
          {product.name}
        </h2>
        <p className="mt-5 text-sm leading-6 text-body">{product.description}</p>
        <div className="mt-8 grid gap-3">
          <SpecBlock label="Material" value={product.material} icon={<Sparkles />} />
          <SpecBlock label="Finish" value={product.finish} icon={<CheckCircle2 />} />
          <SpecBlock label="Dimensions" value={product.dimensions} icon={<Ruler />} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </aside>
    </article>
  );
}

export function VisualGridCards({ products }: { products: DisplayProduct[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className={cn(
            "group overflow-hidden rounded-[10px] transition-transform duration-300 hover:-translate-y-1",
            product.featured && "ring-1 ring-m-blue-dark",
          )}
        >
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {product.featured ? (
              <Badge className="absolute left-3 top-3 border-white/30 bg-white/90 text-ink">
                Featured
              </Badge>
            ) : null}
          </div>
          <div className="p-4">
            <p className="uppercase-label text-muted">{product.sku}</p>
            <h3 className="mt-2 text-base font-semibold text-ink">{product.name}</h3>
            <p className="mt-1 text-sm text-body">{product.finish}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CinematicShowcase({ product }: { product: DisplayProduct }) {
  return (
    <article className="overflow-hidden rounded-[10px] bg-[#070708] text-white">
      <div className="grid min-h-[680px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          <div>
            <p className="uppercase-label text-white/55">{product.category}</p>
            <h2 className="mt-5 max-w-xl text-5xl font-semibold uppercase leading-[0.98] tracking-normal sm:text-7xl">
              {product.name}
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/64">
              {product.description}
            </p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[8px] bg-white/12 sm:grid-cols-3">
            <DarkSpec label="Material" value={product.material} />
            <DarkSpec label="Finish" value={product.finish} />
            <DarkSpec label="Lead time" value={product.leadTime} />
          </div>
        </div>
        <div className="relative min-h-[420px]">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070708] via-transparent to-transparent" />
          <div className="absolute bottom-6 right-6 rounded-full border border-white/20 bg-black/35 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/72 backdrop-blur">
            {product.priceBand}
          </div>
        </div>
      </div>
    </article>
  );
}

export function CollaborativeDecisionLayout({
  products,
}: {
  products: DisplayProduct[];
}) {
  return (
    <article className="rounded-[10px] border border-hairline bg-surface-soft p-5 shadow-[0_24px_70px_rgba(40,44,63,0.07)] sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="uppercase-label text-muted">Decision shortlist</p>
          <h2 className="editorial-title mt-2 text-4xl leading-[1.08]">
            Compare final options
          </h2>
        </div>
        <Button variant="outline" className="bg-surface-soft">
          <MessageSquareText className="h-4 w-4" />
          Add review note
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {products.slice(0, 3).map((product) => (
          <div
            key={product.id}
            className="grid gap-4 rounded-[8px] border border-hairline bg-canvas p-3"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="aspect-[4/3] w-full rounded-[6px] object-cover"
              />
              <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-white/88 text-ink">
                <Heart className={cn("h-4 w-4", product.saved && "fill-ink")} />
              </span>
            </div>
            <div>
              <p className="uppercase-label text-muted">{product.sku}</p>
              <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm text-body">{product.finish}</p>
            </div>
            <div className="grid gap-2 border-y border-hairline py-3 text-sm">
              <ComparisonRow label="Material" value={product.material} />
              <ComparisonRow label="Lead time" value={product.leadTime} />
              <ComparisonRow label="Price" value={product.priceBand} />
            </div>
            <div className="rounded-[6px] border border-dashed border-hairline bg-surface-soft p-3 text-sm leading-6 text-body">
              {product.note ?? "Add customer note or decision context."}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function SpecBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[8px] border border-hairline bg-surface-card p-4">
      <div className="flex items-center gap-2 text-muted">
        {icon ? <span className="[&_svg]:h-4 [&_svg]:w-4">{icon}</span> : null}
        <p className="uppercase-label">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-body-strong">{value}</p>
    </div>
  );
}

function DarkSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.06] p-4">
      <p className="uppercase-label text-white/45">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-body">{label}</span>
      <span className="text-right font-semibold text-body-strong">{value}</span>
    </div>
  );
}
