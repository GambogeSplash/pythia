"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Settings,
  Bell,
  Moon,
  Sun,
  Wallet,
  LogOut,
  User,
  Copy,
  ExternalLink,
  Check,
  ChevronRight,
  Shield,
  Palette,
  Monitor,
  Globe,
  HelpCircle,
  MessageSquare,
  Zap,
  Users,
  TrendingUp,
  AlertTriangle,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore, type Notification } from "@/lib/store";
import { useSession } from "@/hooks/use-session";

const navItems = [
  { label: "DASHBOARD", href: "/dashboard" },
  { label: "TRADE", href: "/dashboard/trade" },
  { label: "SEARCH", href: "/dashboard/search" },
  { label: "BOTS", href: "/dashboard/bots" },
  { label: "ALERT", href: "/dashboard/alert" },
  { label: "VENUES", href: "/dashboard/venues" },
  { label: "PORTFOLIO", href: "/dashboard/portfolio" },
  { label: "EARN YIELDS", href: "/dashboard/earn", badge: "NEW" },
];

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  whale: <Users className="h-3.5 w-3.5 text-signal-blue" />,
  alert: <Zap className="h-3.5 w-3.5 text-signal-amber" />,
  trade: <TrendingUp className="h-3.5 w-3.5 text-signal-green" />,
  system: <AlertTriangle className="h-3.5 w-3.5 text-text-quaternary" />,
};


