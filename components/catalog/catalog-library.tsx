"use client";

/* eslint-disable @next/next/no-img-element */

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  LayoutGrid,
  Link2,
  Pencil,
  Plus,
  Search,
  Table2,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { SetupPanel } from "@/components/app/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Picker, type PickerOption } from "@/components/ui/picker";
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

type CatalogLibraryItem = {
  catalog: Catalog;
  products: ProductWithImages[];
  stats: ReturnType<typeof getSessionTotals>;
  coverTitle: string;
  description: string;
  layoutByProduct: Record<string, "hero" | "image" | "compact" | "detail">;
  thumbnails: ProductWithImages["images"];
};

export function CatalogLibrary({
  header,
}: {
  header?: {
    eyebrow: string;
    title: string;
    description: string;
  };
}) {
  const {
    data = null,
    error: loadError,
    isLoading,
  } = useBootstrapQuery();
  const invalidateWorkspaceQueries = useInvalidateWorkspaceQueries();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyCatalogId, setBusyCatalogId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const statusOptions: PickerOption[] = [
    { value: "all", label: "All catalogs" },
    { value: "with-links", label: "With links" },
    { value: "no-links", label: "No links" },
    { value: "opened", label: "Opened" },
    { value: "not-opened", label: "Not opened" },
  ];
  const sortOptions: PickerOption[] = [
    { value: "updated", label: "Recently updated" },
    { value: "title", label: "Title A-Z" },
    { value: "opens", label: "Most opens" },
    { value: "links", label: "Most links" },
    { value: "items", label: "Most items" },
  ];

  const productById = useMemo(
    () => new Map(data?.products.map((product) => [product.id, product]) ?? []),
    [data?.products],
  );

  const catalogItems = useMemo<CatalogLibraryItem[]>(() => {
    const sessions = data?.sessions ?? [];

    return (data?.catalogs ?? []).map((catalog) => {
      const products = getCatalogProducts(catalog, productById);
      const stats = getSessionTotals(catalog.id, sessions);
      const coverTitle = getCatalogDisplayTitle(catalog);
      const description = getCatalogDescription(catalog);
      const layoutByProduct = getCatalogLayoutMap(catalog);
      const thumbnails = products.flatMap((product) => product.images).slice(0, 3);

      return {
        catalog,
        products,
        stats,
        coverTitle,
        description,
        layoutByProduct,
        thumbnails,
      };
    });
  }, [data?.catalogs, data?.sessions, productById]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return catalogItems
      .filter((item) => {
        const queryText = [
          item.coverTitle,
          item.catalog.title,
          item.description,
          item.products.map((product) => product.sku).join(" "),
        ]
          .join(" ")
          .toLowerCase();

        const matchesQuery = normalizedQuery
          ? queryText.includes(normalizedQuery)
          : true;
        const matchesFilter =
          statusFilter === "all" ||
          (statusFilter === "with-links" && item.stats.links > 0) ||
          (statusFilter === "no-links" && item.stats.links === 0) ||
          (statusFilter === "opened" && item.stats.opens > 0) ||
          (statusFilter === "not-opened" && item.stats.opens === 0);

        return matchesQuery && matchesFilter;
      })
      .sort((first, second) => {
        if (sortBy === "title") {
          return first.coverTitle.localeCompare(second.coverTitle);
        }

        if (sortBy === "opens") {
          return second.stats.opens - first.stats.opens;
        }

        if (sortBy === "links") {
          return second.stats.links - first.stats.links;
        }

        if (sortBy === "items") {
          return second.products.length - first.products.length;
        }

        return (
          new Date(second.catalog.updated_at).getTime() -
          new Date(first.catalog.updated_at).getTime()
        );
      });
  }, [catalogItems, query, sortBy, statusFilter]);

  async function createShareLink(catalog: Catalog) {
    setBusyCatalogId(catalog.id);
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
      setShareTitle(getCatalogDisplayTitle(catalog));
      setShareUrl(result.url);
      setLinkCopied(false);
      setShareDialogOpen(true);
      await invalidateWorkspaceQueries();
    } catch (shareError) {
      setActionError(
        shareError instanceof Error ? shareError.message : "Share failed",
      );
    } finally {
      setBusyCatalogId(null);
    }
  }

  async function copyShareUrl() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
  }

  const error =
    actionError ??
    (loadError instanceof Error ? loadError.message : loadError ? "Load failed" : null);

  if (isLoading) {
    return (
      <Card className="p-8 text-body">
        Loading catalog library...
      </Card>
    );
  }

  if (error && !data) {
    return <SetupPanel message={error} />;
  }

  return (
    <div className="grid gap-6">
      {error ? (
        <div className="rounded-[8px] border border-m-red bg-surface-soft p-4 text-sm text-body">
          {error}
        </div>
      ) : null}

      <header className="sticky top-[74px] z-30 -mx-4 grid gap-6 border-b border-hairline bg-canvas/95 px-4 pb-5 pt-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
        <div>
          <nav className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            <Link href="/products" className="transition-colors hover:text-ink">
              Studio
            </Link>
            <span>/</span>
            <span>{header?.eyebrow ?? "Catalog library"}</span>
          </nav>
          <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.01em] text-ink sm:text-[44px] lg:text-[52px]">
            {header?.title ?? "Saved catalogs"}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-body">
            {header?.description ??
              "Review every catalog you have created, reopen edits, export PDFs, and create share links for WhatsApp."}
          </p>
        </div>

        <Button
          asChild
          className="h-14 justify-center rounded-[12px] border-0 bg-[linear-gradient(135deg,#ff905a_0%,#ff3f6c_55%,#f16565_100%)] px-6 text-white shadow-[0_18px_36px_rgba(255,63,108,0.24)] hover:opacity-95"
        >
          <Link href="/catalog/create-catalog">
            <Plus className="h-4 w-4" />
            Create catalog
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_220px_220px_auto] xl:items-center">
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Search
            </span>
            <Search className="pointer-events-none absolute left-4 top-[31px] h-4 w-4 -translate-y-1/2 text-body" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search catalogs, SKUs, or notes"
              className="h-14 rounded-[12px] bg-surface-soft pl-11 pt-6 shadow-[0_1px_2px_rgba(40,44,63,0.05)]"
            />
          </label>

          <Picker
            label="Filter"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />
          <Picker
            label="Sort"
            value={sortBy}
            options={sortOptions}
            onChange={setSortBy}
          />

          <div className="inline-grid h-14 grid-cols-2 justify-self-start overflow-hidden rounded-[12px] border border-hairline bg-surface-card p-1 xl:justify-self-end">
            <Button
              type="button"
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              aria-label="Show card view"
              title="Card view"
              className="group relative h-10 w-10 border-0 px-0"
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-[4px] bg-ink px-2 py-1 text-xs font-medium text-on-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                Cards
              </span>
            </Button>
            <Button
              type="button"
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              aria-label="Show table view"
              title="Table view"
              className="group relative h-10 w-10 border-0 px-0"
              onClick={() => setViewMode("table")}
            >
              <Table2 className="h-4 w-4" />
              <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-[4px] bg-ink px-2 py-1 text-xs font-medium text-on-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                Table
              </span>
            </Button>
          </div>
      </section>

      {catalogItems.length && filteredItems.length ? (
        viewMode === "cards" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredItems.map((item) => (
              <CatalogCard
                key={item.catalog.id}
                item={item}
                data={data}
                busyCatalogId={busyCatalogId}
                createShareLink={createShareLink}
              />
            ))}
          </div>
        ) : (
          <CatalogTable
            items={filteredItems}
            data={data}
            busyCatalogId={busyCatalogId}
            createShareLink={createShareLink}
          />
        )
      ) : catalogItems.length ? (
        <Card className="grid gap-4 p-8 text-center">
          <p className="uppercase-label text-muted">No matches</p>
          <h2 className="editorial-title text-[32px] leading-[1.12]">
            Refine the library filters
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-body">
            Try a different search term, filter, or sort option to find the edit
            you need.
          </p>
        </Card>
      ) : (
        <Card className="grid gap-4 p-8 text-center">
          <p className="uppercase-label text-muted">Start here</p>
          <h2 className="editorial-title text-[32px] leading-[1.12]">
            Build your first client edit
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-body">
            Select the best SKUs, set the sequence, and create a link that opens
            cleanly inside WhatsApp.
          </p>
          <Button asChild className="mx-auto h-12">
            <Link href="/catalog/create-catalog">
              <Plus className="h-4 w-4" />
              Create catalog
            </Link>
          </Button>
        </Card>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <p className="uppercase-label mb-2 text-muted">Share link ready</p>
            <DialogTitle>{shareTitle || "Send this catalog"}</DialogTitle>
            <DialogDescription>
              This mobile link is ready for WhatsApp. Copy it for the client or
              open the readonly session to review the customer view.
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
                  <ExternalLink className="h-4 w-4" />
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
      <p className="text-lg font-bold">{value}</p>
      <p className="uppercase-label mt-1 text-muted">{label}</p>
    </div>
  );
}

