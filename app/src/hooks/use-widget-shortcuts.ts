"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function useWidgetShortcuts() {
  const removeWidget = useAppStore((s) => s.removeWidget);
  const fullscreenWidgetId = useAppStore((s) => s.fullscreenWidgetId);
  const setFullscreenWidgetId = useAppStore((s) => s.setFullscreenWidgetId);
  const contextMenu = useAppStore((s) => s.contextMenu);
  const setContextMenu = useAppStore((s) => s.setContextMenu);
  const toggleLayoutLock = useAppStore((s) => s.toggleLayoutLock);
  const widgetPanelOpen = useAppStore((s) => s.widgetPanelOpen);
  const setWidgetPanelOpen = useAppStore((s) => s.setWidgetPanelOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      switch (e.key) {
        case "Delete":
        case "Backspace": {
          // Remove last right-clicked widget or fullscreened widget
          const targetId = contextMenu?.widgetId ?? fullscreenWidgetId;
          if (targetId) {
            e.preventDefault();
            removeWidget(targetId);
            setContextMenu(null);
            if (fullscreenWidgetId === targetId) setFullscreenWidgetId(null);
          }
          break;
        }
        case "f":
        case "F": {
          if (e.ctrlKey || e.metaKey) return; // Don't intercept Ctrl+F browser search
          const targetId = contextMenu?.widgetId ?? fullscreenWidgetId;
          if (targetId) {
            e.preventDefault();
            setFullscreenWidgetId(fullscreenWidgetId === targetId ? null : targetId);
            setContextMenu(null);
          }
          break;
        }
        case "l":
        case "L": {
          if (e.ctrlKey || e.metaKey) return;
          e.preventDefault();
          toggleLayoutLock();
          break;
        }
        case "Escape": {
          if (contextMenu) {
            setContextMenu(null);
          } else if (fullscreenWidgetId) {
            setFullscreenWidgetId(null);
          } else if (widgetPanelOpen) {
            setWidgetPanelOpen(false);
          }
          break;
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [
    contextMenu,
    fullscreenWidgetId,
    removeWidget,
    setContextMenu,
    setFullscreenWidgetId,
    toggleLayoutLock,
    widgetPanelOpen,
    setWidgetPanelOpen,
  ]);
}
