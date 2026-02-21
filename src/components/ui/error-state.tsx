"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ message, onRetry, compact = false }: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#ef4444]">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-1 underline underline-offset-2 hover:text-[#f87171] transition-colors"
          >
            再試行
          </button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-[#ef4444]/10 p-3 mb-4">
          <AlertCircle className="h-6 w-6 text-[#ef4444]" />
        </div>
        <p className="text-sm text-[#a1a1aa] mb-4">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            再試行
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
