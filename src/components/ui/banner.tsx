"use client";

import { AlertTriangle, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerProps {
  variant: "warning" | "info" | "error";
  children: React.ReactNode;
  onDismiss?: () => void;
}

const variantStyles = {
  warning: {
    container: "border-[#f59e0b]/30 bg-[#f59e0b]/5 text-[#f59e0b]",
    icon: AlertTriangle,
  },
  info: {
    container: "border-[#6366f1]/30 bg-[#6366f1]/5 text-[#818cf8]",
    icon: Info,
  },
  error: {
    container: "border-[#ef4444]/30 bg-[#ef4444]/5 text-[#ef4444]",
    icon: XCircle,
  },
} as const;

export function Banner({ variant, children, onDismiss }: BannerProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm backdrop-blur-sm",
        styles.container
      )}
      role="alert"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
