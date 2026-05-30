"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/client-api";
import type { BootstrapData, CustomerSessionSummary, Vendor } from "@/lib/types";

export const queryKeys = {
  bootstrap: ["bootstrap"] as const,
  sessions: ["sessions"] as const,
};

export type SessionsResponse = {
  vendor: Vendor;
  sessions: CustomerSessionSummary[];
};

export function useBootstrapQuery() {
  return useQuery({
    queryKey: queryKeys.bootstrap,
    queryFn: () => apiFetch<BootstrapData>("/api/bootstrap"),
  });
}

export function useSessionsQuery() {
  return useQuery({
    queryKey: queryKeys.sessions,
    queryFn: () => apiFetch<SessionsResponse>("/api/sessions"),
    retry: false,
  });
}

export function useInvalidateWorkspaceQueries() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions }),
    ]);
}

export function useWorkspaceMutation<TData, TVariables>({
  mutationFn,
  invalidateSessions = false,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateSessions?: boolean;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.bootstrap });
      if (invalidateSessions) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      }
    },
  });
}
