import { fail, ok, parseRouteError, setupRequired } from "@/lib/api";
import { createCatalogSession } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const body = (await request.json()) as { catalogId?: string };
    if (!body.catalogId) return fail("Catalog id is required", 422);
    const data = await createCatalogSession(body.catalogId);
    return ok(data);
  } catch (error) {
    return parseRouteError(error);
  }
}
