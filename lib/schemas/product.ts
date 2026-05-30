import { z } from "zod";

const productOptionSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().optional(),
  finishColor: z.string().trim().optional(),
  imageId: z.string().uuid().nullable().optional(),
  linkedProductId: z.string().uuid().nullable().optional(),
});

export const productSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required"),
  name: z.string().trim().min(1, "Product name is required"),
  categoryId: z.string().uuid().nullable().optional(),
  newCategoryName: z.string().trim().optional(),
  materialType: z.string().trim().optional(),
  finishColor: z.string().trim().optional(),
  description: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  featured: z.boolean().default(false),
  options: z.array(productOptionSchema).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

export const reorderProductsSchema = z.object({
  productIds: z.array(z.string().uuid()),
});