function CatalogCard({
  item,
  data,
  busyCatalogId,
  createShareLink,
}: {
  item: CatalogLibraryItem;
  data: BootstrapData | null;
  busyCatalogId: string | null;
  createShareLink: (catalog: Catalog) => Promise<void>;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="grid h-36 grid-cols-3 gap-px bg-hairline">
        {[0, 1, 2].map((index) => {
          const image = item.thumbnails[index];
          return image ? (
            <img
              key={image.id}
              src={image.public_url}
              alt={image.alt_text ?? item.coverTitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <div key={index} className="bg-surface-card" />
          );
        })}
      </div>

      <CardHeader>
        <CatalogChips item={item} />
        <CardTitle>{item.coverTitle}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid grid-cols-3 gap-2 rounded-[8px] border border-hairline bg-surface-card p-3 text-center">
          <Metric label="Opens" value={String(item.stats.opens)} />
          <Metric label="Revisits" value={String(item.stats.revisits)} />
          <Metric label="Time" value={formatSeconds(item.stats.time)} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-body">
          <span>Updated {formatDate(item.catalog.updated_at)}</span>
          {item.stats.lastOpened ? (
            <span>Last opened {formatDate(item.stats.lastOpened)}</span>
          ) : (
            <span>Not opened yet</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="grid sm:grid-cols-3">
        <CatalogActions
          item={item}
          data={data}
          busyCatalogId={busyCatalogId}
          createShareLink={createShareLink}
        />
      </CardFooter>
    </Card>
  );
}

function CatalogTable({
  items,
  data,
  busyCatalogId,
  createShareLink,
}: {
  items: CatalogLibraryItem[];
  data: BootstrapData | null;
  busyCatalogId: string | null;
  createShareLink: (catalog: Catalog) => Promise<void>;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="border-b border-hairline bg-surface-card text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-5 py-4 font-semibold">Catalog</th>
              <th className="px-5 py-4 font-semibold">Signal</th>
              <th className="px-5 py-4 font-semibold">Updated</th>
              <th className="px-5 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const image = item.thumbnails[0];

              return (
                <tr
                  key={item.catalog.id}
                  className="border-b border-hairline last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <div className="grid grid-cols-[72px_1fr] items-center gap-4">
                      {image ? (
                        <img
                          src={image.public_url}
                          alt={image.alt_text ?? item.coverTitle}
                          className="h-16 w-[72px] rounded-[4px] object-cover"
                        />
                      ) : (
                        <div className="h-16 w-[72px] rounded-[4px] bg-surface-card" />
                      )}
                      <div className="min-w-0">
                        <CatalogChips item={item} />
                        <h3 className="mt-2 truncate text-base font-semibold text-ink">
                          {item.coverTitle}
                        </h3>
                        <p className="mt-1 truncate text-body">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <Metric label="Opens" value={String(item.stats.opens)} />
                      <Metric
                        label="Revisits"
                        value={String(item.stats.revisits)}
                      />
                      <Metric label="Time" value={formatSeconds(item.stats.time)} />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-body">
                    <p>Updated {formatDate(item.catalog.updated_at)}</p>
                    <p className="mt-1 text-xs">
                      {item.stats.lastOpened
                        ? `Last opened ${formatDate(item.stats.lastOpened)}`
                        : "Not opened yet"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <CatalogActions
                        item={item}
                        data={data}
                        busyCatalogId={busyCatalogId}
                        createShareLink={createShareLink}
                        compact
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CatalogChips({ item }: { item: CatalogLibraryItem }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="default">{item.products.length} items</Badge>
      <Badge variant={item.stats.links ? "accent" : "outline"}>
        {item.stats.links} links
      </Badge>
    </div>
  );
}

function CatalogActions({
  item,
  data,
  busyCatalogId,
  createShareLink,
  compact = false,
}: {
  item: CatalogLibraryItem;
  data: BootstrapData | null;
  busyCatalogId: string | null;
  createShareLink: (catalog: Catalog) => Promise<void>;
  compact?: boolean;
}) {
  const buttonClass = compact ? "h-10 w-10 rounded-[4px] px-0" : "h-12 w-full";

  if (compact) {
    return (
      <>
        <ActionTooltip label="Edit catalog">
          <Button
            variant="outline"
            className={`${buttonClass} bg-surface-soft`}
            asChild
          >
            <Link
              href={`/catalog/create-catalog?id=${item.catalog.id}`}
              aria-label="Edit catalog"
              title="Edit catalog"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit catalog</span>
            </Link>
          </Button>
        </ActionTooltip>
        {data?.vendor ? (
          <PdfDownloadButton
            vendor={data.vendor}
            categories={data.categories}
            products={item.products}
            title={item.catalog.title}
            coverTitle={item.coverTitle}
            description={item.description}
            layoutByProduct={item.layoutByProduct}
            variant="outline"
            className={`${buttonClass} bg-surface-soft`}
            iconOnly
            tooltipLabel="Download PDF"
          />
        ) : null}
        <ActionTooltip
          label={
            busyCatalogId === item.catalog.id ? "Creating link" : "Create link"
          }
        >
          <Button
            className={buttonClass}
            onClick={() => void createShareLink(item.catalog)}
            disabled={busyCatalogId === item.catalog.id || !item.products.length}
            aria-label="Create share link"
            title="Create share link"
          >
            <Link2 className="h-4 w-4" />
            <span className="sr-only">Create share link</span>
          </Button>
        </ActionTooltip>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className={`${buttonClass} bg-surface-soft`}
        asChild
      >
        <Link href={`/catalog/create-catalog?id=${item.catalog.id}`}>
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </Button>
      {data?.vendor ? (
        <PdfDownloadButton
          vendor={data.vendor}
          categories={data.categories}
          products={item.products}
          title={item.catalog.title}
          coverTitle={item.coverTitle}
          description={item.description}
          layoutByProduct={item.layoutByProduct}
          variant="outline"
          className={`${buttonClass} bg-surface-soft`}
        />
      ) : null}
      <Button
        className={buttonClass}
        onClick={() => void createShareLink(item.catalog)}
        disabled={busyCatalogId === item.catalog.id || !item.products.length}
      >
        <Link2 className="h-4 w-4" />
        Create link
      </Button>
    </>
  );
}

function ActionTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-ink px-2 py-1 text-xs font-medium text-on-primary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </span>
  );
}

function getCatalogProducts(
  catalog: Catalog,
  productById: Map<string, ProductWithImages>,
) {
  return getCatalogProductIds(catalog)
    .map((productId) => productById.get(productId))
    .filter((product): product is ProductWithImages => Boolean(product));
}

function getCatalogProductIds(catalog: Catalog) {
  return Array.isArray(catalog.product_order)
    ? catalog.product_order.filter((value): value is string => typeof value === "string")
    : [];
}

function getCatalogDisplayTitle(catalog: Catalog) {
  if (catalog.cover_title?.trim() && catalog.cover_title.trim() !== "Showroom Selection") {
    return catalog.cover_title;
  }

  if (catalog.title?.trim() && catalog.title.trim() !== "Showroom Selection") {
    return catalog.title;
  }

  return "Materials for Review";
}

function getCatalogDescription(catalog: Catalog) {
  const options = catalog.options;
  if (options && typeof options === "object" && !Array.isArray(options)) {
    const descriptionValue = (options as Record<string, unknown>).description;
    if (typeof descriptionValue === "string" && descriptionValue.trim()) {
      return descriptionValue;
    }
  }

  return "Curated finishes, material options, and fabrication details prepared for client review.";
}

function getCatalogLayoutMap(
  catalog: Catalog,
): Record<string, "hero" | "image" | "compact" | "detail"> {
  const options = catalog.options;
  if (options && typeof options === "object" && !Array.isArray(options)) {
    const value = (options as Record<string, unknown>).layoutByProduct;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.fromEntries(
        Object.entries(value).filter(
          (
            entry,
          ): entry is [string, "hero" | "image" | "compact" | "detail"] =>
            typeof entry[1] === "string" &&
            ["hero", "image", "compact", "detail"].includes(entry[1]),
        ),
      );
    }
  }

  return {};
}

function getSessionTotals(catalogId: string, sessions: CatalogSession[]) {
  const matchingSessions = sessions.filter(
    (session) => session.catalog_id === catalogId,
  );

  return {
    links: matchingSessions.length,
    opens: matchingSessions.reduce((sum, session) => sum + session.open_count, 0),
    revisits: matchingSessions.reduce(
      (sum, session) => sum + session.revisit_count,
      0,
    ),
    time: matchingSessions.reduce(
      (sum, session) => sum + session.total_time_seconds,
      0,
    ),
    lastOpened:
      matchingSessions
        .map((session) => session.last_opened_at)
        .filter((value): value is string => Boolean(value))
        .sort()
        .at(-1) ?? null,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
