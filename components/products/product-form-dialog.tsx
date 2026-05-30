"use client";

/* eslint-disable @next/next/no-img-element */

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, Plus, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import type { Category, ProductImage, ProductWithImages } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required"),
  name: z.string().trim().min(1, "Product name is required"),
  categoryId: z.string().optional(),
  newCategoryName: z.string().trim().optional(),
  materialType: z.string().trim().optional(),
  finishColor: z.string().trim().optional(),
  description: z.string().trim().optional(),
  tagsText: z.string().trim().optional(),
  featured: z.boolean(),
  options: z.array(
    z.object({
      label: z.string().trim().optional(),
      finishColor: z.string().trim().optional(),
      imageId: z.string().optional(),
      linkedProductId: z.string().optional(),
    }),
  ),
});

export type ProductOptionPayload = {
  label?: string;
  finishColor?: string;
  imageId?: string | null;
  linkedProductId?: string | null;
};

export type ProductFormPayload = {
  sku: string;
  name: string;
  categoryId: string | null;
  newCategoryName?: string;
  materialType?: string;
  finishColor?: string;
  description?: string;
  tags: string[];
  featured: boolean;
  options: ProductOptionPayload[];
};

type ProductFormValues = z.infer<typeof formSchema>;

export function ProductFormDialog({
  open,
  product,
  categories,
  busy,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  product: ProductWithImages | null;
  categories: Category[];
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ProductFormPayload, files: File[]) => Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const previews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sku: "",
      name: "",
      categoryId: "",
      newCategoryName: "",
      materialType: "",
      finishColor: "",
      description: "",
      tagsText: "",
      featured: false,
      options: [],
    },
  });
  const optionFields = useFieldArray({
    control: form.control,
    name: "options",
  });
  const featured = useWatch({
    control: form.control,
    name: "featured",
  });
  const watchedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });
  const watchedNewCategoryName = useWatch({
    control: form.control,
    name: "newCategoryName",
  });
  const watchedOptions = useWatch({
    control: form.control,
    name: "options",
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      sku: product?.sku ?? "",
      name: product?.name ?? "",
      categoryId: product?.category_id ?? "",
      newCategoryName: "",
      materialType: product?.material_type ?? "",
      finishColor: product?.finish_color ?? "",
      description: product?.description ?? "",
      tagsText: product?.tags.join(", ") ?? "",
      featured: product?.featured ?? false,
      options:
        product?.options.map((option) => ({
          label: option.label,
          finishColor: option.finish_color ?? "",
          imageId: option.image_id ?? "",
          linkedProductId: option.linked_product_id ?? "",
        })) ?? [],
    });
  }, [form, open, product]);

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews],
  );

  async function submit(values: ProductFormValues) {
    await onSubmit(
      {
        sku: values.sku,
        name: values.name,
        categoryId: values.categoryId || null,
        newCategoryName: values.newCategoryName || undefined,
        materialType: values.materialType,
        finishColor: values.finishColor,
        description: values.description,
        tags:
          values.tagsText
            ?.split(",")
            .map((tag) => tag.trim())
            .filter(Boolean) ?? [],
        featured: values.featured,
        options: values.options
          .map((option) => ({
            label: option.label?.trim() || option.finishColor?.trim(),
            finishColor: option.finishColor?.trim(),
            imageId: option.imageId || null,
            linkedProductId: option.linkedProductId || null,
          }))
          .filter((option) => option.label),
      },
      files,
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Edit SKU" : "Add SKU"}</DialogTitle>
          <DialogDescription>
            Keep the entry sharp: one strong name, clear material details, and
            product-first images.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="grid gap-6 p-6 sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU" error={form.formState.errors.sku?.message}>
              <Input {...form.register("sku")} placeholder="STONE-042" />
            </Field>
            <Field label="Product name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Fluted stone panel" />
            </Field>
          </div>

          <CategoryPicker
            categories={categories}
            categoryId={watchedCategoryId ?? ""}
            newCategoryName={watchedNewCategoryName ?? ""}
            onExistingCategory={(categoryId) => {
              form.setValue("categoryId", categoryId, { shouldDirty: true });
              form.setValue("newCategoryName", "", { shouldDirty: true });
            }}
            onNewCategory={(categoryName) => {
              form.setValue("categoryId", "", { shouldDirty: true });
              form.setValue("newCategoryName", categoryName, { shouldDirty: true });
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Material type">
              <Input {...form.register("materialType")} placeholder="Veneer, stone, metal" />
            </Field>
            <Field label="Finish / color">
              <Input {...form.register("finishColor")} placeholder="Matte walnut" />
            </Field>
          </div>

          <Field label="Description">
            <Textarea
              {...form.register("description")}
              placeholder="Short showroom-friendly description"
            />
          </Field>

          <Field label="Tags">
            <Input
              {...form.register("tagsText")}
              placeholder="premium, wall panel, living room"
            />
          </Field>

          <div className="grid gap-3">
            <Label>Images</Label>
            <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center border border-dashed border-hairline bg-surface-soft p-6 text-center transition-colors hover:border-ink">
              <Upload className="mb-3 h-6 w-6 text-body" />
              <span className="uppercase-label text-body-strong">
                Upload product images
              </span>
              <span className="mt-2 text-sm text-muted">
                Multiple images supported. Large files are compressed before upload.
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) =>
                  setFiles(Array.from(event.target.files ?? []))
                }
              />
            </label>
            {previews.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {previews.map((preview) => (
                  <img
                    key={preview.url}
                    src={preview.url}
                    alt={preview.name}
                    className="photo-ratio w-full border border-hairline object-cover"
                  />
                ))}
              </div>
            ) : null}
            {product?.images.length ? (
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Existing images
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {product.images.map((image, index) => (
                    <figure
                      key={image.id}
                      className="overflow-hidden rounded-[10px] border border-hairline bg-canvas"
                    >
                      <img
                        src={image.public_url}
                        alt={image.alt_text ?? `Product image ${index + 1}`}
                        className="photo-ratio w-full object-cover"
                      />
                      <figcaption className="px-2 py-1 text-xs text-muted">
                        Image {index + 1}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 rounded-[14px] border border-hairline bg-surface-soft p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Label>Finish options</Label>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Use this only for color or finish variants of the same SKU.
                  Material, tags, and description stay shared.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full bg-surface-soft px-4"
                onClick={() =>
                  optionFields.append({
                    label: "",
                    finishColor: "",
                    imageId: "",
                    linkedProductId: "",
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Add finish
              </Button>
            </div>

            {optionFields.fields.length ? (
              <div className="grid gap-3">
                {optionFields.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-4 rounded-[12px] border border-hairline bg-canvas p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-ink">
                        Finish {index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        aria-label="Remove finish option"
                        onClick={() => optionFields.remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Display name">
                        <Input
                          {...form.register(`options.${index}.label`)}
                          placeholder="Champagne gold"
                        />
                      </Field>
                      <Field label="Finish / color">
                        <Input
                          {...form.register(`options.${index}.finishColor`)}
                          placeholder="Brushed warm gold"
                        />
                      </Field>
                    </div>
                    <ImageLinkPicker
                      images={product?.images ?? []}
                      value={watchedOptions?.[index]?.imageId ?? ""}
                      onChange={(imageId) =>
                        form.setValue(`options.${index}.imageId`, imageId, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[12px] border border-dashed border-hairline bg-canvas px-4 py-5 text-sm text-muted">
                Add finish options only when this SKU is sold in multiple colors
                or surface treatments.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border border-hairline bg-surface-soft p-4">
            <div>
              <p className="uppercase-label text-body-strong">Featured product</p>
              <p className="mt-1 text-sm text-muted">
                Highlight this SKU in selection and catalog workflows.
              </p>
            </div>
            <Switch
              checked={featured}
              onCheckedChange={(checked) => form.setValue("featured", checked)}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-hairline pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving" : product ? "Save SKU" : "Create SKU"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <span className="text-sm text-m-red">{error}</span> : null}
    </label>
  );
}

function CategoryPicker({
  categories,
  categoryId,
  newCategoryName,
  onExistingCategory,
  onNewCategory,
}: {
  categories: Category[];
  categoryId: string;
  newCategoryName: string;
  onExistingCategory: (categoryId: string) => void;
  onNewCategory: (categoryName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const selectedLabel =
    newCategoryName || selectedCategory?.name || "Uncategorized";
  const filteredCategories = normalizedQuery
    ? categories.filter((category) =>
        category.name.toLowerCase().includes(normalizedQuery),
      )
    : categories;
  const exactMatch = categories.some(
    (category) => category.name.toLowerCase() === normalizedQuery,
  );
  const canAdd = Boolean(query.trim()) && !exactMatch;

  return (
    <div className="grid gap-2">
      <Label>Category</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-between rounded-[4px] border border-hairline bg-surface-card px-4 text-left text-[15px] text-ink outline-none transition-colors hover:border-hairline-strong focus:border-ink"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-body transition-transform",
                open ? "rotate-180" : "",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] p-2"
        >
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search or add category"
              className="h-11 bg-surface-soft pl-9"
            />
          </label>

          <div className="mt-2 grid max-h-64 gap-1 overflow-y-auto">
            <CategoryOption
              active={!categoryId && !newCategoryName}
              label="Uncategorized"
              onClick={() => {
                onExistingCategory("");
                setQuery("");
                setOpen(false);
              }}
            />
            {filteredCategories.map((category) => (
              <CategoryOption
                key={category.id}
                active={category.id === categoryId && !newCategoryName}
                label={category.name}
                onClick={() => {
                  onExistingCategory(category.id);
                  setQuery("");
                  setOpen(false);
                }}
              />
            ))}
            {canAdd ? (
              <button
                type="button"
                className="flex min-h-11 w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left text-[14px] font-medium text-ink transition-colors hover:bg-surface-card"
                onClick={() => {
                  onNewCategory(query.trim());
                  setQuery("");
                  setOpen(false);
                }}
              >
                <Plus className="h-4 w-4 text-m-blue-dark" />
                Add “{query.trim()}”
              </button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
      {newCategoryName ? (
        <p className="text-sm text-muted">
          New category will be created when this SKU is saved.
        </p>
      ) : null}
    </div>
  );
}

function CategoryOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-11 w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-left text-[14px] transition-colors hover:bg-surface-card",
        active ? "bg-surface-card text-ink" : "text-body",
      )}
      onClick={onClick}
    >
      <span className="truncate font-medium">{label}</span>
      {active ? <Check className="h-4 w-4 shrink-0 text-m-blue-dark" /> : null}
    </button>
  );
}

function ImageLinkPicker({
  images,
  value,
  onChange,
}: {
  images: ProductImage[];
  value: string;
  onChange: (imageId: string) => void;
}) {
  const selectedIndex = images.findIndex((image) => image.id === value);

  if (!images.length) {
    return (
      <div className="rounded-[10px] border border-dashed border-hairline bg-surface-soft px-4 py-4 text-sm text-muted">
        Upload and save product images first, then reopen this SKU to attach a
        finish option to a specific image.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <Label>Linked image</Label>
        {value ? (
          <button
            type="button"
            className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
            onClick={() => onChange("")}
          >
            Clear image
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {images.map((image, index) => {
          const active = image.id === value;
          return (
            <button
              key={image.id}
              type="button"
              className={cn(
                "overflow-hidden rounded-[10px] border bg-surface-soft text-left transition-colors",
                active ? "border-m-blue-dark ring-2 ring-m-blue-dark/15" : "border-hairline hover:border-hairline-strong",
              )}
              onClick={() => onChange(image.id)}
            >
              <img
                src={image.public_url}
                alt={image.alt_text ?? `Product image ${index + 1}`}
                className="photo-ratio w-full object-cover"
              />
              <span className="flex items-center justify-between gap-2 px-2 py-1 text-xs text-body">
                Image {index + 1}
                {active ? <Check className="h-3.5 w-3.5 text-m-blue-dark" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted">
        {selectedIndex >= 0
          ? `Linked to image ${selectedIndex + 1}.`
          : "Optional. Leave empty when the main product image is enough."}
      </p>
    </div>
  );
}
