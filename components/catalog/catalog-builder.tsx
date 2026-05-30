"use client";

/* eslint-disable @next/next/no-img-element */

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Link2,
  Save,
  Search,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { SetupPanel } from "@/components/app/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/client-api";
import { useBootstrapQuery, useInvalidateWorkspaceQueries } from "@/lib/queries";
import { formatSeconds } from "@/lib/utils";
import type {
  BootstrapData,
  Catalog,
  CatalogSession,
  ProductWithImages,
} from "@/lib/types";

const PdfDownloadButton = dynamic(
  () => import("./pdf-download-button").then((module) => module.PdfDownloadButton),
  { ssr: false },
);

const DEFAULT_CATALOG_TITLE = "Client Material Edit";
const DEFAULT_COVER_TITLE = "Materials for Review";
const DEFAULT_CATALOG_DESCRIPTION =
  "Curated finishes, material options, and fabrication details prepared for client review.";
const BUILDER_STEPS = [
  {
    eyebrow: "Catalog brief",
    title: "Name the edit",
    label: "Brief",
    description:
      "This text becomes the cover and the first message customers see when the link opens.",
  },
  {
    eyebrow: "Products",
    title: "Choose items",
    label: "Items",
    description: "Pick the SKUs that belong in this customer-facing catalog.",
  },
  {
    eyebrow: "Sequence",
    title: "Arrange the story",
    label: "Order",
    description:
      "Lead with the strongest product images, then group similar materials together.",
  },
  {
    eyebrow: "Share",
    title: "Send the catalog",
    label: "Share",
    description:
      "Save the working edit, export a printable PDF, or create a mobile link for WhatsApp.",
  },
] as const;
const PRODUCT_LAYOUT_OPTIONS = [
  {
    id: "hero",
    label: "Hero",
    description: "Large lead product with strongest image.",
  },
  {
    id: "image",
    label: "Image-led",
    description: "Big image with concise product details.",
  },
  {
    id: "compact",
    label: "Compact",
    description: "Small card for supporting SKUs.",
  },
  {
    id: "detail",
    label: "Detail",
    description: "Specs and finish information first.",
  },
] as const;

type ProductLayout = (typeof PRODUCT_LAYOUT_OPTIONS)[number]["id"];

type CatalogBuilderProps = {
  catalogId?: string | null;
  header?: {
    eyebrow: string;
    title: string;
    description: string;
  };
};

export function CatalogBuilder(props: CatalogBuilderProps) {
  const {
    data = null,
    error: loadError,
    isLoading,
  } = useBootstrapQuery();

  const error =
    loadError instanceof Error ? loadError.message : loadError ? "Load failed" : null;

  if (isLoading) {
    return (
      <div className="rounded-[8px] border border-hairline bg-surface-soft p-8 text-body shadow-[0_18px_45px_rgba(40,44,63,0.05)]">
        Loading catalog builder...
      </div>
    );
  }

  if (error && !data) {
    return <SetupPanel message={error} />;
  }

  if (!data) {
    return <SetupPanel message="Catalog data is unavailable." />;
  }

  return (
    <CatalogBuilderWorkspace
      key={props.catalogId ?? "new"}
      {...props}
      data={data}
    />
  );
}

