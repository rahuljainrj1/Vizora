import Link from "next/link";
import { AdminNav } from "@/components/app/admin-nav";

export function AdminShell({
  title,
  eyebrow,
  description,
  headerVariant = "default",
  children,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  headerVariant?: "default" | "compact" | "none";
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-40 border-b border-hairline bg-surface-soft/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/products" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[2px] bg-ink font-serif text-base font-semibold text-on-primary">
              V
            </span>
            <span className="hidden leading-none sm:inline">
              <span className="block text-base font-semibold">Vizora</span>
              <span className="block text-[11px] text-muted">Catalog Studio</span>
            </span>
          </Link>
          <AdminNav />
        </div>
        <div className="vizora-stripe h-0.5" />
      </header>

      <section className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 sm:py-12 lg:px-10">
        {headerVariant === "none" ? null : headerVariant === "compact" ? (
          <div className="mb-5 rounded-[10px] border border-hairline bg-surface-soft px-5 py-4 shadow-[0_12px_36px_rgba(40,44,63,0.05)] sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="uppercase-label mb-2 text-muted">{eyebrow}</p>
                <h1 className="text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  {title}
                </h1>
              </div>
              {description ? (
                <p className="max-w-xl text-sm leading-6 text-body sm:text-right">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mb-7 grid gap-4 border-b border-hairline pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="uppercase-label mb-3 text-muted">{eyebrow}</p>
              <h1 className="editorial-title max-w-4xl text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-body sm:text-base">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        )}
        {children}
      </section>
    </main>
  );
}

export function SetupPanel({ message }: { message: string }) {
  return (
    <div className="rounded-[6px] border border-hairline bg-surface-soft p-6 shadow-[0_18px_45px_rgba(40,44,63,0.05)] sm:p-8">
      <p className="uppercase-label mb-3 text-muted">Setup required</p>
      <h2 className="editorial-title text-4xl leading-none">Connect Supabase</h2>
      <p className="mt-4 max-w-2xl text-body">{message}</p>
      <pre className="mt-6 overflow-x-auto border border-hairline bg-surface-card p-4 text-sm text-body">
        NEXT_PUBLIC_SUPABASE_URL=...
        {"\n"}NEXT_PUBLIC_SUPABASE_ANON_KEY=...
        {"\n"}SUPABASE_SERVICE_ROLE_KEY=...
      </pre>
    </div>
  );
}
