"use client";

/* eslint-disable @next/next/no-img-element */

import {
  CheckCircle2,
  Heart,
  Maximize2,
  MessageCircle,
  Scale,
  Send,
  Share2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type {
  Category,
  CollaborativeSessionBundle,
  ProductWithImages,
  SessionEvent,
} from "@/lib/types";

const VISITOR_KEY = "vizora_visitor_key";

function getVisitorKey() {
  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(VISITOR_KEY, next);
  return next;
}

export function CollaborativeSessionView({
  bundle,
}: {
  bundle: CollaborativeSessionBundle;
}) {
  const { session, vendor, categories, products } = bundle;
  const [favoriteIds, setFavoriteIds] = useState(
    () => new Set(bundle.shortlistedProductIds),
  );
  const [discussedIds, setDiscussedIds] = useState(
    () => new Set(bundle.discussedProductIds),
  );
  const [notesByProduct, setNotesByProduct] = useState(() =>
    getInitialNotes(bundle.notesByProduct),
  );
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [zoomProduct, setZoomProduct] = useState<ProductWithImages | null>(null);
  const grouped = groupProducts(categories, products);
  const phoneDigits = vendor.phone?.replace(/\D/g, "");
  const compareProducts = compareIds
    .map((productId) => products.find((product) => product.id === productId))
    .filter((product): product is ProductWithImages => Boolean(product));

  async function recordEvent(
    eventType:
      | "product_viewed"
      | "product_shortlisted"
      | "compare_opened"
      | "note_added"
      | "discussed"
      | "session_opened",
    productId?: string,
    metadata: Record<string, unknown> = {},
  ) {
    await fetch(`/api/session/${session.share_token}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        productId,
        visitorKey: getVisitorKey(),
        metadata,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }

  useEffect(() => {
    void recordEvent("session_opened");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.share_token]);

  useEffect(() => {
    const viewed = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const productId = (entry.target as HTMLElement).dataset.productId;
          if (!productId || viewed.has(productId)) return;
          viewed.add(productId);
          void recordEvent("product_viewed", productId);
        });
      },
      { threshold: 0.55 },
    );

    document
      .querySelectorAll<HTMLElement>("[data-product-id]")
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  function toggleFavorite(productId: string) {
    setFavoriteIds((current) => {
      const next = new Set(current);
      const selected = !next.has(productId);
      if (selected) next.add(productId);
      else next.delete(productId);
      void recordEvent("product_shortlisted", productId, { selected });
      return next;
    });
  }

  function toggleDiscussed(productId: string) {
    setDiscussedIds((current) => {
      const next = new Set(current);
      const selected = !next.has(productId);
      if (selected) next.add(productId);
      else next.delete(productId);
      void recordEvent("discussed", productId, { selected });
      return next;
    });
  }

  function toggleCompare(productId: string) {
    setCompareMode(true);
    setCompareIds((current) => {
      const exists = current.includes(productId);
      const next = exists
        ? current.filter((id) => id !== productId)
        : [...current, productId].slice(-3);
      void recordEvent("compare_opened", productId, { compareIds: next });
      return next;
    });
  }

  function addNote(productId: string) {
    const note = noteDrafts[productId]?.trim();
    if (!note) return;
    setNotesByProduct((current) => ({
      ...current,
      [productId]: [...(current[productId] ?? []), note],
    }));
    setNoteDrafts((current) => ({ ...current, [productId]: "" }));
    void recordEvent("note_added", productId, { note });
  }

  async function shareSession() {
    if (navigator.share) {
      await navigator
        .share({
          title: session.title,
          text: "Review this Vizora showroom session",
          url: window.location.href,
        })
        .catch(() => undefined);
    }
  }

  return (
    <main className="min-h-screen bg-[#fefefe] pb-28 text-ink">
      <section className="px-4 pb-8 pt-5">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="uppercase-label text-muted">{vendor.business_name}</p>
              <h1 className="editorial-title mt-3 text-4xl leading-[1.04]">
                {session.title}
              </h1>
              {session.customer_name ? (
                <p className="mt-3 text-sm text-body">{session.customer_name}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={shareSession}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-hairline bg-surface-soft text-ink"
              aria-label="Share session"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-[10px] border border-hairline bg-surface-soft p-3 text-center">
            <SessionStat label="Products" value={String(products.length)} />
            <SessionStat label="Shortlist" value={String(favoriteIds.size)} />
            <SessionStat label="Discussed" value={String(discussedIds.size)} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-3xl gap-9 px-4">
        {grouped.map((group) => (
          <div key={group.name} className="grid gap-4">
            <div>
              <p className="uppercase-label text-muted">Category</p>
              <h2 className="editorial-title mt-1 text-3xl leading-[1.08]">
                {group.name}
              </h2>
            </div>
            {group.products.map((product) => (
              <SessionProductCard
                key={product.id}
                product={product}
                favorite={favoriteIds.has(product.id)}
                discussed={discussedIds.has(product.id)}
                inCompare={compareIds.includes(product.id)}
                notes={notesByProduct[product.id] ?? []}
                noteDraft={noteDrafts[product.id] ?? ""}
                onNoteDraftChange={(value) =>
                  setNoteDrafts((current) => ({ ...current, [product.id]: value }))
                }
                onFavorite={() => toggleFavorite(product.id)}
                onDiscussed={() => toggleDiscussed(product.id)}
                onCompare={() => toggleCompare(product.id)}
                onAddNote={() => addNote(product.id)}
                onZoom={() => setZoomProduct(product)}
              />
            ))}
          </div>
        ))}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-[#fefefe]/95 p-3 backdrop-blur">
        <div className="mx-auto grid max-w-3xl grid-cols-[1fr_auto] gap-3">
          {phoneDigits ? (
            <a
              href={`https://wa.me/${phoneDigits}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-ink px-4 text-sm font-semibold text-on-primary"
            >
              <MessageCircle className="h-4 w-4" />
              Ask vendor
            </a>
          ) : (
            <Button className="h-12">Contact vendor</Button>
          )}
          <Button
            variant={compareMode ? "default" : "outline"}
            className="h-12 bg-surface-soft"
            onClick={() => {
              setCompareMode((current) => !current);
              void recordEvent("compare_opened", undefined, { compareIds });
            }}
          >
            <Scale className="h-4 w-4" />
            Compare {compareIds.length ? `(${compareIds.length})` : ""}
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(zoomProduct)} onOpenChange={() => setZoomProduct(null)}>
        <DialogContent className="max-w-4xl p-0">
          {zoomProduct ? (
            <img
              src={getProductImage(zoomProduct)?.public_url}
              alt={getProductImage(zoomProduct)?.alt_text ?? zoomProduct.name}
              className="max-h-[86vh] w-full object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={compareMode && compareProducts.length > 0} onOpenChange={setCompareMode}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Compare shortlisted options</DialogTitle>
            <DialogDescription>
              Keep this light: compare the visual, finish, and material before the
              next showroom follow-up.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {compareProducts.map((product) => (
              <div key={product.id} className="rounded-[8px] border border-hairline p-3">
                {getProductImage(product) ? (
                  <img
                    src={getProductImage(product)?.public_url}
                    alt={getProductImage(product)?.alt_text ?? product.name}
                    className="aspect-[4/3] w-full rounded-[6px] object-cover"
                  />
                ) : null}
                <p className="uppercase-label mt-3 text-muted">{product.sku}</p>
                <h3 className="mt-1 font-semibold">{product.name}</h3>
                <div className="mt-3 grid gap-2 text-sm text-body">
                  <ComparisonLine label="Material" value={product.material_type} />
                  <ComparisonLine label="Finish" value={product.finish_color} />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function SessionProductCard({
  product,
  favorite,
  discussed,
  inCompare,
  notes,
  noteDraft,
  onNoteDraftChange,
  onFavorite,
  onDiscussed,
  onCompare,
  onAddNote,
  onZoom,
}: {
  product: ProductWithImages;
  favorite: boolean;
  discussed: boolean;
  inCompare: boolean;
  notes: string[];
  noteDraft: string;
  onNoteDraftChange: (value: string) => void;
  onFavorite: () => void;
  onDiscussed: () => void;
  onCompare: () => void;
  onAddNote: () => void;
  onZoom: () => void;
}) {
  const image = getProductImage(product);

  return (
    <article
      data-product-id={product.id}
      className="overflow-hidden rounded-[12px] border border-hairline bg-surface-soft shadow-[0_18px_45px_rgba(40,44,63,0.05)]"
    >
      <div className="relative bg-surface-card">
        {image ? (
          <img
            src={image.public_url}
            alt={image.alt_text ?? product.name}
            className="aspect-[4/5] w-full object-cover sm:aspect-[16/10]"
          />
        ) : (
          <div className="grid aspect-[4/5] place-items-center text-body">
            No image
          </div>
        )}
        <button
          type="button"
          onClick={onZoom}
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm"
          aria-label="Zoom product image"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 p-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="uppercase-label text-muted">{product.sku}</p>
            {discussed ? (
              <Badge variant="accent">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Discussed
              </Badge>
            ) : null}
          </div>
          <h3 className="editorial-title mt-2 text-3xl leading-[1.08]">
            {product.name}
          </h3>
          {product.description ? (
            <p className="mt-3 text-sm leading-6 text-body">{product.description}</p>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-3 border-y border-hairline py-4">
            <ComparisonLine label="Material" value={product.material_type} />
            <ComparisonLine label="Finish" value={product.finish_color} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={favorite ? "default" : "outline"}
            className="bg-surface-soft"
            onClick={onFavorite}
          >
            <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
            Save
          </Button>
          <Button
            variant={inCompare ? "default" : "outline"}
            className="bg-surface-soft"
            onClick={onCompare}
          >
            <Scale className="h-4 w-4" />
            Compare
          </Button>
          <Button
            variant={discussed ? "default" : "outline"}
            className="bg-surface-soft"
            onClick={onDiscussed}
          >
            <CheckCircle2 className="h-4 w-4" />
            Discussed
          </Button>
        </div>

        <div className="grid gap-3 rounded-[8px] border border-hairline bg-canvas p-3">
          {notes.length ? (
            <div className="grid gap-2">
              {notes.slice(-2).map((note, index) => (
                <p key={`${note}-${index}`} className="text-sm leading-6 text-body">
                  {note}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Add a family note or decision cue.</p>
          )}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Textarea
              value={noteDraft}
              onChange={(event) => onNoteDraftChange(event.target.value)}
              placeholder="Add note"
              className="min-h-12"
            />
            <Button size="icon" onClick={onAddNote} aria-label="Add note">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SessionStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-semibold text-ink">{value}</p>
      <p className="uppercase-label mt-1 text-muted">{label}</p>
    </div>
  );
}

function ComparisonLine({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="uppercase-label text-muted">{label}</p>
      <p className="mt-1 text-sm text-body-strong">{value || "On request"}</p>
    </div>
  );
}

function getProductImage(product: ProductWithImages) {
  return product.images.find((image) => image.is_primary) ?? product.images[0];
}

function getInitialNotes(notesByProduct: Record<string, SessionEvent[]>) {
  return Object.fromEntries(
    Object.entries(notesByProduct).map(([productId, events]) => [
      productId,
      events
        .map((event) =>
          event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)
            ? (event.metadata as Record<string, unknown>).note
            : null,
        )
        .filter((note): note is string => typeof note === "string" && Boolean(note.trim())),
    ]),
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
