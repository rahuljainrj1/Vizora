export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Vendor = {
  id: string;
  business_name: string;
  logo_path: string | null;
  logo_url: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  brand_color: string;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  vendor_id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductOption = {
  id: string;
  vendor_id: string;
  product_id: string;
  label: string;
  finish_color: string | null;
  image_id: string | null;
  linked_product_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  vendor_id: string;
  category_id: string | null;
  sku: string;
  name: string;
  material_type: string | null;
  finish_color: string | null;
  description: string | null;
  tags: string[];
  ai_metadata: Json;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductWithImages = Product & {
  category?: Category | null;
  images: ProductImage[];
  options: ProductOption[];
};

export type Catalog = {
  id: string;
  vendor_id: string;
  title: string;
  cover_title: string | null;
  contact_snapshot: Json;
  product_order: Json;
  options: Json;
  created_at: string;
  updated_at: string;
};

export type CatalogSession = {
  id: string;
  vendor_id: string;
  catalog_id: string;
  open_count: number;
  revisit_count: number;
  total_time_seconds: number;
  last_opened_at: string | null;
  created_at: string;
};

export type CustomerSession = {
  id: string;
  vendor_id: string;
  catalog_id: string | null;
  title: string;
  customer_name: string | null;
  share_token: string;
  open_count: number;
  last_opened_at: string | null;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
};

export type SessionProduct = {
  session_id: string;
  product_id: string;
  sort_order: number;
  created_at: string;
};

export type SessionEventType =
  | "session_opened"
  | "product_viewed"
  | "product_shortlisted"
  | "compare_opened"
  | "note_added"
  | "discussed"
  | "revisit";

export type SessionEvent = {
  id: string;
  session_id: string;
  event_type: SessionEventType;
  product_id: string | null;
  metadata: Json;
  created_at: string;
};

export type CustomerSessionSummary = CustomerSession & {
  products: ProductWithImages[];
  events: SessionEvent[];
  shortlisted_product_ids: string[];
  discussed_product_ids: string[];
  revisit_count: number;
  note_count: number;
};

export type BootstrapData = {
  vendor: Vendor;
  categories: Category[];
  products: ProductWithImages[];
  catalogs: Catalog[];
  sessions: CatalogSession[];
};

export type SessionBundle = {
  session: CatalogSession;
  catalog: Catalog;
  vendor: Vendor;
  categories: Category[];
  products: ProductWithImages[];
};

export type CollaborativeSessionBundle = {
  session: CustomerSession;
  vendor: Vendor;
  catalog: Catalog | null;
  categories: Category[];
  products: ProductWithImages[];
  events: SessionEvent[];
  shortlistedProductIds: string[];
  discussedProductIds: string[];
  notesByProduct: Record<string, SessionEvent[]>;
};
