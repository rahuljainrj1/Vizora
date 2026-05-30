"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Check, Copy, MessageCircle, Plus, QrCode, Search } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useMemo, useState } from "react";
import { SetupPanel } from "@/components/app/admin-shell";
import {
  isSessionSchemaMissing,
  SessionMigrationNotice,
} from "@/components/sessions/session-migration-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/client-api";
import { useBootstrapQuery, useInvalidateWorkspaceQueries } from "@/lib/queries";
import type { BootstrapData, CustomerSession } from "@/lib/types";

type CreatedSession = {
  session: CustomerSession;
  url: string;
};

export function SessionCreateWorkspace() {
  const {
    data = null,
    error: loadError,
    isLoading,
  } = useBootstrapQuery();

  const error =
    loadError instanceof Error ? loadError.message : loadError ? "Load failed" : null;

  if (isLoading) {
    return (
      <Card className="p-8 text-body">
        Loading session workspace...
      </Card>
    );
  }

  if (error && !data) {
    return <SetupPanel message={error} />;
  }

  if (!data) {
    return <SetupPanel message="Session workspace data is unavailable." />;
  }

  return <SessionCreateForm data={data} />;
}

function SessionCreateForm({ data }: { data: BootstrapData }) {
  const invalidateWorkspaceQueries = useInvalidateWorkspaceQueries();
  const [actionError, setActionError] = useState<string | null>(null);
  const [title, setTitle] = useState("Showroom follow-up");
  const [customerName, setCustomerName] = useState("");
  const [catalogId, setCatalogId] = useState("");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    data.products.filter((product) => product.featured).map((product) => product.id),
  );
  const [created, setCreated] = useState<CreatedSession | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.products ?? []).filter((product) =>
      [product.sku, product.name, product.category?.name ?? "", product.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [data.products, query]);

  function applyCatalog(nextCatalogId: string) {
    setCatalogId(nextCatalogId);
    const catalog = data?.catalogs.find((item) => item.id === nextCatalogId);
    if (!catalog) return;
    const productIds = Array.isArray(catalog.product_order)
      ? catalog.product_order.filter((value): value is string => typeof value === "string")
      : [];
    setSelectedIds(productIds);
    setTitle(catalog.cover_title || catalog.title || title);
  }

  function toggleProduct(productId: string) {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  async function createSession() {
    setBusy(true);
    setActionError(null);
    setCreated(null);
    try {
      const result = await apiFetch<CreatedSession>("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          customerName,
          catalogId: catalogId || null,
          productIds: selectedIds,
        }),
      });
      setCreated(result);
      setCopied(false);
      await invalidateWorkspaceQueries();
    } catch (createError) {
      setActionError(
        createError instanceof Error ? createError.message : "Session creation failed",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!created?.url) return;
    await navigator.clipboard.writeText(created.url);
    setCopied(true);
  }

  const error = actionError;

  const whatsAppText = created
    ? encodeURIComponent(`Here is your Vizora showroom session: ${created.url}`)
    : "";

  return (
    <div className="grid gap-6">
      {error ? (
        isSessionSchemaMissing(error) ? (
          <SessionMigrationNotice message={error} />
        ) : (
          <div className="rounded-[8px] border border-m-red bg-surface-soft p-4 text-sm text-body">
            {error}
          </div>
        )
      ) : null}

      <Card className="overflow-hidden">
        <div className="grid gap-6 border-b border-hairline p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="uppercase-label text-muted">Customer session</p>
            <h1 className="editorial-title mt-3 text-4xl leading-[1.04] sm:text-5xl">
              Create digital follow-up
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-body">
              Package the products discussed in-showroom, then hand off a mobile
              session by WhatsApp or QR while the decision is still warm.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="uppercase-label text-body-strong">Project name</span>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label className="grid gap-2">
              <span className="uppercase-label text-body-strong">Customer</span>
              <Input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="e.g. Mehta residence"
              />
            </label>
            <label className="grid gap-2 sm:col-span-2">
              <span className="uppercase-label text-body-strong">Start from catalog</span>
              <Select
                value={catalogId}
                onChange={(event) => applyCatalog(event.target.value)}
              >
                <option value="">No catalog selected</option>
                {data?.catalogs.map((catalog) => (
                  <option key={catalog.id} value={catalog.id}>
                    {catalog.cover_title || catalog.title}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products for this session"
                  className="pl-11"
                />
              </label>
              <Badge variant="default">{selectedIds.length} selected</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {visibleProducts.map((product) => {
                const selected = selectedIds.includes(product.id);
                const image =
                  product.images.find((item) => item.is_primary) ?? product.images[0];

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className={`grid grid-cols-[92px_1fr_auto] gap-3 rounded-[8px] border p-2 text-left transition-colors ${
                      selected
                        ? "border-m-blue-dark bg-surface-card"
                        : "border-hairline bg-surface-soft hover:border-hairline-strong"
                    }`}
                  >
                    {image ? (
                      <img
                        src={image.public_url}
                        alt={image.alt_text ?? product.name}
                        className="aspect-square w-[92px] rounded-[4px] object-cover"
                      />
                    ) : (
                      <div className="aspect-square w-[92px] rounded-[4px] bg-surface-card" />
                    )}
                    <span className="min-w-0 self-center">
                      <span className="uppercase-label block text-muted">
                        {product.sku}
                      </span>
                      <span className="mt-1 block truncate font-semibold text-ink">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-sm text-body">
                        {product.finish_color || product.category?.name || "On request"}
                      </span>
                    </span>
                    <span
                      className={`grid h-8 w-8 place-items-center self-center rounded-full border ${
                        selected
                          ? "border-m-blue-dark bg-m-blue-dark text-on-primary"
                          : "border-hairline text-muted"
                      }`}
                    >
                      {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <Card className="p-5">
              <p className="uppercase-label text-muted">Session output</p>
              <h2 className="editorial-title mt-2 text-3xl leading-[1.1]">
                Share while the customer is present
              </h2>
              <p className="mt-3 text-sm leading-6 text-body">
                The link opens without login and preserves shortlist, notes, and
                revisit continuity for follow-up.
              </p>
              <Button
                className="mt-5 h-12 w-full justify-center"
                onClick={createSession}
                disabled={busy || !title.trim() || !selectedIds.length}
              >
                <QrCode className="h-4 w-4" />
                Generate session
              </Button>
            </Card>

            {created ? (
              <Card className="grid gap-4 p-5">
                <div className="rounded-[8px] border border-hairline bg-surface-card p-4">
                  <QRCodeSVG value={created.url} className="h-full w-full" />
                </div>
                <Textarea readOnly value={created.url} className="min-h-20 text-sm" />
                <div className="grid gap-3">
                  <Button className="h-12 justify-center" onClick={copyLink}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  <Button variant="outline" className="h-12 justify-center" asChild>
                    <a
                      href={`https://wa.me/?text=${whatsAppText}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Share on WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" className="h-12 justify-center" asChild>
                    <Link href="/sessions">View sessions</Link>
                  </Button>
                </div>
              </Card>
            ) : null}
          </aside>
        </div>
      </Card>
    </div>
  );
}
