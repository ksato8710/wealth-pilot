"use client";

import { useState, useEffect, useCallback } from "react";

interface PortfolioSummary {
  totalAsset: number;
  totalCash: number;
  totalUnrealizedPL: number;
  totalDayChange: number;
  annualDividend: number;
  holdingsCount: number;
}

export function usePortfolioSummary() {
  const [data, setData] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/summary");
      if (!res.ok) throw new Error("Failed to fetch portfolio summary");
      const json = await res.json();
      setData(json);
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
