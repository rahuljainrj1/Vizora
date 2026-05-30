"use client";

import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import type { Category, ProductWithImages, Vendor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CatalogPdfDocument } from "./catalog-pdf";

export function PdfDownloadButton({
  vendor,
  categories,
  products,
  title,
  coverTitle,
  description,
  layoutByProduct,
  variant = "default",
  className,
  iconOnly = false,
  tooltipLabel,
}: {
  vendor: Vendor;
  categories: Category[];
  products: ProductWithImages[];
  title: string;
  coverTitle: string;
  description?: string;
  layoutByProduct?: Record<string, "hero" | "image" | "compact" | "detail">;
  variant?: ButtonProps["variant"];
  className?: string;
  iconOnly?: boolean;
  tooltipLabel?: string;
}) {
  const download = (
    <PDFDownloadLink
      aria-disabled={!products.length}
      aria-label="Download PDF"
      className={cn(
        buttonVariants({ variant }),
        "disabled:pointer-events-none disabled:opacity-50",
        !products.length && "pointer-events-none opacity-50",
        className,
      )}
      document={
        <CatalogPdfDocument
          vendor={vendor}
          categories={categories}
          products={products}
          title={title}
          coverTitle={coverTitle}
          description={description}
          layoutByProduct={layoutByProduct}
        />
      }
      fileName={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "catalog"}.pdf`}
      title={tooltipLabel ?? "Download PDF"}
    >
      {({ loading }: { loading: boolean }) => (
        <>
          <Download className="h-4 w-4" />
          {iconOnly ? (
            <span className="sr-only">
              {loading ? "Preparing PDF" : "Download PDF"}
            </span>
          ) : (
            loading ? "Preparing PDF" : "Download PDF"
          )}
        </>
      )}
    </PDFDownloadLink>
  );

  if (!iconOnly) return download;

  return (
    <span className="group relative inline-flex">
      {download}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-ink px-2 py-1 text-xs font-medium text-on-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        {tooltipLabel ?? "Download PDF"}
      </span>
    </span>
  );
}
