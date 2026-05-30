import { ok, parseRouteError, setupRequired } from "@/lib/api";
import { getBootstrapData } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const data = await getBootstrapData();
    return ok(data);
  } catch (error) {
    return parseRouteError(error);
  }
}
