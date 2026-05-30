import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SetupPanel } from "@/components/app/admin-shell";
import { CollaborativeSessionView } from "@/components/session/collaborative-session-view";
import { ReadonlyCatalog } from "@/components/session/readonly-catalog";
import {
  getCollaborativeSessionBundle,
  getSessionBundle,
} from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SessionPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SessionPageProps): Promise<Metadata> {
  if (!isSupabaseConfigured()) {
    return {
      title: "Catalog unavailable | Vizora",
    };
  }

  try {
    const { id } = await params;
    const collaborativeBundle = await getCollaborativeSessionBundle(id).catch(
      () => null,
    );
    if (collaborativeBundle) {
      const heroImage =
        collaborativeBundle.products[0]?.images.find((image) => image.is_primary) ??
        collaborativeBundle.products[0]?.images[0];
      const title = `${collaborativeBundle.session.title} | ${collaborativeBundle.vendor.business_name}`;

      return {
        title,
        description:
          "A mobile showroom decision session for reviewing, shortlisting, comparing, and noting products.",
        openGraph: {
          title,
          description:
            "A mobile showroom decision session for reviewing, shortlisting, comparing, and noting products.",
          type: "website",
          images: heroImage ? [{ url: heroImage.public_url }] : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title,
          description:
            "A mobile showroom decision session for reviewing, shortlisting, comparing, and noting products.",
          images: heroImage ? [heroImage.public_url] : undefined,
        },
      };
    }

    const bundle = await getSessionBundle(id);
    const heroImage =
      bundle.products[0]?.images.find((image) => image.is_primary) ??
      bundle.products[0]?.images[0];
    const title = `${bundle.catalog.title} | ${bundle.vendor.business_name}`;
    const description = getCatalogDescription(bundle.catalog.options);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: heroImage ? [{ url: heroImage.public_url }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: heroImage ? [heroImage.public_url] : undefined,
      },
    };
  } catch {
    return {
      title: "Catalog unavailable | Vizora",
    };
  }
}

function getCatalogDescription(options: unknown) {
  if (options && typeof options === "object" && !Array.isArray(options)) {
    const value = (options as Record<string, unknown>).description;
    if (typeof value === "string" && value.trim()) return value;
  }

  return "A mobile-ready fabrication and interiors catalog selection.";
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="min-h-screen bg-canvas p-4 text-ink">
        <SetupPanel message="Supabase credentials are required before public catalog sessions can render." />
      </main>
    );
  }

  let bundle;
  const collaborativeBundle = await getCollaborativeSessionBundle(id).catch(
    () => null,
  );
  if (collaborativeBundle) {
    return <CollaborativeSessionView bundle={collaborativeBundle} />;
  }

  try {
    bundle = await getSessionBundle(id);
  } catch {
    notFound();
  }

  return <ReadonlyCatalog bundle={bundle} />;
}
