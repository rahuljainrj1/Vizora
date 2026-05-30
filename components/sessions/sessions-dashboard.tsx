"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  Archive,
  CopyPlus,
  ExternalLink,
  MessageCircle,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SetupPanel } from "@/components/app/admin-shell";
import {
  isSessionSchemaMissing,
  SessionMigrationNotice,
} from "@/components/sessions/session-migration-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Picker, type PickerOption } from "@/components/ui/picker";
import { apiFetch } from "@/lib/client-api";
import { useInvalidateWorkspaceQueries, useSessionsQuery } from "@/lib/queries";
import { getAppUrl } from "@/lib/utils";
import type { CustomerSession } from "@/lib/types";

export function SessionsDashboard() {
  const {
    data = null,
    error: loadError,
    isLoading,
  } = useSessionsQuery();
  const invalidateWorkspaceQueries = useInvalidateWorkspaceQueries();
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("active");
  const [busyId, setBusyId] = useState<string | null>(null);
  const statusOptions: PickerOption[] = [
    { value: "active", label: "Active sessions" },
    { value: "archived", label: "Archived" },
    { value: "all", label: "All sessions" },
  ];

  const filteredSessions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data?.sessions ?? []).filter((session) => {
      const matchesStatus = status === "all" || session.status === status;
      const matchesQuery = normalized
        ? [
            session.title,
            session.customer_name ?? "",
            session.products.map((product) => product.name).join(" "),
            session.products.map((product) => product.sku).join(" "),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalized)
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [data?.sessions, query, status]);

  async function updateStatus(sessionId: string, nextStatus: "active" | "archived") {
    setBusyId(sessionId);
    try {
      setActionError(null);
      await apiFetch<CustomerSession>(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      await invalidateWorkspaceQueries();
    } catch (updateError) {
      setActionError(
        updateError instanceof Error ? updateError.message : "Update failed",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function duplicateSession(sessionId: string) {
    setBusyId(sessionId);
    try {
      setActionError(null);
      await apiFetch(`/api/sessions/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      await invalidateWorkspaceQueries();
    } catch (duplicateError) {
      setActionError(
        duplicateError instanceof Error ? duplicateError.message : "Duplicate failed",
      );
    } finally {
      setBusyId(null);
    }
  }

  const error =
    actionError ??
    (loadError instanceof Error ? loadError.message : loadError ? "Load failed" : null);

  if (isLoading) {
    return <Card className="p-8 text-body">Loading sessions...</Card>;
  }

  if (error && !data) {
    if (isSessionSchemaMissing(error)) {
      return <SessionMigrationNotice message={error} />;
    }

    return <SetupPanel message={error} />;
  }

  return (
    <div className="grid gap-6">
      {error ? (
        <div className="rounded-[8px] border border-m-red bg-surface-soft p-4 text-sm text-body">
          {error}
        </div>
      ) : null}

      <header className="sticky top-[74px] z-30 -mx-4 grid gap-6 border-b border-hairline bg-canvas/95 px-4 pb-5 pt-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:grid-cols-[1fr_auto] lg:items-end lg:px-10">
        <div>
          <nav className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            <Link href="/products" className="transition-colors hover:text-ink">
              Studio
            </Link>
            <span>/</span>
            <span>Sessions</span>
          </nav>
          <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.01em] text-ink sm:text-[44px] lg:text-[52px]">
            Customer sessions
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-body">
            Follow up on the showroom decisions customers keep reviewing after they
            leave the physical space.
          </p>
        </div>
        <Button
          asChild
          className="h-14 justify-center rounded-[12px] border-0 bg-[linear-gradient(135deg,#ff905a_0%,#ff3f6c_55%,#f16565_100%)] px-6 text-white shadow-[0_18px_36px_rgba(255,63,108,0.24)] hover:opacity-95"
        >
          <Link href="/sessions/create">
            <Plus className="h-4 w-4" />
            Create session
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_220px]">
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Search
            </span>
            <Search className="pointer-events-none absolute left-4 top-[31px] h-4 w-4 -translate-y-1/2 text-body" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer, project, SKU"
              className="h-14 rounded-[12px] bg-surface-soft pl-11 pt-6 shadow-[0_1px_2px_rgba(40,44,63,0.05)]"
            />
          </label>
          <Picker
            label="Status"
            value={status}
            options={statusOptions}
            onChange={setStatus}
          />
      </section>

      {filteredSessions.length ? (
        <div className="grid gap-4">
          {filteredSessions.map((session) => {
            const firstImage =
              session.products[0]?.images.find((image) => image.is_primary) ??
              session.products[0]?.images[0];
            const url = `${getAppUrl()}/session/${session.share_token}`;
            const whatsAppText = encodeURIComponent(
              `Here is your Vizora showroom session: ${url}`,
            );

            return (
              <Card
                key={session.id}
                className="grid overflow-hidden lg:grid-cols-[260px_1fr]"
              >
                <div className="bg-surface-card">
                  {firstImage ? (
                    <img
                      src={firstImage.public_url}
                      alt={firstImage.alt_text ?? session.title}
                      className="h-full min-h-56 w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-56 place-items-center text-body">
                      No image
                    </div>
                  )}
                </div>
                <div className="grid gap-5 p-5 sm:p-6">
                  <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge variant={session.status === "active" ? "accent" : "outline"}>
                          {session.status}
                        </Badge>
                        <Badge variant="default">{session.products.length} products</Badge>
                        <Badge variant="default">
                          {session.shortlisted_product_ids.length} shortlisted
                        </Badge>
                        <Badge variant="outline">{session.note_count} notes</Badge>
                      </div>
                      <h2 className="editorial-title text-3xl leading-[1.08]">
                        {session.title}
                      </h2>
                      {session.customer_name ? (
                        <p className="mt-2 text-sm text-body">
                          {session.customer_name}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <SessionMetric label="Opens" value={String(session.open_count)} />
                      <SessionMetric
                        label="Revisits"
                        value={String(session.revisit_count)}
                      />
                      <SessionMetric
                        label="Discussed"
                        value={String(session.discussed_product_ids.length)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm text-body sm:grid-cols-2">
                    <p>Created {formatDate(session.created_at)}</p>
                    <p>
                      {session.last_opened_at
                        ? `Last opened ${formatDate(session.last_opened_at)}`
                        : "Not opened yet"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="bg-surface-soft" asChild>
                      <a href={url} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </a>
                    </Button>
                    <Button variant="outline" className="bg-surface-soft" asChild>
                      <a
                        href={`https://wa.me/?text=${whatsAppText}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-surface-soft"
                      disabled={busyId === session.id}
                      onClick={() => void duplicateSession(session.id)}
                    >
                      <CopyPlus className="h-4 w-4" />
                      Duplicate
                    </Button>
                    {session.status === "active" ? (
                      <Button
                        variant="outline"
                        className="bg-surface-soft"
                        disabled={busyId === session.id}
                        onClick={() => void updateStatus(session.id, "archived")}
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="bg-surface-soft"
                        disabled={busyId === session.id}
                        onClick={() => void updateStatus(session.id, "active")}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="grid gap-4 p-8 text-center">
          <p className="uppercase-label text-muted">No sessions</p>
          <h2 className="editorial-title text-[32px] leading-[1.12]">
            Start a customer continuation link
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-body">
            Create a session from the products discussed in the showroom, then
            share it by WhatsApp or QR.
          </p>
          <Button asChild className="mx-auto h-12">
            <Link href="/sessions/create">
              <Plus className="h-4 w-4" />
              Create session
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}

function SessionMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xl font-semibold text-ink">{value}</p>
      <p className="uppercase-label mt-1 text-muted">{label}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
