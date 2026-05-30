import { AdminShell } from "@/components/app/admin-shell";
import { SessionsDashboard } from "@/components/sessions/sessions-dashboard";

export default function SessionsPage() {
  return (
    <AdminShell
      eyebrow="Customer sessions"
      title="Session Follow-Up"
      description="Track lightweight customer continuation links after showroom visits."
      headerVariant="none"
    >
      <SessionsDashboard />
    </AdminShell>
  );
}
