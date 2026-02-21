"use client";

import { useState, useEffect, useCallback } from "react";
import type { Holding } from "@/lib/types";

export function useHoldings() {
  const [data, setData] = useState<Holding[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/holdings");
      if (!res.ok) throw new Error("Failed to fetch holdings");
      const json = await res.json();
      setData(json.holdings);
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
