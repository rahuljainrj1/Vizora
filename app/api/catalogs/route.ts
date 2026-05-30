import { ok, parseRouteError, setupRequired } from "@/lib/api";
import { catalogSchema } from "@/lib/schemas/catalog";
import { getBootstrapData, saveCatalog } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const data = await getBootstrapData();
    return ok(data.catalogs);
  } catch (error) {
    return parseRouteError(error);
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const input = catalogSchema.parse(await request.json());
    const catalog = await saveCatalog(input);
    return ok(catalog);
  } catch (error) {
    return parseRouteError(error);
  }
}
