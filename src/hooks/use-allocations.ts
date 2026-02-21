"use client";

import { useState, useEffect, useCallback } from "react";
import type { AssetAllocation, SectorAllocation } from "@/lib/types";

interface AllocationData {
  assetAllocation: AssetAllocation[];
  sectorAllocation: SectorAllocation[];
}

export function useAllocations() {
  const [data, setData] = useState<AllocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio/allocation");
      if (!res.ok) throw new Error("Failed to fetch allocations");
      const json = await res.json();
      setData({
        assetAllocation: json.assetAllocation,
        sectorAllocation: json.sectorAllocation,
      });
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
