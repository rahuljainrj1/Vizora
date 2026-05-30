import { AdminShell } from "@/components/app/admin-shell";
import { SessionCreateWorkspace } from "@/components/sessions/session-create-workspace";

export default function CreateSessionPage() {
  return (
    <AdminShell
      eyebrow="Create session"
      title="Customer Continuation"
      description="Build a mobile-first showroom follow-up link with QR and WhatsApp sharing."
      headerVariant="none"
    >
      <SessionCreateWorkspace />
    </AdminShell>
  );
}
