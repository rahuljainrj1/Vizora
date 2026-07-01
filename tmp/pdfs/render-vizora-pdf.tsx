import { renderToFile } from "@react-pdf/renderer";
import { CatalogPdfDocument } from "../../components/catalog/catalog-pdf";
import type { Category, ProductWithImages, Vendor } from "../../lib/types";

const now = new Date().toISOString();
const imageA =
  "/Users/rahuljain/Documents/Vizora/tmp/pdfs/atomberg/product-09.png";
const imageB =
  "/Users/rahuljain/Documents/Vizora/tmp/pdfs/atomberg/product-08.png";

const vendor: Vendor = {
  id: "vendor",
  business_name: "Vizora Fabrication Studio",
  logo_path: null,
  logo_url: null,
  contact_name: "Rahul Jain",
  phone: "+91 99999 99999",
  email: "studio@vizora.test",
  website: "vizora.test",
  address: "Mumbai, India",
  brand_color: "#ff3f6c",
  created_at: now,
  updated_at: now,
};

const categories: Category[] = [
  {
    id: "railings",
    vendor_id: vendor.id,
    name: "Premium Railings",
    slug: "premium-railings",
    sort_order: 0,
    created_at: now,
    updated_at: now,
  },
];

const products: ProductWithImages[] = [
  {
    id: "product-1",
    vendor_id: vendor.id,
    category_id: "railings",
    sku: "RAIL-01",
    name: "Fluted Stone Railing",
    material_type: "Stone veneer over metal frame",
    finish_color: "Warm oak, pearl white, sand grey",
    description:
      "A premium railing profile for interior balconies and double-height spaces, prepared with clean finish references for client review.",
    tags: ["premium", "living room", "fabrication"],
    ai_metadata: {},
    featured: true,
    display_order: 0,
    created_at: now,
    updated_at: now,
    category: categories[0],
    images: [
      {
        id: "image-1",
        vendor_id: vendor.id,
        product_id: "product-1",
        storage_path: "sample/a.png",
        public_url: imageA,
        alt_text: "Primary railing product view",
        sort_order: 0,
        is_primary: true,
        created_at: now,
      },
      {
        id: "image-2",
        vendor_id: vendor.id,
        product_id: "product-1",
        storage_path: "sample/b.png",
        public_url: imageB,
        alt_text: "Alternate finish view",
        sort_order: 1,
        is_primary: false,
        created_at: now,
      },
    ],
    options: [
      {
        id: "option-1",
        vendor_id: vendor.id,
        product_id: "product-1",
        label: "Golden Oakwood",
        finish_color: "Wooden finish",
        image_id: "image-1",
        linked_product_id: null,
        sort_order: 0,
        created_at: now,
        updated_at: now,
      },
      {
        id: "option-2",
        vendor_id: vendor.id,
        product_id: "product-1",
        label: "Pearl White",
        finish_color: "Metallic finish",
        image_id: "image-2",
        linked_product_id: null,
        sort_order: 1,
        created_at: now,
        updated_at: now,
      },
    ],
  },
];

async function main() {
  await renderToFile(
    <CatalogPdfDocument
      vendor={vendor}
      categories={categories}
      products={products}
      title="Materials for Review"
      coverTitle="Showroom Material Edit"
      description="Curated finishes, material options, and fabrication details prepared for client review."
      layoutByProduct={{ "product-1": "image" }}
    />,
    "/Users/rahuljain/Documents/Vizora/tmp/pdfs/vizora-catalog-sample.pdf",
  );
}

void main();
