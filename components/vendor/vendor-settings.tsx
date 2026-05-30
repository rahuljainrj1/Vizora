"use client";

/* eslint-disable @next/next/no-img-element */

import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SetupPanel } from "@/components/app/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/client-api";
import { compressImage } from "@/lib/image-compression";
import { useBootstrapQuery, useInvalidateWorkspaceQueries } from "@/lib/queries";
import { vendorSchema, type VendorInput } from "@/lib/schemas/vendor";
import type { Vendor } from "@/lib/types";

export function VendorSettings() {
  const {
    data,
    error: loadError,
    isLoading,
  } = useBootstrapQuery();

  const error =
    loadError instanceof Error ? loadError.message : loadError ? "Load failed" : null;

  if (isLoading) {
    return <div className="border border-hairline bg-surface-soft p-8">Loading profile...</div>;
  }

  if (error && !data?.vendor) {
    return <SetupPanel message={error} />;
  }

  if (!data?.vendor) {
    return <SetupPanel message="Vendor profile data is unavailable." />;
  }

  return <VendorSettingsForm initialVendor={data.vendor} />;
}

function VendorSettingsForm({ initialVendor }: { initialVendor: Vendor }) {
  const invalidateWorkspaceQueries = useInvalidateWorkspaceQueries();
  const [vendor, setVendor] = useState<Vendor>(initialVendor);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const form = useForm<VendorInput>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      businessName: initialVendor.business_name,
      contactName: initialVendor.contact_name ?? "",
      phone: initialVendor.phone ?? "",
      email: initialVendor.email ?? "",
      website: initialVendor.website ?? "",
      address: initialVendor.address ?? "",
      brandColor: initialVendor.brand_color,
    },
  });

  async function save(values: VendorInput) {
    setBusy(true);
    try {
      setActionError(null);
      const updated = await apiFetch<Vendor>("/api/vendor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setVendor(updated);
      await invalidateWorkspaceQueries();
    } catch (saveError) {
      setActionError(saveError instanceof Error ? saveError.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function uploadLogo(file: File) {
    setBusy(true);
    try {
      setActionError(null);
      const compressed = await compressImage(file, 900, 0.88);
      const formData = new FormData();
      formData.append("kind", "logo");
      formData.append("file", compressed);
      const upload = await apiFetch<{ publicUrl: string }>(
        "/api/uploads/catalog-asset",
        {
          method: "POST",
          body: formData,
        },
      );
      setVendor((current) => ({ ...current, logo_url: upload.publicUrl }));
      await invalidateWorkspaceQueries();
    } catch (uploadError) {
      setActionError(
        uploadError instanceof Error ? uploadError.message : "Upload failed",
      );
    } finally {
      setBusy(false);
    }
  }

  const error = actionError;

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      {error ? (
        <div className="border border-m-red bg-surface-soft p-4 text-sm text-body lg:col-span-2">
          {error}
        </div>
      ) : null}

      <aside className="border border-hairline bg-surface-soft p-5">
        <p className="uppercase-label text-muted">Catalog identity</p>
        <div className="mt-5 grid aspect-square place-items-center border border-hairline bg-canvas">
          {vendor?.logo_url ? (
            <img
              src={vendor.logo_url}
              alt={`${vendor.business_name} logo`}
              className="max-h-40 max-w-40 object-contain"
            />
          ) : (
            <span className="text-6xl font-bold uppercase">V</span>
          )}
        </div>
        <label className="mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-hairline p-4 text-center transition-colors hover:border-ink">
          <Upload className="mb-2 h-5 w-5 text-body" />
          <span className="uppercase-label text-body-strong">Upload logo</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadLogo(file);
            }}
          />
        </label>
      </aside>

      <form
        onSubmit={form.handleSubmit(save)}
        className="grid gap-6 border border-hairline bg-surface-soft p-5 sm:p-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Business name"
            error={form.formState.errors.businessName?.message}
          >
            <Input {...form.register("businessName")} />
          </Field>
          <Field label="Contact name">
            <Input {...form.register("contactName")} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <Input {...form.register("phone")} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input {...form.register("email")} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <Field label="Website">
            <Input {...form.register("website")} />
          </Field>
          <Field
            label="Brand color"
            error={form.formState.errors.brandColor?.message}
          >
            <Input type="color" {...form.register("brandColor")} className="p-1" />
          </Field>
        </div>
        <Field label="Address">
          <Textarea {...form.register("address")} />
        </Field>
        <div className="border-t border-hairline pt-6">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving" : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
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
