"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  PieChart,
  Coins,
  Calculator,
  Bot,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface NavItem {
  /** Display label (Japanese) */
  label: string;
  /** Small English subtitle rendered below the label */
  subtitle: string;
  /** Route path */
  href: string;
  /** Lucide icon component */
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/* -------------------------------------------------------------------------- */
/*  Navigation data                                                           */
/* -------------------------------------------------------------------------- */

const mainNavItems: NavItem[] = [
  {
    label: "ダッシュボード",
    subtitle: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "ポートフォリオ",
    subtitle: "Portfolio",
    href: "/portfolio",
    icon: PieChart,
  },
  {
    label: "配当金",
    subtitle: "Dividends",
    href: "/dividends",
    icon: Coins,
  },
  {
    label: "税金最適化",
    subtitle: "Tax Optimizer",
    href: "/tax-optimizer",
    icon: Calculator,
  },
  {
    label: "AIアドバイザー",
    subtitle: "AI Advisor",
    href: "/ai-advisor",
    icon: Bot,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "設定",
    subtitle: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

/* -------------------------------------------------------------------------- */
/*  Sidebar width constant (shared with app-layout)                           */
/* -------------------------------------------------------------------------- */

export const SIDEBAR_WIDTH = 260;

/* -------------------------------------------------------------------------- */
/*  NavLink sub-component                                                     */
/* -------------------------------------------------------------------------- */

interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

function NavLink({ item, isActive, onClick }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
        isActive
          ? "bg-sidebar-hover text-white"
          : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-white"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-primary"
        />
      )}

      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
          isActive
            ? "text-primary"
            : "text-sidebar-foreground group-hover:text-white"
        )}
      />

      <span className="flex flex-col leading-tight">
        <span className="text-[13px] font-medium">{item.label}</span>
        <span className="text-[10px] tracking-wide text-muted-foreground">
          {item.subtitle}
        </span>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sidebar component                                                         */
/* -------------------------------------------------------------------------- */

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  /** Close mobile sidebar on route change */
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /** Lock body scroll when mobile sidebar is open */
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard" || pathname.startsWith("/dashboard/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /* -------------------------------- Sidebar -------------------------------- */

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <Compass className="h-6 w-6 text-primary" />
        <span className="gradient-text text-lg font-bold tracking-tight">
          WealthPilot
        </span>
      </div>

      {/* Main navigation */}
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3 pt-2">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Separator */}
      <div
        aria-hidden="true"
        className="mx-4 border-t border-border"
      />

      {/* Bottom navigation */}
      <nav aria-label="Secondary navigation" className="space-y-1 px-3 py-4">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* ---- Mobile hamburger trigger ---- */}
      <button
        type="button"
        aria-label="Toggle navigation menu"
        onClick={() => setMobileOpen((prev) => !prev)}
        className={cn(
          "fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg",
          "bg-card text-sidebar-foreground hover:text-white",
          "border border-border transition-colors duration-200",
          "lg:hidden"
        )}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* ---- Mobile overlay ---- */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ---- Mobile sidebar drawer ---- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-sidebar",
          "border-r border-border",
          "transition-transform duration-300 ease-in-out",
          "lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* ---- Desktop sidebar (always visible) ---- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-sidebar",
          "border-r border-border",
          "lg:flex"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
