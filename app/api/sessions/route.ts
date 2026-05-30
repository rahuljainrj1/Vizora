import { ok, parseRouteError, setupRequired } from "@/lib/api";
import { sessionCreateSchema } from "@/lib/schemas/session";
import {
  createCustomerSession,
  getCustomerSessionSummaries,
} from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    return ok(await getCustomerSessionSummaries());
  } catch (error) {
    return parseRouteError(error);
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const input = sessionCreateSchema.parse(await request.json());
    return ok(await createCustomerSession(input));
  } catch (error) {
    return parseRouteError(error);
  }
}
