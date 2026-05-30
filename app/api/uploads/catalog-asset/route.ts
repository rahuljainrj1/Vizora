import { fail, ok, parseRouteError, setupRequired } from "@/lib/api";
import { getOrCreateVendor } from "@/lib/supabase/data";
import {
  getPublicUrl,
  getSupabaseAdmin,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

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
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "asset");

    if (!(file instanceof File)) return fail("File is required", 422);

    const client = getSupabaseAdmin();
    const vendor = await getOrCreateVendor(client);
    const path = `${vendor.id}/${kind}/${Date.now()}-${safeFileName(
      file.name || "catalog-asset.jpg",
    )}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await client.storage
      .from("catalog-assets")
      .upload(path, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) throw new Error(uploadError.message);

    const publicUrl = getPublicUrl("catalog-assets", path);

    if (kind === "logo") {
      const { error } = await client
        .from("vendors")
        .update({
          logo_path: path,
          logo_url: publicUrl,
        })
        .eq("id", vendor.id);
      if (error) throw new Error(error.message);
    }

    return ok({ path, publicUrl });
  } catch (error) {
    return parseRouteError(error);
  }
}
