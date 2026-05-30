import { AdminShell } from "@/components/app/admin-shell";
import { CatalogLibrary } from "@/components/catalog/catalog-library";

export default function CatalogPage() {
  return (
    <AdminShell
      eyebrow="Catalog library"
      title="Saved catalogs"
      description="Review every catalog you have created, reopen edits, export PDFs, and create share links for WhatsApp."
      headerVariant="none"
    >
      <CatalogLibrary
        header={{
          eyebrow: "Catalog library",
          title: "Saved catalogs",
          description:
            "Review every catalog you have created, reopen edits, export PDFs, and create share links for WhatsApp.",
        }}
      />
    </AdminShell>
  );
}
