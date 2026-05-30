import { AdminShell } from "@/components/app/admin-shell";
import { ProductDashboard } from "@/components/products/product-dashboard";

export default function ProductsPage() {
  return (
    <AdminShell
      eyebrow="Product management"
      title="Showroom SKU Library"
      headerVariant="none"
    >
      <ProductDashboard />
    </AdminShell>
  );
}
