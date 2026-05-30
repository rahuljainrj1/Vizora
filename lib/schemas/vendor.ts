import { z } from "zod";

export const vendorSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required"),
  contactName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email().or(z.literal("")).optional(),
  website: z.string().trim().optional(),
  address: z.string().trim().optional(),
  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #ffffff"),
});

export type VendorInput = z.infer<typeof vendorSchema>;
