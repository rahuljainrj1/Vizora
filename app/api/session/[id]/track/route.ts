import { ok, parseRouteError, setupRequired } from "@/lib/api";
import { sessionTrackSchema } from "@/lib/schemas/catalog";
import {
  trackSessionHeartbeat,
  trackSessionOpen,
} from "@/lib/supabase/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) return setupRequired();

  try {
    const { id } = await params;
    const input = sessionTrackSchema.parse(await request.json());

    if (input.event === "open") {
      const data = await trackSessionOpen(id, input.visitorKey);
      return ok(data);
    }

    const data = await trackSessionHeartbeat(
      id,
      input.visitId,
      input.elapsedSeconds,
    );
    return ok(data);
  } catch (error) {
    return parseRouteError(error);
  }
}
