import { ok, parseRouteError, setupRequired } from "@/lib/api";
import { reorderProductsSchema } from "@/lib/schemas/product";
import { reorderProducts } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const { productIds } = reorderProductsSchema.parse(await request.json());
    const data = await reorderProducts(productIds);
    return ok(data);
  } catch (error) {
    return parseRouteError(error);
  }
}
