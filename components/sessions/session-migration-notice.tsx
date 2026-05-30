import { Database, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SessionMigrationNotice({ message }: { message?: string }) {
  return (
    <Card className="grid gap-5 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-surface-card text-ink">
        <Database className="h-5 w-5" />
      </div>
      <div>
        <p className="uppercase-label text-muted">MVP2 database migration needed</p>
        <h2 className="editorial-title mt-2 text-3xl leading-[1.08]">
          Create the session tables in Supabase
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
          The collaborative session UI is installed, but Supabase does not yet
          have the new `sessions`, `session_products`, and `session_events`
          tables. Run `supabase/migrations/20260528000000_mvp2_sessions.sql`
          in the connected Supabase project, then refresh this page.
        </p>
        {message ? (
          <p className="mt-3 rounded-[6px] border border-hairline bg-surface-card p-3 text-xs text-body">
            {message}
          </p>
        ) : null}
        <Button asChild variant="outline" className="mt-5 bg-surface-soft">
          <a
            href="https://supabase.com/dashboard/project/_/sql"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Open Supabase SQL editor
          </a>
        </Button>
      </div>
    </Card>
  );
}

export function isSessionSchemaMissing(message: string | null) {
  if (!message) return false;
  return (
    message.includes('relation "public.sessions" does not exist') ||
    message.includes('relation "sessions" does not exist') ||
    message.includes("Could not find the table 'public.sessions'") ||
    message.includes("Could not find the 'sessions' table")
  );
}
