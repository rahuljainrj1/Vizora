import { fail, ok, parseRouteError, setupRequired } from "@/lib/api";
import { sessionStatusSchema } from "@/lib/schemas/session";
import {
  duplicateCustomerSession,
  updateCustomerSessionStatus,
} from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const { id } = await params;
    const input = sessionStatusSchema.parse(await request.json());
    return ok(await updateCustomerSessionStatus(id, input));
  } catch (error) {
    return parseRouteError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action !== "duplicate") return fail("Unsupported session action", 422);
    return ok(await duplicateCustomerSession(id));
  } catch (error) {
    return parseRouteError(error);
  }
}
