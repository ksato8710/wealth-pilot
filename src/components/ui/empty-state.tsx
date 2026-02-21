"use client";

import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-[#27272a] p-3 mb-4">
        {icon ?? <Inbox className="h-6 w-6 text-[#a1a1aa]" />}
      </div>
      <h3 className="text-sm font-medium text-[#fafafa] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#a1a1aa] max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
