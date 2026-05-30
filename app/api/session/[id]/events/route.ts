import { ok, parseRouteError, setupRequired } from "@/lib/api";
import { sessionEventSchema } from "@/lib/schemas/session";
import { recordCustomerSessionEvent } from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const { id } = await params;
    const input = sessionEventSchema.parse(await request.json());
    return ok(await recordCustomerSessionEvent(id, input));
  } catch (error) {
    return parseRouteError(error);
  }
}
