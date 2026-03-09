"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  Pin,
  Copy,
  Link,
  X,
  Check,
  Minus,
} from "lucide-react";
import { useAppStore, LINK_CHANNEL_COLORS } from "@/lib/store";

export function WidgetContextMenu() {
  const contextMenu = useAppStore((s) => s.contextMenu);
  const setContextMenu = useAppStore((s) => s.setContextMenu);
  const widgetLinks = useAppStore((s) => s.widgetLinks);
  const setWidgetLink = useAppStore((s) => s.setWidgetLink);
  const removeWidget = useAppStore((s) => s.removeWidget);
  const fullscreenWidgetId = useAppStore((s) => s.fullscreenWidgetId);
  const setFullscreenWidgetId = useAppStore((s) => s.setFullscreenWidgetId);

  const menuRef = useRef<HTMLDivElement>(null);
  const [adjusted, setAdjusted] = useState<{ x: number; y: number } | null>(null);
  const [showLinkSub, setShowLinkSub] = useState(false);
  const [mounted, setMounted] = useState(false);

  // SSR guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close handlers
  const close = useCallback(() => {
    setContextMenu(null);
    setShowLinkSub(false);
    setAdjusted(null);
  }, [setContextMenu]);

  useEffect(() => {
    if (!contextMenu) return;

    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onScroll = () => close();

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [contextMenu, close]);

  // Viewport clamping
  useEffect(() => {
    if (!contextMenu || !menuRef.current) {
      setAdjusted(null);
      return;
    }

    const rect = menuRef.current.getBoundingClientRect();
    let { x, y } = contextMenu;

    if (x + rect.width > window.innerWidth) {
      x = window.innerWidth - rect.width - 8;
    }
    if (y + rect.height > window.innerHeight) {
      y = window.innerHeight - rect.height - 8;
    }
    if (x < 8) x = 8;
    if (y < 8) y = 8;

    setAdjusted({ x, y });
  }, [contextMenu]);

  if (!mounted) return null;

  const isFullscreen = contextMenu
    ? fullscreenWidgetId === contextMenu.widgetId
    : false;
  const currentChannel = contextMenu
    ? widgetLinks[contextMenu.widgetId]
    : undefined;

  const handleAction = (fn: () => void) => {
    fn();
    close();
  };

  const pos = adjusted ?? (contextMenu ? { x: contextMenu.x, y: contextMenu.y } : { x: 0, y: 0 });

  const itemClass =
    "flex w-full items-center gap-2 px-3 py-1.5 text-body-12 text-text-secondary hover:bg-action-translucent-hover hover:text-text-primary transition-colors duration-150 cursor-pointer";
  const dangerClass =
    "flex w-full items-center gap-2 px-3 py-1.5 text-body-12 text-action-fall hover:bg-action-fall-dim transition-colors duration-150 cursor-pointer";
  const iconClass = "h-3.5 w-3.5";

  return createPortal(
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.12 }}
          className="fixed z-[9999] bg-bg-base-2 rounded-[8px] py-1 min-w-[180px] select-none"
          style={{
            left: pos.x,
            top: pos.y,
            boxShadow:
              "inset 0 0 0 1px var(--color-divider-heavy), 0 8px 24px -4px rgba(0,0,0,0.5)",
          }}
        >
          {/* Fullscreen / Minimize */}
          <button
            className={itemClass}
            onClick={() =>
              handleAction(() =>
                setFullscreenWidgetId(isFullscreen ? null : contextMenu.widgetId)
              )
            }
          >
            {isFullscreen ? (
              <Minimize2 className={iconClass} />
            ) : (
              <Maximize2 className={iconClass} />
            )}
            {isFullscreen ? "Minimize" : "Fullscreen"}
          </button>

          {/* Collapse */}
          <button className={itemClass} onClick={() => handleAction(() => {})}>
            <Pin className={iconClass} />
            Collapse
          </button>

          {/* Duplicate */}
          <button className={itemClass} onClick={() => handleAction(() => {})}>
            <Copy className={iconClass} />
            Duplicate
          </button>

          {/* Divider */}
          <div className="mx-2 my-1 h-px bg-divider-heavy" />

          {/* Link Widget — with submenu */}
          <div
            className="relative"
            onMouseEnter={() => setShowLinkSub(true)}
            onMouseLeave={() => setShowLinkSub(false)}
          >
            <button className={itemClass}>
              <Link className={iconClass} />
              Link Widget
              <svg
                className="ml-auto h-3 w-3 text-text-quaternary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Submenu */}
            <AnimatePresence>
              {showLinkSub && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-full top-0 ml-1 bg-bg-base-2 rounded-[8px] py-1 min-w-[160px]"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px var(--color-divider-heavy), 0 8px 24px -4px rgba(0,0,0,0.5)",
                  }}
                >
                  {LINK_CHANNEL_COLORS.map((color, i) => (
                    <button
                      key={i}
                      className={itemClass}
                      onClick={() =>
                        handleAction(() =>
                          setWidgetLink(contextMenu.widgetId, i)
                        )
                      }
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      Channel {i + 1}
                      {currentChannel === i && (
                        <Check className="ml-auto h-3.5 w-3.5 text-text-primary" />
                      )}
                    </button>
                  ))}

                  {currentChannel !== undefined && (
                    <>
                      <div className="mx-2 my-1 h-px bg-divider-heavy" />
                      <button
                        className={itemClass}
                        onClick={() =>
                          handleAction(() =>
                            setWidgetLink(contextMenu.widgetId, null)
                          )
                        }
                      >
                        <Minus className={iconClass} />
                        Unlink
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="mx-2 my-1 h-px bg-divider-heavy" />

          {/* Remove Widget */}
          <button
            className={dangerClass}
            onClick={() =>
              handleAction(() => removeWidget(contextMenu.widgetId))
            }
          >
            <X className={iconClass} />
            Remove Widget
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default WidgetContextMenu;
