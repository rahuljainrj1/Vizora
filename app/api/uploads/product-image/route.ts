import { fail, ok, parseRouteError, setupRequired } from "@/lib/api";
import { getOrCreateVendor } from "@/lib/supabase/data";
import {
  getPublicUrl,
  getSupabaseAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import type { ProductImage } from "@/lib/types";

export const runtime = "nodejs";

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const formData = await request.formData();
    const productId = String(formData.get("productId") ?? "");
    const files = formData
      .getAll("files")
      .filter((file): file is File => file instanceof File);

    if (!productId) return fail("Product id is required", 422);
    if (!files.length) return fail("At least one image is required", 422);

    const client = getSupabaseAdmin();
    const vendor = await getOrCreateVendor(client);
    const { count, error: countError } = await client
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    if (countError) throw new Error(countError.message);

    const inserted: ProductImage[] = [];
    const existingCount = count ?? 0;

    for (const [index, file] of files.entries()) {
      const path = `${vendor.id}/${productId}/${Date.now()}-${index}-${safeFileName(
        file.name || "product-image.jpg",
      )}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await client.storage
        .from("product-images")
        .upload(path, bytes, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      const publicUrl = getPublicUrl("product-images", path);
      const { data, error } = await client
        .from("product_images")
        .insert({
          vendor_id: vendor.id,
          product_id: productId,
          storage_path: path,
          public_url: publicUrl,
          alt_text: file.name,
          sort_order: existingCount + index,
          is_primary: existingCount === 0 && index === 0,
        })
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      inserted.push(data as ProductImage);
    }

    return ok(inserted);
  } catch (error) {
    return parseRouteError(error);
  }
}
