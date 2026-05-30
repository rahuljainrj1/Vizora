import { fail, ok, parseRouteError, setupRequired } from "@/lib/api";
import { createCategory } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const body = (await request.json()) as { name?: string };
    if (!body.name) return fail("Category name is required", 422);
    const category = await createCategory(body.name);
    return ok(category);
  } catch (error) {
    return parseRouteError(error);
  }
}
