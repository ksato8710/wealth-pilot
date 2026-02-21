"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar, SIDEBAR_WIDTH } from "@/components/layout/sidebar";

/* -------------------------------------------------------------------------- */
/*  Route → page title mapping                                                */
/* -------------------------------------------------------------------------- */

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "ダッシュボード", subtitle: "資産状況の概要" },
  "/portfolio": { title: "ポートフォリオ", subtitle: "保有資産の詳細分析" },
  "/dividends": { title: "配当金", subtitle: "配当収入の推移と予測" },
  "/tax-optimizer": { title: "税金最適化", subtitle: "節税シミュレーション" },
  "/ai-advisor": { title: "AIアドバイザー", subtitle: "AI投資アシスタント" },
  "/settings": { title: "設定", subtitle: "アカウントと接続の管理" },
};

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface AppLayoutProps {
  children: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*  AppLayout component                                                       */
/* -------------------------------------------------------------------------- */

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const currentPage = pageTitles[pathname] ?? pageTitles["/dashboard"];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content wrapper -- offset by sidebar width on desktop */}
      <div
        className="flex min-h-screen flex-col transition-[margin] duration-300 lg:ml-[260px]"
      >
        {/* ---- Header bar ---- */}
        <header
          className={cn(
            "sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between",
            "border-b border-border bg-background/80 backdrop-blur-md",
            "px-4 sm:px-6 lg:px-8"
          )}
        >
          {/* Left side: page title (with left padding on mobile for hamburger) */}
          <div className="pl-14 lg:pl-0">
            <h1 className="text-lg font-semibold text-foreground">
              {currentPage.title}
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {currentPage.subtitle}
            </p>
          </div>

          {/* Right side: actions */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button
              type="button"
              aria-label="Notifications"
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-lg",
                "text-muted-foreground transition-colors duration-200",
                "hover:bg-card hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <Bell className="h-[18px] w-[18px]" />
              {/* Unread indicator dot */}
              <span
                aria-hidden="true"
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"
              />
            </button>

            {/* User avatar */}
            <button
              type="button"
              aria-label="User menu"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                "bg-primary/15 text-xs font-semibold text-primary",
                "ring-1 ring-primary/30 transition-all duration-200",
                "hover:bg-primary/25 hover:ring-primary/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              ST
            </button>
          </div>
        </header>

        {/* ---- Page content ---- */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
