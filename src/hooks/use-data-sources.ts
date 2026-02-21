"use client";

import { useState, useEffect, useCallback } from "react";
import type { DataSource } from "@/lib/types";

export function useDataSources() {
  const [data, setData] = useState<DataSource[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/api-keys");
      if (!res.ok) throw new Error("Failed to fetch data sources");
      const json = await res.json();
      setData(json.sources);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    setLastSyncError(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (!res.ok) throw new Error("Failed to sync data sources");
    } catch (e) {
      setLastSyncError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { isSyncing, lastSyncError, sync };
}