export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setCommandPaletteOpen } = useAppStore();
  const activeDropdown = useAppStore((s) => s.activeDropdown);
  const setActiveDropdown = useAppStore((s) => s.setActiveDropdown);
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllRead);
  const unreadCount = useAppStore((s) => s.unreadCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSession();
  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const displayInitial = displayName.charAt(0).toUpperCase();

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const closeAll = () => setActiveDropdown(null);

  return (
    <>
      {/* Click-away backdrop */}
      {activeDropdown && (
        <div className="fixed inset-0 z-20" onClick={closeAll} />
      )}

      <header
        className="sticky top-0 z-30 flex h-12 w-full items-center overflow-visible bg-bg-base-0 px-3 sm:px-4"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
      >
        <div className="grid h-full w-full grid-cols-[1fr_auto] items-center gap-6 sm:grid-cols-[1fr_2fr_1fr]">
          {/* Left: Logo + Nav */}
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-2 flex shrink-0 items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 114 114" fill="none" className="text-signal-green">
                <path fillRule="evenodd" clipRule="evenodd" d="M45.9289 9.96148C55.0664 -1.96558 85.2671 -5.77327 98.2106 13.2613C116.221 24.1138 114.555 42.8088 111.368 52.5276C110.876 54.0275 109.241 54.7568 107.825 54.0598C103.402 51.883 96.7785 47.2356 93.1348 40.9245C88.6803 33.2091 87.8948 23.9202 88.0589 20.3671C86.5359 18.3365 81.9673 13.0075 70.0394 12.4999C51.7663 12.5 48.1861 26.8528 51.0048 47.5236C53.0811 62.7512 37.8075 67.3197 32.4798 66.812C29.9513 66.5711 22.8341 66.3039 22.3265 56.6583C21.9205 48.9419 27.7401 45.66 30.7007 44.9837C23.5945 48.7906 28.0625 63.7991 38.0613 56.6583C45.9289 51.0394 31.3024 29.0533 45.9289 9.96148ZM102.525 32.5497C100.563 32.5498 98.972 34.1405 98.972 36.1029C98.972 38.0652 100.563 39.6559 102.525 39.656C104.488 39.656 106.078 38.0652 106.078 36.1029C106.078 34.1405 104.487 32.5497 102.525 32.5497Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M103.795 66.2236C109.555 80.1005 97.7521 108.159 74.7959 109.851C56.3921 120.022 41.0351 109.231 34.2117 101.612C33.1587 100.436 33.3447 98.6557 34.6564 97.7777C38.753 95.0359 46.0894 91.6236 53.3769 91.6236C62.2856 91.6236 70.7224 95.5875 73.7176 97.5062C76.2373 97.2026 83.1371 95.9112 89.5409 85.8347C98.6775 70.0097 88.0377 59.7327 68.7268 51.8384C54.5012 46.0228 58.1816 30.5113 61.2851 26.151C62.7579 24.0819 66.5479 18.0517 75.1551 22.4349C82.0407 25.9416 81.9731 32.6224 81.0785 35.5245C81.3347 27.4669 66.103 23.832 67.2877 36.0617C68.2202 45.6845 94.5738 44.0108 103.795 66.2236ZM55.9344 103.943C56.9156 102.244 56.3333 100.071 54.6339 99.0896C52.9344 98.1085 50.7614 98.6907 49.7802 100.39C48.7991 102.09 49.3813 104.263 51.0807 105.244C52.7801 106.225 54.9532 105.643 55.9344 103.943Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M26.1369 88.2061C11.239 86.2563 -7.15882 62.0056 2.85378 41.2788C3.24708 20.2551 20.2707 12.3509 30.2808 10.2512C31.8257 9.92728 33.2749 10.9786 33.3794 12.5536C33.7055 17.4724 32.9925 25.532 29.3487 31.8431C24.8943 39.5583 17.2431 44.8828 14.0839 46.5174C13.0869 48.8514 10.7554 55.4725 16.28 66.0565C25.4166 81.8814 39.6367 77.8057 56.1287 65.0292C68.2781 55.6172 79.8713 66.5603 82.0955 71.4281C83.1511 73.7383 86.4782 80.0357 78.3787 85.298C71.8992 89.5077 66.1472 86.1088 64.0811 83.883C70.9311 88.1336 81.6948 76.7601 70.5113 71.6713C61.7115 67.6671 49.9842 91.3271 26.1369 88.2061ZM17.4008 27.8982C18.382 29.5975 20.5551 30.1798 22.2544 29.1987C23.9538 28.2175 24.5361 26.0444 23.555 24.345C22.5738 22.6456 20.4008 22.0633 18.7013 23.0445C17.0019 24.0257 16.4196 26.1987 17.4008 27.8982Z" fill="currentColor" />
              </svg>
              <span className="text-[15px] font-bold tracking-tight text-text-primary">
                PYTHIA
              </span>
            </Link>

            {/* mobile hamburger */}
            <button
              className="sm:hidden flex items-center justify-center p-1 text-text-secondary hover:text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex h-6 items-center overflow-hidden whitespace-nowrap rounded-[4px] px-2 pb-px text-body-12 font-semibold tracking-wide outline outline-1 -outline-offset-1 transition-colors duration-150 ${
                      isActive
                        ? "text-text-primary outline-divider-heavy"
                        : "text-text-secondary outline-transparent hover:bg-action-translucent-hover hover:text-text-primary active:bg-action-translucent-active"
                    }`}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 rounded-[4px] bg-action-brand px-1.5 py-0.5 text-[9px] font-bold text-bg-base-0">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-signal-green" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* mobile menu overlay */}
            {mobileMenuOpen && (
              <div className="absolute top-full left-0 z-40 w-full bg-bg-base-0 shadow-md sm:hidden">
                <div className="flex flex-col">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="px-4 py-2 text-body-12 text-text-primary hover:bg-bg-base-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center */}
          <div className="hidden items-center justify-center sm:flex" />

          {/* Right: Actions */}
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1">
              {/* Search — opens command palette */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex h-6 max-w-[20rem] cursor-pointer items-center gap-2 overflow-hidden rounded-[4px] bg-bg-base-2 px-2 outline outline-1 -outline-offset-1 outline-divider-heavy transition-colors duration-150 hover:bg-bg-base-3 hover:outline-divider-medium"
              >
                <Search className="h-3.5 w-3.5 shrink-0 text-text-quaternary" />
                <span className="truncate text-body-12 text-text-quaternary">
                  Search markets, traders
                </span>
                <kbd className="ml-auto shrink-0 rounded-[4px] border border-divider-heavy bg-bg-base-1 px-1.5 py-0.5 font-mono text-[10px] text-text-quaternary">
                  /
                </kbd>
              </button>

              <div className="mx-1 h-3 w-px bg-divider-medium" />

              {/* Notifications */}
              <div className="relative">
                <NavIconButton
                  aria-label="Notifications"
                  onClick={() => toggleDropdown("notifications")}
                  active={activeDropdown === "notifications"}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount() > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-signal-red px-1 text-[8px] font-bold text-white">
                      {unreadCount()}
                    </span>
                  )}
                </NavIconButton>

                <AnimatePresence>
                  {activeDropdown === "notifications" && (
                    <DropdownPanel width="w-80" align="right">
                      <div className="flex items-center justify-between px-3 py-2" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
                        <span className="text-body-12 font-semibold text-text-primary">Notifications</span>
                        <button
                          onClick={markAllRead}
                          className="text-[10px] font-medium text-signal-green transition-colors hover:text-signal-green/80"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="scrollbar-hide max-h-80 overflow-y-auto">
                        {notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-action-translucent-hover ${
                              !n.read ? "bg-signal-green/[0.03]" : ""
                            }`}
                            style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
                          >
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-base-3">
                              {NOTIFICATION_ICONS[n.type]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-body-12 font-medium text-text-primary">{n.title}</span>
                                {!n.read && (
                                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal-green" />
                                )}
                              </div>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{n.message}</p>
                              <span className="mt-0.5 text-numbers-10 text-text-quaternary">{n.time}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="px-3 py-2" style={{ boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)" }}>
                        <Link
                          href="/dashboard/alert"
                          onClick={closeAll}
                          className="flex h-7 w-full items-center justify-center rounded-[6px] bg-action-translucent text-body-12 font-medium text-text-secondary transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
                        >
                          View All Alerts
                        </Link>
                      </div>
                    </DropdownPanel>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme */}
              <div className="relative">
                <NavIconButton
                  aria-label="Theme"
                  onClick={() => toggleDropdown("theme")}
                  active={activeDropdown === "theme"}
                >
                  <Moon className="h-4 w-4" />
                </NavIconButton>

                <AnimatePresence>
                  {activeDropdown === "theme" && (
                    <DropdownPanel width="w-48" align="right">
                      <div className="px-3 py-1.5 text-[9px] font-medium uppercase tracking-widest text-text-quaternary">
                        Appearance
                      </div>
                      {[
                        { icon: <Moon className="h-3.5 w-3.5" />, label: "Dark", active: true },
                        { icon: <Sun className="h-3.5 w-3.5" />, label: "Light", active: false, disabled: true },
                        { icon: <Monitor className="h-3.5 w-3.5" />, label: "System", active: false, disabled: true },
                      ].map((item) => (
                        <button
                          key={item.label}
                          disabled={item.disabled}
                          className={`flex w-full items-center gap-2.5 px-3 py-2 text-body-12 transition-colors duration-150 ${
                            item.active
                              ? "text-text-primary"
                              : item.disabled
                                ? "cursor-not-allowed text-text-muted"
                                : "text-text-secondary hover:bg-action-translucent-hover hover:text-text-primary"
                          }`}
                        >
                          {item.icon}
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.active && <Check className="h-3.5 w-3.5 text-signal-green" />}
                          {item.disabled && (
                            <span className="rounded bg-bg-base-3 px-1 text-[8px] font-bold text-text-muted">SOON</span>
                          )}
                        </button>
                      ))}
                    </DropdownPanel>
                  )}
                </AnimatePresence>
              </div>

              {/* Settings */}
              <div className="relative hidden sm:block">
                <NavIconButton
                  aria-label="Settings"
                  onClick={() => toggleDropdown("settings")}
                  active={activeDropdown === "settings"}
                >
                  <Settings className="h-4 w-4" />
                </NavIconButton>

                <AnimatePresence>
                  {activeDropdown === "settings" && (
                    <DropdownPanel width="w-52" align="right">
                      <div className="px-3 py-1.5 text-[9px] font-medium uppercase tracking-widest text-text-quaternary">
                        Settings
                      </div>
                      {[
                        { icon: <Palette className="h-3.5 w-3.5" />, label: "Layout & Widgets" },
                        { icon: <Bell className="h-3.5 w-3.5" />, label: "Notifications" },
                        { icon: <Shield className="h-3.5 w-3.5" />, label: "Security" },
                        { icon: <Globe className="h-3.5 w-3.5" />, label: "API Keys" },
                        { icon: <Zap className="h-3.5 w-3.5" />, label: "Bot Settings" },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={closeAll}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-body-12 text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary"
                        >
                          {item.icon}
                          <span className="flex-1 text-left">{item.label}</span>
                          <ChevronRight className="h-3 w-3 text-text-muted" />
                        </button>
                      ))}
                      <div className="mx-2 my-1 h-px bg-divider-heavy" />
                      <button
                        onClick={closeAll}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-body-12 text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span className="flex-1 text-left">Help & Support</span>
                      </button>
                      <button
                        onClick={closeAll}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-body-12 text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="flex-1 text-left">Feedback</span>
                      </button>
                    </DropdownPanel>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile / Sign In */}
              {isAuthenticated ? (
                <>
                  {/* Profile */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown("profile")}
                      className={`relative flex h-6 items-center gap-1.5 rounded-full px-1 text-text-primary transition-colors duration-150 hover:bg-action-secondary-hover active:bg-action-translucent-active ${
                        activeDropdown === "profile" ? "bg-action-secondary-hover" : ""
                      }`}
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full font-mono text-[8px] font-medium leading-none text-bg-base-0" style={{ background: "linear-gradient(135deg, #00FF85, #4DA6FF)" }}>
                        {displayInitial}
                      </div>
                    </button>

                    <AnimatePresence>
                      {activeDropdown === "profile" && (
                        <DropdownPanel width="w-56" align="right">
                          {/* Profile header */}
                          <div className="px-3 py-3" style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}>
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-bg-base-0" style={{ background: "linear-gradient(135deg, #00FF85, #4DA6FF)" }}>
                                {displayInitial}
                              </div>
                              <div>
                                <div className="text-body-12 font-semibold text-text-primary">{displayName}</div>
                                {user?.email && <div className="text-[10px] text-text-quaternary">{user.email}</div>}
                              </div>
                            </div>
                          </div>

                          <div className="py-1">
                            <ProfileMenuItem icon={<User className="h-3.5 w-3.5" />} label="My Profile" onClick={() => { closeAll(); router.push("/dashboard/portfolio"); }} />
                            <ProfileMenuItem icon={<Wallet className="h-3.5 w-3.5" />} label="Portfolio" onClick={() => { closeAll(); router.push("/dashboard"); }} />
                            <ProfileMenuItem icon={<TrendingUp className="h-3.5 w-3.5" />} label="Trade History" onClick={closeAll} />
                            <ProfileMenuItem icon={<Settings className="h-3.5 w-3.5" />} label="Settings" onClick={closeAll} />
                          </div>

                          <div className="mx-2 my-1 h-px bg-divider-heavy" />

                          <div className="py-1">
                            <button
                              onClick={closeAll}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-body-12 text-action-fall transition-colors duration-150 hover:bg-action-fall-dim"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                              Sign Out
                            </button>
                          </div>
                        </DropdownPanel>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex h-7 items-center gap-1.5 whitespace-nowrap rounded-[4px] bg-action-translucent px-3 text-body-12 font-medium text-text-secondary outline outline-1 -outline-offset-1 outline-divider-heavy transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
                >
                  <User className="h-3.5 w-3.5" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

/* ── Shared Components ── */

function NavIconButton({
  children,
  className = "",
  active,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`group relative flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-action-secondary-hover hover:text-text-primary active:bg-action-secondary-active ${
        active ? "bg-action-secondary-hover text-text-primary" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownPanel({
  children,
  width,
  align = "right",
}: {
  children: React.ReactNode;
  width: string;
  align?: "left" | "right";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`absolute top-9 z-50 ${align === "right" ? "right-0" : "left-0"} ${width} overflow-hidden rounded-[10px] bg-bg-base-2`}
      style={{
        boxShadow: "inset 0 0 0 1px var(--color-divider-heavy), 0 12px 32px -4px rgba(0,0,0,0.5)",
      }}
    >
      {children}
    </motion.div>
  );
}

function ProfileMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-body-12 text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className="h-3 w-3 text-text-muted" />
    </button>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex h-4 w-4 items-center justify-center rounded text-text-muted transition-colors hover:text-text-secondary"
    >
      {copied ? (
        <Check className="h-3 w-3 text-signal-green" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}
