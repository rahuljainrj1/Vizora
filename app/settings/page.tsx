import { AdminShell } from "@/components/app/admin-shell";
import { VendorSettings } from "@/components/vendor/vendor-settings";

export default function SettingsPage() {
  return (
    <AdminShell eyebrow="Vendor profile" title="Brand And Contact Details">
      <VendorSettings />
    </AdminShell>
  );
}
