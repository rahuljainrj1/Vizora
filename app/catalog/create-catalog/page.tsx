import { AdminShell } from "@/components/app/admin-shell";
import { CatalogBuilder } from "@/components/catalog/catalog-builder";

type CreateCatalogPageProps = {
  searchParams?: Promise<{
    id?: string | string[];
  }>;
};

export default async function CreateCatalogPage({
  searchParams,
}: CreateCatalogPageProps) {
  const params = await searchParams;
  const idParam = params?.id;
  const catalogId = Array.isArray(idParam) ? idParam[0] : idParam;

  return (
    <AdminShell
      eyebrow={catalogId ? "Edit catalog" : "Create catalog"}
      title={catalogId ? "Refine catalog" : "Create catalog"}
      description="Brief, select, arrange layouts, and publish a customer-ready catalog."
      headerVariant="none"
    >
      <CatalogBuilder
        catalogId={catalogId}
        header={{
          eyebrow: catalogId ? "Edit catalog" : "Create catalog",
          title: catalogId ? "Refine catalog" : "Create catalog",
          description:
            "Brief, select, arrange layouts, and publish a customer-ready catalog.",
        }}
      />
    </AdminShell>
  );
}
