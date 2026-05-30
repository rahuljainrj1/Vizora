import { AdminShell } from "@/components/app/admin-shell";
import type { ReactNode } from "react";
import {
  CinematicShowcase,
  CollaborativeDecisionLayout,
  EditorialFullBleed,
  MaterialFocusSplit,
  sampleDisplayProducts,
  VisualGridCards,
} from "@/components/catalog/product-display-layouts";

export default function CatalogLayoutsPage() {
  const [featured, windowProduct, laminateProduct] = sampleDisplayProducts;

  return (
    <AdminShell
      eyebrow="Display system"
      title="Premium product layouts"
      description="Five reusable catalog presentation patterns for fabrication, interior, and architectural product evaluation."
    >
      <div className="grid gap-14">
        <LayoutSection
          eyebrow="Layout 1"
          title="Editorial Full Bleed"
          description="High-emotion hero presentation for flagship products and catalog covers."
        >
          <EditorialFullBleed product={featured} />
        </LayoutSection>

        <LayoutSection
          eyebrow="Layout 2"
          title="Material Focus Split"
          description="A detailed evaluation layout with sticky product information and material emphasis."
        >
          <MaterialFocusSplit product={windowProduct} />
        </LayoutSection>

        <LayoutSection
          eyebrow="Layout 3"
          title="Visual Grid Card"
          description="Fast image-first browsing for categories, selection, and shortlist building."
        >
          <VisualGridCards products={sampleDisplayProducts} />
        </LayoutSection>

        <LayoutSection
          eyebrow="Layout 4"
          title="Cinematic Showcase"
          description="Dark, immersive product storytelling for premium showroom presentation."
        >
          <CinematicShowcase product={laminateProduct} />
        </LayoutSection>

        <LayoutSection
          eyebrow="Layout 5"
          title="Collaborative Decision Layout"
          description="A calm comparison view for customer review, notes, and finalization."
        >
          <CollaborativeDecisionLayout products={sampleDisplayProducts} />
        </LayoutSection>
      </div>
    </AdminShell>
  );
}

function LayoutSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5">
      <div className="max-w-3xl">
        <p className="uppercase-label text-muted">{eyebrow}</p>
        <h2 className="editorial-title mt-2 text-4xl leading-[1.08]">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-body">{description}</p>
      </div>
      {children}
    </section>
  );
}
