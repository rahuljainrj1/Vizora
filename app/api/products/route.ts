import { ok, parseRouteError, setupRequired } from "@/lib/api";
import { productSchema } from "@/lib/schemas/product";
import { getBootstrapData, saveProduct } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const data = await getBootstrapData();
    return ok(data.products);
  } catch (error) {
    return parseRouteError(error);
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const input = productSchema.parse(await request.json());
    const product = await saveProduct(input);
    return ok(product);
  } catch (error) {
    return parseRouteError(error);
  }
}
