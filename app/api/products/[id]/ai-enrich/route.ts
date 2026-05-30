import { fail, ok, parseRouteError, setupRequired } from "@/lib/api";
import { getBootstrapData } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getFunctionUrl() {
  const explicitUrl = process.env.SUPABASE_PRODUCT_AI_FUNCTION_URL;
  if (explicitUrl) return explicitUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/product-image-ai`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      removeBackground?: boolean;
      generateMetadata?: boolean;
      writeMode?: "suggest" | "update";
    };
    const data = await getBootstrapData();
    const product = data.products.find((item) => item.id === id);
    if (!product) return fail("Product not found", 404);

    const image =
      product.images.find((item) => item.is_primary) ?? product.images[0];
    if (!image) return fail("Product needs at least one image before AI polish", 422);

    const functionUrl = getFunctionUrl();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!functionUrl || !serviceRoleKey) {
      return fail(
        "AI edge function is not configured. Set SUPABASE_PRODUCT_AI_FUNCTION_URL and SUPABASE_SERVICE_ROLE_KEY.",
        503,
      );
    }

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({
        productId: product.id,
        imageId: image.id,
        vendorId: product.vendor_id,
        bucket: "product-images",
        storagePath: image.storage_path,
        imageUrl: image.public_url,
        fileName: image.alt_text || `${product.sku}.jpg`,
        context: {
          sku: product.sku,
          name: product.name,
          category: product.category?.name,
          materialType: product.material_type,
          finishColor: product.finish_color,
          tags: product.tags,
          description: product.description,
        },
        operations: {
          generateMetadata: body.generateMetadata !== false,
          removeBackground: body.removeBackground !== false,
        },
        writeMode: body.writeMode || "update",
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return fail(payload.error || "AI edge function failed", response.status);
    }

    return ok(payload);
  } catch (error) {
    return parseRouteError(error);
  }
}
