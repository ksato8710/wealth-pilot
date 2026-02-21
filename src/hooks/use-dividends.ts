"use client";

import { useState, useEffect, useCallback } from "react";
import type { DividendRecord, MonthlyDividend } from "@/lib/types";

interface DividendData {
  records: DividendRecord[];
  monthly: MonthlyDividend[];
}

export function useDividends() {
  const [data, setData] = useState<DividendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dividends");
      if (!res.ok) throw new Error("Failed to fetch dividends");
      const json = await res.json();
      setData({ records: json.records, monthly: json.monthly });
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
