"use client";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-white">
      <div>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
