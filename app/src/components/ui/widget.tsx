"use client";

import {
  Maximize2,
  Minimize2,
  X,
  GripVertical,
  Link2,
  Unlink,
  Check,
} from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore, LINK_CHANNEL_COLORS } from "@/lib/store";

const WidgetFullscreenContext = createContext(false);
export function useWidgetFullscreen() {
  return useContext(WidgetFullscreenContext);
}

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
  const [linkSelectorOpen, setLinkSelectorOpen] = useState(false);
  const removeWidget = useAppStore((s) => s.removeWidget);
  const fullscreenWidgetId = useAppStore((s) => s.fullscreenWidgetId);
  const setFullscreenWidgetId = useAppStore((s) => s.setFullscreenWidgetId);
  const setContextMenu = useAppStore((s) => s.setContextMenu);
  const widgetLinks = useAppStore((s) => s.widgetLinks);
  const setWidgetLink = useAppStore((s) => s.setWidgetLink);

  const linkedChannel = id !== undefined ? widgetLinks[id] : undefined;

  const isFullscreen = id ? fullscreenWidgetId === id : false;

  const handleFullscreen = () => {
    if (!id) return;
    setFullscreenWidgetId(isFullscreen ? null : id);
  };

  const handleRemove = () => {
    if (!id) return;
    removeWidget(id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!id) return;
    e.preventDefault();
    setContextMenu({ widgetId: id, x: e.clientX, y: e.clientY });
  };

  const widgetContent = (
    <div
      className={`widget-wrapper group/widget relative flex h-full w-full flex-col overflow-hidden rounded-[18px] bg-bg-base-1 ${className}`}
      style={{
        "--widget-accent": accentColor || "var(--color-signal-green)",
      } as React.CSSProperties}
      onContextMenu={handleContextMenu}
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

      {/* Widget Header — entire header is drag handle */}
      <div className="widget-drag-handle relative z-[11] flex cursor-grab items-center overflow-hidden rounded-t-[inherit] px-3 py-2 active:cursor-grabbing">
        {/* Drag grip dots */}
        <div className="mr-1 flex items-center opacity-0 transition-opacity duration-200 group-hover/widget:opacity-40">
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

            {/* Link channel indicator */}
            {id && linkedChannel !== undefined && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLinkSelectorOpen(!linkSelectorOpen);
                  }}
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-125"
                  aria-label={`Linked to channel ${linkedChannel + 1}`}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: LINK_CHANNEL_COLORS[linkedChannel] }}
                  />
                </button>

                <AnimatePresence>
                  {linkSelectorOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setLinkSelectorOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 top-5 z-40 overflow-hidden rounded-[8px] bg-bg-base-2 p-2"
                        style={{ boxShadow: "inset 0 0 0 1px var(--color-divider-heavy), 0 8px 24px -4px rgba(0,0,0,0.5)" }}
                      >
                        <div className="flex items-center gap-1.5">
                          {LINK_CHANNEL_COLORS.map((color, i) => (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                setWidgetLink(id, i);
                                setLinkSelectorOpen(false);
                              }}
                              className="relative flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-125"
                              aria-label={`Link to channel ${i + 1}`}
                            >
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                              {linkedChannel === i && (
                                <Check className="absolute h-2 w-2 text-white" />
                              )}
                            </button>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWidgetLink(id, null);
                              setLinkSelectorOpen(false);
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-text-quaternary transition-colors hover:text-text-primary"
                            aria-label="Unlink"
                          >
                            <Unlink className="h-3 w-3" />
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

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
      {/* Widget Body */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );

  // Always render the widget in its grid slot.
  // When fullscreen, also render a portal overlay on top.
  return (
    <>
      {widgetContent}
      {isFullscreen &&
        typeof document !== "undefined" &&
        createPortal(
          <WidgetFullscreenContext.Provider value={true}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex flex-col bg-bg-base-0 p-4"
            >
              {widgetContent}
            </motion.div>
          </WidgetFullscreenContext.Provider>,
          document.body
        )}
    </>
  );
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
