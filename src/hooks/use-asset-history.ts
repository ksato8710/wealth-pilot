"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailyAsset } from "@/lib/types";

export function useAssetHistory() {
  const [data, setData] = useState<DailyAsset[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/history");
      if (!res.ok) throw new Error("Failed to fetch asset history");
      const json = await res.json();
      setData(json.history);
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
