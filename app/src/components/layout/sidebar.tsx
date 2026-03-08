"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CandlestickChart, Globe,
  Grid3X3, Trophy, AlertTriangle, TrendingUp,
  Bot, Bell, Wallet, CalendarDays,
  ChevronLeft, ChevronRight, Settings,
} from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const mainItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Trade", href: "/dashboard/trade", icon: <CandlestickChart className="h-4 w-4" /> },
  { label: "Search", href: "/dashboard/search", icon: <Globe className="h-4 w-4" /> },
];

const analyticsItems: NavItem[] = [
  { label: "Showcase", href: "/dashboard/showcase", icon: <Grid3X3 className="h-4 w-4" /> },
  { label: "Leaderboard", href: "/dashboard/markets", icon: <Trophy className="h-4 w-4" /> },
  { label: "Anomalies", href: "/dashboard/alert", icon: <AlertTriangle className="h-4 w-4" /> },
  { label: "Trending", href: "/dashboard/search", icon: <TrendingUp className="h-4 w-4" /> },
];

const toolItems: NavItem[] = [
  { label: "Bots", href: "/dashboard/bots", icon: <Bot className="h-4 w-4" /> },
  { label: "Alerts", href: "/dashboard/alert", icon: <Bell className="h-4 w-4" /> },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: <Wallet className="h-4 w-4" /> },
  { label: "Earn", href: "/dashboard/earn", icon: <Trophy className="h-4 w-4" /> },
  { label: "Venues", href: "/dashboard/venues", icon: <CalendarDays className="h-4 w-4" /> },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const renderSection = (title: string, items: NavItem[]) => (
    <div className="mb-2">
      {!collapsed && (
        <div className="px-3 pb-1 pt-3 text-[9px] font-medium uppercase tracking-widest text-text-quaternary">
          {title}
        </div>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-2.5 px-3 py-[7px] text-body-12 transition-colors duration-150 ${
              isActive
                ? "bg-action-translucent-hover text-signal-green"
                : "text-text-secondary hover:bg-action-translucent-hover hover:text-text-primary active:bg-action-translucent-active"
            } ${collapsed ? "justify-center" : ""}`}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full bg-signal-green" />
            )}
            <span className={isActive ? "text-signal-green" : "text-text-tertiary group-hover:text-text-primary"}>
              {item.icon}
            </span>
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside
      className={`flex flex-shrink-0 flex-col bg-bg-base-1 transition-all duration-200 ease-in-out ${
        collapsed ? "w-12" : "w-48"
      }`}
      style={{
        boxShadow: "inset -1px 0 0 0 var(--color-divider-heavy)",
      }}
    >
      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-10 items-center justify-center text-text-quaternary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary"
        style={{
          boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)",
        }}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Nav sections */}
      <nav className="scrollbar-hide flex-1 overflow-y-auto py-2">
        {renderSection("MAIN", mainItems)}
        {renderSection("ANALYTICS", analyticsItems)}
        {renderSection("TOOLS", toolItems)}
      </nav>

      {/* Bottom */}
      <div className="p-2" style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}>
        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-2.5 rounded-[4px] px-2 py-1.5 text-body-12 transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary ${
            pathname === "/dashboard/settings" ? "text-signal-green" : "text-text-secondary"
          } ${collapsed ? "justify-center" : ""}`}
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
