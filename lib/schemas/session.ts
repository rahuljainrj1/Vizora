import { z } from "zod";

export const sessionCreateSchema = z.object({
  title: z.string().trim().min(2, "Session title is required"),
  customerName: z.string().trim().optional().default(""),
  catalogId: z.string().uuid().optional().nullable(),
  productIds: z
    .array(z.string().uuid())
    .min(1, "Choose at least one product for the session"),
});

export const sessionStatusSchema = z.object({
  status: z.enum(["active", "archived"]),
});

export const sessionEventSchema = z.object({
  eventType: z.enum([
    "session_opened",
    "product_viewed",
    "product_shortlisted",
    "compare_opened",
    "note_added",
    "discussed",
    "revisit",
  ]),
  productId: z.string().uuid().optional().nullable(),
  visitorKey: z.string().trim().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type SessionCreateInput = z.infer<typeof sessionCreateSchema>;
export type SessionStatusInput = z.infer<typeof sessionStatusSchema>;
export type SessionEventInput = z.infer<typeof sessionEventSchema>;
