"use client";

import { useEffect, useRef } from "react";

const VISITOR_KEY = "vizora_visitor_key";

function getVisitorKey() {
  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(VISITOR_KEY, next);
  return next;
}

export function SessionTracker({ sessionId }: { sessionId: string }) {
  const visitId = useRef<string | null>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    let disposed = false;
    startedAt.current = Date.now();

    async function openSession() {
      const response = await fetch(`/api/session/${sessionId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "open",
          visitorKey: getVisitorKey(),
        }),
      });
      const payload = (await response.json()) as {
        data?: { visitId?: string };
      };
      if (!disposed) {
        visitId.current = payload.data?.visitId ?? null;
      }
    }

    function elapsedSeconds() {
      return Math.max(1, Math.floor((Date.now() - startedAt.current) / 1000));
    }

    function sendHeartbeat() {
      if (!visitId.current) return;
      const body = JSON.stringify({
        event: "heartbeat",
        visitId: visitId.current,
        elapsedSeconds: elapsedSeconds(),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `/api/session/${sessionId}/track`,
          new Blob([body], { type: "application/json" }),
        );
        return;
      }

      void fetch(`/api/session/${sessionId}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }

    void openSession();
    const interval = window.setInterval(sendHeartbeat, 10000);
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") sendHeartbeat();
    }

    window.addEventListener("pagehide", sendHeartbeat);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.removeEventListener("pagehide", sendHeartbeat);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sendHeartbeat();
    };
  }, [sessionId]);

  return null;
}
