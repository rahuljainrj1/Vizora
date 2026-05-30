import { ok, parseRouteError, setupRequired } from "@/lib/api";
import { productSchema } from "@/lib/schemas/product";
import { saveProduct } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const { id } = await params;
    const input = productSchema.parse(await request.json());
    const product = await saveProduct(input, id);
    return ok(product);
  } catch (error) {
    return parseRouteError(error);
  }
}
