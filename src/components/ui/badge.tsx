import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "profit" | "loss" | "neutral" | "outline" | "warning" | "crypto";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        {
          "bg-[#6366f1]/10 text-[#818cf8]": variant === "default",
          "bg-[#10b981]/10 text-[#10b981]": variant === "profit",
          "bg-[#ef4444]/10 text-[#ef4444]": variant === "loss",
          "bg-[#27272a] text-[#a1a1aa]": variant === "neutral",
          "border border-[#27272a] text-[#a1a1aa]": variant === "outline",
          "bg-[#f59e0b]/10 text-[#f59e0b]": variant === "warning",
          "bg-[#F0B90B]/10 text-[#F0B90B]": variant === "crypto",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
