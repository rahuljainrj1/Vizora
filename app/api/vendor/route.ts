import { ok, parseRouteError, setupRequired } from "@/lib/api";
import { vendorSchema } from "@/lib/schemas/vendor";
import { getBootstrapData, saveVendor } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const data = await getBootstrapData();
    return ok(data.vendor);
  } catch (error) {
    return parseRouteError(error);
  }
}

export async function PUT(request: Request) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const input = vendorSchema.parse(await request.json());
    const vendor = await saveVendor(input);
    return ok(vendor);
  } catch (error) {
    return parseRouteError(error);
  }
}
