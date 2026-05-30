"use client";

/* eslint-disable @next/next/no-img-element */

import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Plus,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SetupPanel } from "@/components/app/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Picker, type PickerOption } from "@/components/ui/picker";
import { apiFetch } from "@/lib/client-api";
import { compressImage } from "@/lib/image-compression";
import {
  queryKeys,
  useBootstrapQuery,
  useInvalidateWorkspaceQueries,
} from "@/lib/queries";
import type { BootstrapData, ProductWithImages } from "@/lib/types";
import {
  ProductFormDialog,
  type ProductFormPayload,
} from "./product-form-dialog";

export function ProductDashboard() {
  const queryClient = useQueryClient();
  const {
    data = null,
    error: loadError,
    isLoading,
  } = useBootstrapQuery();
  const invalidateWorkspaceQueries = useInvalidateWorkspaceQueries();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiBusyProductId, setAiBusyProductId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithImages | null>(
    null,
  );
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [tag, setTag] = useState("all");

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    data?.products.forEach((product) =>
      product.tags.forEach((productTag) => allTags.add(productTag)),
    );
    return Array.from(allTags).sort();
  }, [data?.products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (data?.products ?? []).filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        [product.sku, product.name, product.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        categoryId === "all" || product.category_id === categoryId;
      const matchesTag = tag === "all" || product.tags.includes(tag);
      return matchesQuery && matchesCategory && matchesTag;
    });
  }, [categoryId, data?.products, query, tag]);

  const categoryOptions = useMemo<PickerOption[]>(
    () => [
      { value: "all", label: "All categories" },
      ...((data?.categories ?? []).map((category) => {
        return {
          value: category.id,
          label: category.name,
        };
      }) ?? []),
    ],
    [data?.categories],
  );

  const tagOptions = useMemo<PickerOption[]>(
    () => [
      { value: "all", label: "All tags" },
      ...tags.map((item) => ({
        value: item,
        label: item,
      })),
    ],
    [tags],
  );

  const hasActiveFilters =
    Boolean(query.trim()) || categoryId !== "all" || tag !== "all";

  async function saveProduct(payload: ProductFormPayload, files: File[]) {
    setBusy(true);
    try {
      setActionError(null);
      const product = await apiFetch<ProductWithImages>(
        editingProduct ? `/api/products/${editingProduct.id}` : "/api/products",
        {
          method: editingProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (files.length) {
        const formData = new FormData();
        formData.append("productId", product.id);
        const compressedFiles = await Promise.all(
          files.map((file) => compressImage(file)),
        );
        compressedFiles.forEach((file) => formData.append("files", file));
        await apiFetch("/api/uploads/product-image", {
          method: "POST",
          body: formData,
        });
      }

      setDialogOpen(false);
      setEditingProduct(null);
      await invalidateWorkspaceQueries();
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function moveProduct(productId: string, direction: -1 | 1) {
    if (!data) return;
    const products = [...data.products];
    const index = products.findIndex((product) => product.id === productId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= products.length) return;
    const [product] = products.splice(index, 1);
    products.splice(targetIndex, 0, product);
    queryClient.setQueryData<BootstrapData>(queryKeys.bootstrap, {
      ...data,
      products,
    });

    try {
      const updated = await apiFetch<BootstrapData>("/api/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: products.map((item) => item.id) }),
      });
      queryClient.setQueryData<BootstrapData>(queryKeys.bootstrap, updated);
    } catch (reorderError) {
      setActionError(
        reorderError instanceof Error ? reorderError.message : "Reorder failed",
      );
      await invalidateWorkspaceQueries();
    }
  }

  async function enrichProduct(product: ProductWithImages) {
    if (!product.images.length) {
      setActionError("Upload at least one product image before AI polish.");
      return;
    }

    setAiBusyProductId(product.id);
    try {
      setActionError(null);
      await apiFetch(`/api/products/${product.id}/ai-enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generateMetadata: true,
          removeBackground: true,
          writeMode: "update",
        }),
      });
      await invalidateWorkspaceQueries();
    } catch (aiError) {
      setActionError(
        aiError instanceof Error ? aiError.message : "AI polish failed",
      );
    } finally {
      setAiBusyProductId(null);
    }
  }

  const error =
    actionError ??
    (loadError instanceof Error ? loadError.message : loadError ? "Load failed" : null);

  if (isLoading) {
    return (
      <div className="rounded-[6px] border border-hairline bg-surface-soft p-8 text-body shadow-[0_18px_45px_rgba(40,44,63,0.05)]">
        Loading catalog workspace...
      </div>
    );
  }

  if (error && !data) {
    return <SetupPanel message={error} />;
  }

  return (
    <div className="grid gap-7">
      {error ? (
        <div className="rounded-[6px] border border-m-red bg-surface-soft p-4 text-sm text-body">
          {error}
        </div>
      ) : null}

      <section className="sticky top-[74px] z-30 -mx-4 grid gap-6 border-b border-hairline bg-canvas/95 px-4 pb-5 pt-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="max-w-3xl">
          <p className="uppercase-label text-muted">Studio / Products</p>
          <h1 className="mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.01em] text-ink sm:text-[44px] lg:text-[52px]">
            Product library
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-body">
            Manage showroom SKUs, enrich images, and keep every material option
            ready for catalogs and customer sessions.
          </p>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_240px_220px_auto]">
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Search
            </span>
            <Search className="pointer-events-none absolute left-4 top-[31px] h-4 w-4 -translate-y-1/2 text-body" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="SKU, product, description"
              className="h-14 rounded-[12px] bg-surface-soft pl-11 pt-6 shadow-[0_1px_2px_rgba(40,44,63,0.05)]"
            />
          </label>
          <Picker
            label="Category"
            value={categoryId}
            options={categoryOptions}
            onChange={setCategoryId}
          />
          <Picker
            label="Tag"
            value={tag}
            options={tagOptions}
            onChange={setTag}
          />
          <Button
            className="h-14 rounded-[12px] border-0 bg-gradient-to-r from-m-blue-light via-m-blue-dark to-m-red px-6 text-sm shadow-[0_16px_34px_rgba(255,63,108,0.24)] hover:opacity-95 xl:min-w-[160px]"
            onClick={() => {
              setEditingProduct(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add SKU
          </Button>
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            className="w-fit text-sm font-semibold text-ink underline-offset-4 hover:underline"
            onClick={() => {
              setQuery("");
              setCategoryId("all");
              setTag("all");
            }}
          >
            Clear filters
          </button>
        ) : null}
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product, index) => (
          <article
            key={product.id}
            className="group overflow-hidden rounded-[6px] border border-hairline bg-surface-soft shadow-[0_20px_50px_rgba(40,44,63,0.06)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div className="relative aspect-[5/4] overflow-hidden bg-surface-card">
              {product.images[0] ? (
                <img
                  src={product.images[0].public_url}
                  alt={product.images[0].alt_text ?? product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="grid h-full place-items-center text-muted">
                  No image
                </div>
              )}
              {product.featured ? (
                <Badge variant="accent" className="absolute left-4 top-4">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Featured
                </Badge>
              ) : null}
            </div>
            <div className="grid gap-5 p-5">
              <div className="min-h-28">
                <div className="flex items-center justify-between gap-3">
                  <p className="uppercase-label text-muted">{product.sku}</p>
                  <p className="text-sm text-body">
                    {product.category?.name ?? "Uncategorized"}
                  </p>
                </div>
                <h2 className="editorial-title mt-3 text-3xl leading-[1.02]">
                  {product.name}
                </h2>
                {product.material_type || product.finish_color ? (
                  <p className="mt-3 text-sm leading-6 text-body">
                    {[product.material_type, product.finish_color]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.tags.slice(0, 3).map((productTag) => (
                  <Badge key={productTag} variant="outline">
                    {productTag}
                  </Badge>
                ))}
                {product.options.length ? (
                  <Badge variant="outline">
                    {product.options.length} finish options
                  </Badge>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full px-4"
                    onClick={() => {
                      setEditingProduct(product);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-surface-soft px-4"
                    disabled={!product.images.length || aiBusyProductId === product.id}
                    onClick={() => void enrichProduct(product)}
                  >
                    <Sparkles className="h-4 w-4" />
                    {aiBusyProductId === product.id ? "Polishing" : "Polish"}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 bg-surface-soft"
                    title="Move up"
                    aria-label="Move product up"
                    disabled={index === 0}
                    onClick={() => moveProduct(product.id, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 bg-surface-soft"
                    title="Move down"
                    aria-label="Move product down"
                    disabled={index === (data?.products.length ?? 0) - 1}
                    onClick={() => moveProduct(product.id, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!filteredProducts.length ? (
        <div className="border border-hairline bg-surface-soft p-8 text-center text-body">
          No products match this view.
        </div>
      ) : null}

      {dialogOpen ? (
        <ProductFormDialog
          open={dialogOpen}
          product={editingProduct}
          categories={data?.categories ?? []}
          busy={busy}
          onOpenChange={setDialogOpen}
          onSubmit={saveProduct}
        />
      ) : null}
    </div>
  );
}
