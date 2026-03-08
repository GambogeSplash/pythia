"use client";

import {
  MoreHorizontal,
  Maximize2,
  Minimize2,
  X,
  Pin,
  Copy,
} from "lucide-react";
import { useState, useCallback, useRef, type ReactNode } from "react";
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
  const widgetSpans = useAppStore((s) => s.widgetSpans);
  const setWidgetSpan = useAppStore((s) => s.setWidgetSpan);
  const currentSpan = id ? (widgetSpans[id] || 1) : 1;

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
                        <div className="px-3 py-1.5">
                          <span className="text-[10px] font-medium uppercase text-text-quaternary">Width</span>
                          <div className="mt-1.5 flex gap-1">
                            {[1, 2, 3, 4].map((span) => (
                              <button
                                key={span}
                                onClick={() => { setWidgetSpan(id, span); setMenuOpen(false); }}
                                className={`flex h-6 flex-1 items-center justify-center rounded-[4px] text-[10px] font-medium transition-colors ${
                                  currentSpan === span
                                    ? "bg-signal-green/15 text-signal-green"
                                    : "bg-bg-base-3 text-text-secondary hover:bg-action-translucent-hover hover:text-text-primary"
                                }`}
                              >
                                {span}x
                              </button>
                            ))}
                          </div>
                        </div>
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

      {/* Resize handles — all edges + corners */}
      {id && !isFullscreen && (
        <ResizeHandles
          widgetId={id}
          currentSpan={currentSpan}
        />
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

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const EDGE_CONFIG: Record<Edge, { cursor: string; cls: string; barCls: string }> = {
  n:  { cursor: "ns-resize",   cls: "top-0 left-4 right-4 h-2",         barCls: "w-10 h-[3px] mx-auto" },
  s:  { cursor: "ns-resize",   cls: "bottom-0 left-4 right-4 h-2",      barCls: "w-10 h-[3px] mx-auto" },
  e:  { cursor: "ew-resize",   cls: "right-0 top-4 bottom-4 w-2",       barCls: "h-10 w-[3px] my-auto" },
  w:  { cursor: "ew-resize",   cls: "left-0 top-4 bottom-4 w-2",        barCls: "h-10 w-[3px] my-auto" },
  ne: { cursor: "nesw-resize", cls: "top-0 right-0 h-4 w-4",            barCls: "h-[6px] w-[6px] rounded-full" },
  nw: { cursor: "nesw-resize", cls: "top-0 left-0 h-4 w-4",             barCls: "h-[6px] w-[6px] rounded-full" },
  se: { cursor: "nwse-resize", cls: "bottom-0 right-0 h-4 w-4",         barCls: "h-[6px] w-[6px] rounded-full" },
  sw: { cursor: "nwse-resize", cls: "bottom-0 left-0 h-4 w-4",          barCls: "h-[6px] w-[6px] rounded-full" },
};

function ResizeHandles({
  widgetId,
  currentSpan,
}: {
  widgetId: string;
  currentSpan: number;
}) {
  const setWidgetSpan = useAppStore((s) => s.setWidgetSpan);
  const setWidgetHeight = useAppStore((s) => s.setWidgetHeight);
  const widgetHeights = useAppStore((s) => s.widgetHeights);
  const [activeEdge, setActiveEdge] = useState<Edge | null>(null);

  const handlePointerDown = useCallback(
    (edge: Edge, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;

      // Walk up to the sortable container (motion.div > .widget-grid-item > .widget-wrapper)
      const wrapper = (e.target as HTMLElement).closest(".widget-wrapper");
      const gridItem = wrapper?.parentElement; // .widget-grid-item
      const sortableEl = gridItem?.parentElement; // motion.div (SortableItem)
      if (!sortableEl) return;

      const startRect = sortableEl.getBoundingClientRect();
      const startWidth = startRect.width;
      const startHeight = startRect.height;

      // Find the grid to calculate column width for snapping
      const grid = sortableEl.parentElement;
      const gridWidth = grid ? grid.getBoundingClientRect().width : startWidth * 3;
      const gap = 12; // gap-3 = 12px
      const maxCols = 3;

      setActiveEdge(edge);
      document.body.style.cursor = EDGE_CONFIG[edge].cursor;
      document.body.style.userSelect = "none";

      // Disable Framer layout animation during drag
      sortableEl.style.transition = "none";

      const affectsX = edge.includes("e") || edge.includes("w");
      const affectsY = edge === "n" || edge === "s" || edge.includes("n") || edge.includes("s");
      const invertX = edge.includes("w");
      const invertY = edge.includes("n");

      let latestWidth = startWidth;
      let latestHeight = startHeight;
      let rafId = 0;

      const applyStyles = () => {
        if (affectsY) {
          sortableEl.style.height = `${latestHeight}px`;
        }
        if (affectsX) {
          // Temporarily override grid column to allow free-width
          sortableEl.style.gridColumn = `span ${maxCols}`;
          sortableEl.style.width = `${latestWidth}px`;
          sortableEl.style.maxWidth = `${latestWidth}px`;
        }
      };

      const handleMove = (ev: PointerEvent) => {
        if (affectsX) {
          const dx = (ev.clientX - startX) * (invertX ? -1 : 1);
          // Clamp between 1 column width and full grid width
          const colWidth = (gridWidth - gap * (maxCols - 1)) / maxCols;
          const minW = colWidth;
          const maxW = gridWidth;
          latestWidth = Math.max(minW, Math.min(maxW, startWidth + dx));
        }
        if (affectsY) {
          const dy = (ev.clientY - startY) * (invertY ? -1 : 1);
          latestHeight = Math.max(150, startHeight + dy);
        }
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(applyStyles);
      };

      const handleUp = () => {
        cancelAnimationFrame(rafId);
        setActiveEdge(null);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";

        // Clear all inline overrides — let React take back control
        sortableEl.style.transition = "";
        sortableEl.style.width = "";
        sortableEl.style.maxWidth = "";

        // Commit final values to store
        if (affectsX) {
          const colWidth = (gridWidth - gap * (maxCols - 1)) / maxCols;
          const newSpan = Math.max(1, Math.min(maxCols, Math.round(latestWidth / (colWidth + gap))));
          sortableEl.style.gridColumn = "";
          setWidgetSpan(widgetId, newSpan);
        }
        if (affectsY) {
          setWidgetHeight(widgetId, Math.round(latestHeight));
        }

        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [widgetId, currentSpan, widgetHeights, setWidgetSpan, setWidgetHeight]
  );

  return (
    <>
      {(Object.keys(EDGE_CONFIG) as Edge[]).map((edge) => {
        const cfg = EDGE_CONFIG[edge];
        const isActive = activeEdge === edge;
        const isCorner = edge.length === 2;
        return (
          <div
            key={edge}
            onPointerDown={(e) => handlePointerDown(edge, e)}
            className={`absolute z-20 flex items-center justify-center opacity-0 transition-opacity duration-300 ease-out group-hover/widget:opacity-100 ${cfg.cls}`}
            style={{ cursor: cfg.cursor }}
          >
            <div
              className={`rounded-full transition-all duration-300 ease-out ${cfg.barCls} ${
                isActive
                  ? "bg-signal-green shadow-[0_0_12px_rgba(0,255,133,0.5)] scale-125"
                  : isCorner
                    ? "bg-signal-green/40 hover:bg-signal-green/80 hover:scale-150 hover:shadow-[0_0_8px_rgba(0,255,133,0.4)]"
                    : "bg-text-quaternary/30 hover:bg-signal-green/60 hover:shadow-[0_0_8px_rgba(0,255,133,0.3)]"
              }`}
            />
          </div>
        );
      })}
    </>
  );
}
