"use client";

import {
  MoreHorizontal,
  Maximize2,
  Minimize2,
  X,
  Pin,
  Copy,
  GripVertical,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";

interface WidgetProps {
  id?: string;
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  accentColor?: string;
  liveIndicator?: boolean;
}

export function Widget({
  id,
  title,
  icon,
  actions,
  children,
  className = "",
  accentColor,
  liveIndicator,
}: WidgetProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const removeWidget = useAppStore((s) => s.removeWidget);
  const fullscreenWidgetId = useAppStore((s) => s.fullscreenWidgetId);
  const setFullscreenWidgetId = useAppStore((s) => s.setFullscreenWidgetId);

  const isFullscreen = id ? fullscreenWidgetId === id : false;

  const handleFullscreen = () => {
    if (!id) return;
    setFullscreenWidgetId(isFullscreen ? null : id);
    setMenuOpen(false);
  };

  const handleRemove = () => {
    if (!id) return;
    removeWidget(id);
    setMenuOpen(false);
  };

  const handleCollapse = () => {
    setCollapsed(!collapsed);
    setMenuOpen(false);
  };

  const widgetContent = (
    <div
      className={`widget-wrapper group/widget relative flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-bg-base-1 ${className}`}
      style={{
        "--widget-accent": accentColor || "var(--color-signal-green)",
      } as React.CSSProperties}
    >
      {/* Glow border */}
      <div className="widget-glow-border rounded-[inherit]">
        <div className="glow-layer">
          <div className="glow-mask rounded-[inherit]">
            <div
              className="glow-rotate"
              style={{ "--glow-color": "var(--widget-accent)" } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Inset border */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-shadow duration-150 ease-out"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)" }}
      />

      {/* Widget Header */}
      <div className="relative z-[11] flex items-center overflow-hidden rounded-t-[inherit] px-3 py-2">
        {/* Drag handle */}
        <div className="widget-drag-handle mr-1 flex cursor-grab items-center opacity-0 transition-opacity duration-200 group-hover/widget:opacity-100 active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5 text-text-quaternary" />
        </div>

        {/* Header content */}
        <div className="min-w-0 flex-grow">
          <div className="scrollbar-hide mr-1 flex items-center gap-1 overflow-x-auto whitespace-nowrap">
            {icon && (
              <span className="flex h-5 shrink-0 items-center justify-center text-text-tertiary">
                {icon}
              </span>
            )}
            <span className="text-caption-12 shrink-0 px-1 font-semibold text-text-primary">
              {title}
            </span>

            {/* Live indicator */}
            {liveIndicator && (
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ backgroundColor: accentColor || "var(--color-signal-green)" }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: accentColor || "var(--color-signal-green)" }}
                />
              </span>
            )}

            {actions && (
              <div className="flex items-center gap-1">{actions}</div>
            )}
          </div>
        </div>

        {/* Hover-reveal actions */}
        <div className="widget-header-actions absolute right-2 top-1.5 z-20 flex items-center gap-1">
          {/* Menu with options */}
          <div className="relative">
            <WidgetAction aria-label="Widget menu" onClick={() => setMenuOpen(!menuOpen)}>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </WidgetAction>

            <AnimatePresence>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-7 z-40 w-44 overflow-hidden rounded-[8px] bg-bg-base-2 py-1"
                    style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy), 0 8px 24px -4px rgba(0,0,0,0.5)" }}
                  >
                    <MenuButton onClick={handleFullscreen}>
                      {isFullscreen ? (
                        <><Minimize2 className="h-3.5 w-3.5" /> Minimize</>
                      ) : (
                        <><Maximize2 className="h-3.5 w-3.5" /> Fullscreen</>
                      )}
                    </MenuButton>
                    <MenuButton onClick={handleCollapse}>
                      <Pin className="h-3.5 w-3.5" /> {collapsed ? "Expand" : "Collapse"}
                    </MenuButton>
                    <MenuButton onClick={() => setMenuOpen(false)}>
                      <Copy className="h-3.5 w-3.5" /> Duplicate
                    </MenuButton>
                    {id && (
                      <>
                        <div className="mx-2 my-1 h-px bg-divider-heavy" />
                        <MenuButton onClick={handleRemove} variant="danger">
                          <X className="h-3.5 w-3.5" /> Remove Widget
                        </MenuButton>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <WidgetAction aria-label="Toggle fullscreen" onClick={handleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </WidgetAction>

          {id && (
            <WidgetAction aria-label="Remove widget" onClick={handleRemove}>
              <X className="h-3.5 w-3.5" />
            </WidgetAction>
          )}
        </div>
      </div>

      {/* Widget Body */}
      {!collapsed && (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      )}
    </div>
  );

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex flex-col bg-bg-base-0 p-4"
      >
        {widgetContent}
      </motion.div>
    );
  }

  return widgetContent;
}

function WidgetAction({
  children,
  onClick,
  ...props
}: { children: ReactNode; onClick?: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="flex h-5 w-5 items-center justify-center rounded-full bg-action-secondary text-text-primary transition-all duration-150 hover:bg-action-secondary-hover hover:scale-110 active:scale-95 active:bg-action-secondary-active"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

function MenuButton({
  children,
  onClick,
  variant = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-body-12 transition-colors duration-150 ${
        variant === "danger"
          ? "text-action-fall hover:bg-action-fall-dim"
          : "text-text-secondary hover:bg-action-translucent-hover hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

export function WidgetPill({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-5 items-center gap-1 rounded-[4px] px-2 text-body-12 transition-colors duration-150 ${
        active
          ? "bg-action-translucent-hover text-text-primary"
          : "bg-action-secondary text-text-secondary hover:bg-action-secondary-hover hover:text-text-primary active:bg-action-secondary-active"
      }`}
    >
      {children}
    </button>
  );
}