function CatalogBuilderWorkspace({
  catalogId,
  header,
  data,
}: CatalogBuilderProps & { data: BootstrapData }) {
  const router = useRouter();
  const invalidateWorkspaceQueries = useInvalidateWorkspaceQueries();
  const initialCatalog = catalogId
    ? data.catalogs.find((catalog) => catalog.id === catalogId) ?? null
    : null;
  const initialSelectedIds = initialCatalog
    ? getCatalogProductIds(initialCatalog)
    : data.products.filter((product) => product.featured).map((product) => product.id);
  const [activeCatalog, setActiveCatalog] = useState<Catalog | null>(initialCatalog);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [title, setTitle] = useState(
    initialCatalog
      ? normalizeLegacyTitle(initialCatalog.title, DEFAULT_CATALOG_TITLE)
      : DEFAULT_CATALOG_TITLE,
  );
  const [coverTitle, setCoverTitle] = useState(
    initialCatalog
      ? normalizeLegacyTitle(
          initialCatalog.cover_title ?? initialCatalog.title,
          DEFAULT_COVER_TITLE,
        )
      : DEFAULT_COVER_TITLE,
  );
  const [description, setDescription] = useState(
    initialCatalog ? getCatalogDescription(initialCatalog) : DEFAULT_CATALOG_DESCRIPTION,
  );
  const [layoutByProduct, setLayoutByProduct] = useState<
    Record<string, ProductLayout>
  >(
    initialCatalog
      ? getCatalogLayoutMap(initialCatalog)
      : createDefaultLayoutMap(initialSelectedIds),
  );
  const [query, setQuery] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const productById = useMemo(
    () => new Map(data?.products.map((product) => [product.id, product]) ?? []),
    [data?.products],
  );

  const selectedProducts = useMemo(
    () =>
      selectedIds
        .map((id) => productById.get(id))
        .filter((product): product is ProductWithImages => Boolean(product)),
    [productById, selectedIds],
  );

  const availableProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.products ?? []).filter((product) =>
      [product.sku, product.name, product.category?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [data?.products, query]);

  const sessionsForCatalog = useMemo(
    () =>
      data?.sessions.filter(
        (session) => session.catalog_id === activeCatalog?.id,
      ) ?? [],
    [activeCatalog?.id, data?.sessions],
  );

  function toggleProduct(productId: string) {
    setSelectedIds((current) => {
      const selected = current.includes(productId);
      if (selected) {
        setLayoutByProduct((layouts) => {
          const next = { ...layouts };
          delete next[productId];
          return next;
        });
        return current.filter((id) => id !== productId);
      }

      setLayoutByProduct((layouts) => ({
        ...layouts,
        [productId]: current.length === 0 ? "hero" : "image",
      }));
      return [...current, productId];
    });
  }

  function setProductLayout(productId: string, layout: ProductLayout) {
    setLayoutByProduct((current) => ({
      ...current,
      [productId]: layout,
    }));
  }

  function moveSelected(productId: string, direction: -1 | 1) {
    setSelectedIds((current) => {
      const next = [...current];
      const index = next.indexOf(productId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= next.length) return current;
      const [id] = next.splice(index, 1);
      next.splice(target, 0, id);
      return next;
    });
  }

  async function saveCurrentCatalog() {
    setBusy(true);
    try {
      setActionError(null);
      const catalog = await apiFetch<Catalog>("/api/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeCatalog?.id,
          title,
          coverTitle,
          description,
          productIds: selectedIds,
          layoutByProduct: selectedIds.reduce<Record<string, ProductLayout>>(
            (layouts, productId, index) => ({
              ...layouts,
              [productId]: layoutByProduct[productId] ?? (index === 0 ? "hero" : "image"),
            }),
            {},
          ),
        }),
      });
      setActiveCatalog(catalog);
      if (!activeCatalog?.id) {
        router.replace(`/catalog/create-catalog?id=${catalog.id}`);
      }
      await invalidateWorkspaceQueries();
      return catalog;
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : "Save failed");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function createShareLink() {
    const catalog = await saveCurrentCatalog();
    if (!catalog) return;

    setBusy(true);
    try {
      setActionError(null);
      const result = await apiFetch<{ session: CatalogSession; url: string }>(
        "/api/catalog-sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ catalogId: catalog.id }),
        },
      );
      setShareUrl(result.url);
      setLinkCopied(false);
      setShareDialogOpen(true);
      await invalidateWorkspaceQueries();
    } catch (shareError) {
      setActionError(
        shareError instanceof Error ? shareError.message : "Share failed",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
  }

  const currentStep = BUILDER_STEPS[activeStep];
  const nextStepDisabled =
    (activeStep === 0 && (!title.trim() || !coverTitle.trim())) ||
    (activeStep === 1 && !selectedIds.length);
  const error = actionError;

  return (
    <div className="grid gap-6">
      {error ? (
        <div className="rounded-[8px] border border-m-red bg-surface-soft p-4 text-sm text-body">
          {error}
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <div className="grid gap-7 border-b border-hairline p-5 sm:p-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(500px,1fr)] lg:items-end">
          {header ? (
            <div>
              <p className="uppercase-label mb-3 text-muted">{header.eyebrow}</p>
              <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                {header.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-body">
                {header.description}
              </p>
            </div>
          ) : null}

          <div className="grid gap-4">
            <ol className="grid grid-cols-4 gap-2 sm:gap-3">
              {BUILDER_STEPS.map((step, index) => {
                const isActive = index === activeStep;
                const isComplete = index < activeStep;

                return (
                  <li key={step.label} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveStep(index)}
                      aria-current={isActive ? "step" : undefined}
                      className={`group grid w-full min-w-0 gap-2 rounded-[6px] px-1 py-2 text-left transition-colors sm:px-2 ${
                        isActive
                          ? "text-ink"
                          : "text-muted hover:bg-surface-card hover:text-body-strong"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                          isActive || isComplete
                            ? "bg-m-blue-dark text-on-primary"
                            : "bg-surface-card text-muted"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="uppercase-label truncate text-current">
                        {step.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="h-1 overflow-hidden rounded-full bg-surface-card">
              <div
                className="h-full bg-m-blue-dark transition-all"
                style={{
                  width: `${((activeStep + 1) / BUILDER_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        <BuilderStep
          eyebrow={currentStep.eyebrow}
          title={currentStep.title}
          description={currentStep.description}
        >
          {activeStep === 0 ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="uppercase-label text-body-strong">
                    Catalog title
                  </span>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="uppercase-label text-body-strong">
                    Client-facing title
                  </span>
                  <Input
                    value={coverTitle}
                    onChange={(event) => setCoverTitle(event.target.value)}
                  />
                </label>
                <label className="grid gap-2 sm:col-span-2">
                  <span className="uppercase-label text-body-strong">
                    Short note
                  </span>
                  <Textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="min-h-24"
                  />
                </label>
              </div>
              <div className="rounded-[8px] border border-hairline bg-canvas p-5">
                <span className="text-4xl font-semibold leading-none tabular-nums">
                  {selectedProducts.length}
                </span>
                <p className="uppercase-label mt-2 text-muted">Items selected</p>
                <p className="mt-4 text-sm leading-6 text-body">
                  A focused edit is easier to scan, faster to forward, and more
                  useful in a WhatsApp conversation.
                </p>
              </div>
            </div>
          ) : null}

          {activeStep === 1 ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by SKU, product name, or category"
                    className="pl-11"
                  />
                </label>
                <span className="text-sm text-body">
                  {availableProducts.length} in view
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {availableProducts.map((product) => {
                  const selected = selectedIds.includes(product.id);
                  return (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => toggleProduct(product.id)}
                      className="grid grid-cols-[104px_1fr_auto] gap-4 rounded-[6px] border border-hairline bg-canvas p-2 text-left transition-all duration-200 hover:border-hairline-strong hover:bg-surface-card"
                    >
                      {product.images[0] ? (
                        <img
                          src={product.images[0].public_url}
                          alt={product.images[0].alt_text ?? product.name}
                          className="aspect-[4/3] w-[104px] rounded-[4px] object-cover"
                        />
                      ) : (
                        <div className="aspect-[4/3] w-[104px] rounded-[4px] bg-surface-card" />
                      )}
                      <span className="min-w-0 self-center">
                        <span className="uppercase-label block text-muted">
                          {product.sku}
                        </span>
                        <span className="editorial-title mt-1 block truncate text-2xl leading-none">
                          {product.name}
                        </span>
                        <span className="mt-1 block text-sm text-body">
                          {product.category?.name ?? "Uncategorized"}
                        </span>
                      </span>
                      <span className="self-center">
                        {selected ? (
                          <span className="grid h-9 w-9 place-items-center rounded-full border border-m-blue-dark bg-m-blue-dark text-on-primary">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-muted">
                            +
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
                {!availableProducts.length ? (
                  <div className="rounded-[6px] border border-hairline bg-canvas p-8 text-center text-body sm:col-span-2">
                    No products match this search.
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          {activeStep === 2 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="text-sm text-body">
                    Set the order customers will see.
                  </p>
                  <span className="text-sm font-semibold tabular-nums text-body-strong">
                    {selectedProducts.length} selected
                  </span>
                </div>
                <div className="grid gap-3">
                  {selectedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="grid gap-4 rounded-[8px] border border-hairline bg-canvas p-3"
                    >
                      <div className="grid grid-cols-[64px_1fr_auto_auto] items-center gap-3">
                        {product.images[0] ? (
                          <img
                            src={product.images[0].public_url}
                            alt={product.images[0].alt_text ?? product.name}
                            className="h-16 w-16 rounded-[4px] object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-[4px] bg-surface-card" />
                        )}
                        <div className="min-w-0">
                          <p className="uppercase-label text-muted">{product.sku}</p>
                          <p className="truncate text-sm font-semibold">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-body">
                            {product.category?.name ?? "Uncategorized"}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={index === 0}
                          aria-label="Move up"
                          onClick={() => moveSelected(product.id, -1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={index === selectedProducts.length - 1}
                          aria-label="Move down"
                          onClick={() => moveSelected(product.id, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-4">
                        {PRODUCT_LAYOUT_OPTIONS.map((layout) => {
                          const activeLayout =
                            layoutByProduct[product.id] ??
                            (index === 0 ? "hero" : "image");
                          return (
                            <button
                              key={layout.id}
                              type="button"
                              onClick={() => setProductLayout(product.id, layout.id)}
                              className={`grid gap-3 rounded-[8px] border p-3 text-left transition-colors ${
                                activeLayout === layout.id
                                  ? "border-m-blue-dark bg-surface-soft text-ink"
                                  : "border-hairline bg-surface-card text-body hover:border-hairline-strong hover:text-ink"
                              }`}
                            >
                              <LayoutWireframe layout={layout.id} />
                              <span className="block text-xs font-semibold">
                                {layout.label}
                              </span>
                              <span className="block text-[11px] leading-4 text-muted">
                                {layout.description}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {!selectedProducts.length ? (
                    <div className="rounded-[6px] border border-dashed border-hairline bg-canvas p-6 text-center text-sm text-body">
                      Choose products above to build the preview.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[8px] border border-hairline bg-canvas p-5">
                <p className="uppercase-label text-muted">Customer view</p>
                <h2 className="editorial-title mt-2 text-4xl leading-none">
                  {coverTitle || title}
                </h2>
                <p className="mt-4 text-sm leading-6 text-body">{description}</p>
                <div className="vizora-stripe mt-5 h-1 w-36" />
                <div className="mt-5 grid gap-4">
                  {selectedProducts.slice(0, 3).map((product, index) => (
                    <PreviewProduct
                      key={product.id}
                      product={product}
                      layout={layoutByProduct[product.id] ?? (index === 0 ? "hero" : "image")}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeStep === 3 ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <div>
                <p className="max-w-2xl text-sm leading-6 text-body">
                  Create a share link when the edit is ready. The link opens as a
                  clean, mobile-first catalog and starts tracking basic pull signal.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Button
                    className="h-12 justify-center"
                    onClick={createShareLink}
                    disabled={busy || !selectedIds.length}
                  >
                    <Link2 className="h-4 w-4" />
                    Create link
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 justify-center bg-surface-soft"
                    onClick={saveCurrentCatalog}
                    disabled={busy || !selectedIds.length}
                  >
                    <Save className="h-4 w-4" />
                    Save edit
                  </Button>
                  {data?.vendor ? (
                    <PdfDownloadButton
                      vendor={data.vendor}
                      categories={data.categories}
                      products={selectedProducts}
                      title={title}
                      coverTitle={coverTitle}
                      description={description}
                      layoutByProduct={layoutByProduct}
                      variant="outline"
                      className="h-12 justify-center bg-surface-soft"
                    />
                  ) : null}
                </div>
              </div>

              <div className="rounded-[8px] border border-hairline bg-canvas p-4">
                <p className="uppercase-label text-muted">Behavior signal</p>
                {sessionsForCatalog.length ? (
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Metric
                      label="Opens"
                      value={String(sessionsForCatalog[0].open_count)}
                    />
                    <Metric
                      label="Revisits"
                      value={String(sessionsForCatalog[0].revisit_count)}
                    />
                    <Metric
                      label="Time"
                      value={formatSeconds(
                        sessionsForCatalog[0].total_time_seconds,
                      )}
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-body">
                    After sharing, opens, revisits, and time spent will appear here.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </BuilderStep>

        <div className="flex flex-col gap-3 border-t border-hairline p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-body">
            Step {activeStep + 1} of {BUILDER_STEPS.length}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="bg-surface-soft"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
            >
              Back
            </Button>
            {activeStep < BUILDER_STEPS.length - 1 ? (
              <Button
                disabled={nextStepDisabled}
                onClick={() =>
                  setActiveStep((step) =>
                    Math.min(BUILDER_STEPS.length - 1, step + 1),
                  )
                }
              >
                Continue to {BUILDER_STEPS[activeStep + 1].label}
              </Button>
            ) : (
              <Button variant="outline" className="bg-surface-soft" asChild>
                <a href="/catalog">Back to library</a>
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <p className="uppercase-label mb-2 text-muted">Share link ready</p>
            <DialogTitle>Send this catalog</DialogTitle>
            <DialogDescription>
              This mobile link is ready for WhatsApp. Opens, revisits, and time
              spent will update in the behavior signal panel after customers view it.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 p-6 sm:p-8">
            <div className="rounded-[8px] border border-hairline bg-surface-card p-4">
              <p className="uppercase-label text-muted">Catalog URL</p>
              <a
                href={shareUrl}
                className="mt-3 block break-all text-sm leading-6 text-ink underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {shareUrl}
              </a>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 flex-1" onClick={copyShareUrl}>
                {linkCopied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {linkCopied ? "Copied" : "Copy link"}
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-1 bg-surface-soft"
                asChild
              >
                <a href={shareUrl} target="_blank" rel="noreferrer">
                  Open catalog
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-bold uppercase">{value}</p>
      <p className="uppercase-label mt-1 text-muted">{label}</p>
    </div>
  );
}

function PreviewProduct({
  product,
  layout,
}: {
  product: ProductWithImages;
  layout: ProductLayout;
}) {
  const image = product.images.find((item) => item.is_primary) ?? product.images[0];

  if (layout === "hero") {
    return (
      <div className="overflow-hidden rounded-[6px] border border-hairline bg-surface-soft">
        {image ? (
          <img
            src={image.public_url}
            alt={image.alt_text ?? product.name}
            className="aspect-[16/10] w-full object-cover"
          />
        ) : null}
        <div className="p-4">
          <p className="uppercase-label text-muted">{product.sku}</p>
          <p className="mt-1 text-lg font-semibold">{product.name}</p>
          <p className="mt-2 text-xs text-body">Hero product</p>
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className="grid grid-cols-[56px_1fr] gap-3 border-t border-hairline pt-4">
        {image ? (
          <img
            src={image.public_url}
            alt={image.alt_text ?? product.name}
            className="h-14 w-14 rounded-[4px] object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-[4px] bg-surface-card" />
        )}
        <div>
          <p className="uppercase-label text-muted">{product.sku}</p>
          <p className="mt-1 text-sm font-semibold">{product.name}</p>
          <p className="mt-1 text-xs text-body">Compact SKU</p>
        </div>
      </div>
    );
  }

  if (layout === "detail") {
    return (
      <div className="border-t border-hairline pt-4">
        <p className="uppercase-label text-muted">{product.sku}</p>
        <p className="mt-1 font-semibold">{product.name}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-[4px] border border-hairline bg-surface-soft p-2">
            <p className="uppercase-label text-muted">Material</p>
            <p className="mt-1 text-body-strong">
              {product.material_type || "On request"}
            </p>
          </div>
          <div className="rounded-[4px] border border-hairline bg-surface-soft p-2">
            <p className="uppercase-label text-muted">Finish</p>
            <p className="mt-1 text-body-strong">
              {product.finish_color || "On request"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-hairline pt-4">
      {image ? (
        <img
          src={image.public_url}
          alt={image.alt_text ?? product.name}
          className="aspect-[4/3] w-full rounded-[4px] object-cover"
        />
      ) : null}
      <p className="uppercase-label mt-3 text-muted">{product.sku}</p>
      <p className="mt-1 font-semibold">{product.name}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {product.tags.slice(0, 2).map((productTag) => (
          <Badge key={productTag} variant="outline">
            {productTag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function LayoutWireframe({ layout }: { layout: ProductLayout }) {
  if (layout === "hero") {
    return (
      <span className="grid h-24 gap-2 rounded-[6px] border border-hairline bg-surface-soft p-2">
        <span className="placeholder-fill block h-12 rounded-[4px]" />
        <span className="grid gap-1">
          <span className="placeholder-fill block h-2 w-1/2 rounded-full" />
          <span className="placeholder-fill block h-2 w-3/4 rounded-full" />
        </span>
      </span>
    );
  }

  if (layout === "compact") {
    return (
      <span className="grid h-24 gap-2 rounded-[6px] border border-hairline bg-surface-soft p-2">
        {[0, 1, 2].map((row) => (
          <span key={row} className="grid grid-cols-[24px_1fr] gap-2">
            <span className="placeholder-fill block h-6 rounded-[4px]" />
            <span className="grid content-center gap-1">
              <span className="placeholder-fill block h-2 w-5/6 rounded-full" />
              <span className="placeholder-fill block h-2 w-1/2 rounded-full" />
            </span>
          </span>
        ))}
      </span>
    );
  }

  if (layout === "detail") {
    return (
      <span className="grid h-24 gap-2 rounded-[6px] border border-hairline bg-surface-soft p-2">
        <span className="grid gap-1">
          <span className="placeholder-fill block h-2 w-1/2 rounded-full" />
          <span className="placeholder-fill block h-3 w-3/4 rounded-full" />
        </span>
        <span className="grid grid-cols-2 gap-2">
          <span className="placeholder-fill block h-8 rounded-[4px]" />
          <span className="placeholder-fill block h-8 rounded-[4px]" />
        </span>
        <span className="placeholder-fill block h-5 rounded-[4px]" />
      </span>
    );
  }

  return (
    <span className="grid h-24 grid-rows-[1fr_auto] gap-2 rounded-[6px] border border-hairline bg-surface-soft p-2">
      <span className="placeholder-fill block h-14 rounded-[4px]" />
      <span className="grid gap-1">
        <span className="placeholder-fill block h-2 w-2/3 rounded-full" />
        <span className="placeholder-fill block h-2 w-1/2 rounded-full" />
      </span>
    </span>
  );
}

function BuilderStep({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5 border-b border-hairline p-5 last:border-b-0 sm:p-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <div>
        <p className="uppercase-label text-muted">{eyebrow}</p>
        <h2 className="editorial-title mt-2 text-[30px] leading-[1.12] sm:text-[34px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-xl text-sm leading-6 text-body lg:max-w-[210px]">
            {description}
          </p>
        ) : null}
      </div>
      <div>{children}</div>
    </section>
  );
}

function getCatalogDescription(catalog: Catalog) {
  const options = catalog.options;
  if (options && typeof options === "object" && !Array.isArray(options)) {
    const descriptionValue = (options as Record<string, unknown>).description;
    if (typeof descriptionValue === "string" && descriptionValue.trim()) {
      return descriptionValue;
    }
  }

  return DEFAULT_CATALOG_DESCRIPTION;
}

function getCatalogProductIds(catalog: Catalog) {
  return Array.isArray(catalog.product_order)
    ? catalog.product_order.filter((value): value is string => typeof value === "string")
    : [];
}

function getCatalogLayoutMap(catalog: Catalog): Record<string, ProductLayout> {
  const options = catalog.options;
  if (options && typeof options === "object" && !Array.isArray(options)) {
    const value = (options as Record<string, unknown>).layoutByProduct;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, ProductLayout] =>
            typeof entry[1] === "string" &&
            PRODUCT_LAYOUT_OPTIONS.some((layout) => layout.id === entry[1]),
        ),
      );
    }
  }

  return {};
}

function createDefaultLayoutMap(productIds: string[]) {
  return productIds.reduce<Record<string, ProductLayout>>(
    (layouts, productId, index) => ({
      ...layouts,
      [productId]: index === 0 ? "hero" : "image",
    }),
    {},
  );
}

function normalizeLegacyTitle(value: string | null | undefined, fallback: string) {
  if (!value?.trim() || value.trim() === "Showroom Selection") {
    return fallback;
  }

  return value;
}
