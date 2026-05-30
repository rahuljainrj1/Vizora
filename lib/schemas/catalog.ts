import { z } from "zod";

export const catalogSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Catalog title is required"),
  coverTitle: z.string().trim().optional(),
  description: z.string().trim().optional(),
  productIds: z.array(z.string().uuid()).min(1, "Select at least one product"),
  layoutByProduct: z
    .record(
      z.string().uuid(),
      z.enum(["hero", "image", "compact", "detail"]),
    )
    .optional(),
});

export type CatalogInput = z.infer<typeof catalogSchema>;

export const sessionTrackSchema = z.discriminatedUnion("event", [
  z.object({
    event: z.literal("open"),
    visitorKey: z.string().trim().min(12),
  }),
  z.object({
    event: z.literal("heartbeat"),
    visitId: z.string().uuid(),
    elapsedSeconds: z.number().int().min(0).max(24 * 60 * 60),
  }),
]);
