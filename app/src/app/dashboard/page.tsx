"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { WidgetGrid } from "@/components/ui/widget-grid";
import { getWidgetsByIds } from "@/lib/widget-registry";
import { useAppStore } from "@/lib/store";
import { SubHeader } from "@/components/layout/sub-header";
import { EmptyDashboard } from "@/components/ui/empty-state";

export default function Dashboard() {
  const dashboardWidgets = useAppStore((s) => s.dashboardWidgets);
  const addWidget = useAppStore((s) => s.addWidget);
  const setWidgetPanelOpen = useAppStore((s) => s.setWidgetPanelOpen);
  const setDropPreviewIndex = useAppStore((s) => s.setDropPreviewIndex);
  const dropPreviewIndex = useAppStore((s) => s.dropPreviewIndex);
  const widgets = useMemo(() => getWidgetsByIds(dashboardWidgets), [dashboardWidgets]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const lastIndexRef = useRef<number | null>(null);
  const rafRef = useRef(0);

  const calcInsertIndex = useCallback((clientX: number, clientY: number): number => {
    if (!containerRef.current) return dashboardWidgets.length;

    const grid = containerRef.current.querySelector(".grid");
    if (!grid) return dashboardWidgets.length;

    // Get only the widget items (skip drop preview placeholders)
    const gridChildren = Array.from(grid.children).filter(
      (el) => {
        const htmlEl = el as HTMLElement;
        return !htmlEl.dataset.dropPreview && htmlEl.classList.contains("widget-sortable-item");
      }
    );

    if (gridChildren.length === 0) return 0;

    let closestIndex = dashboardWidgets.length;
    let closestDist = Infinity;

    for (let i = 0; i < gridChildren.length; i++) {
      const rect = gridChildren[i].getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < closestDist) {
        closestDist = dist;
        if (clientY < centerY - rect.height * 0.25 || (Math.abs(dy) < rect.height * 0.5 && clientX < centerX)) {
          closestIndex = i;
        } else {
          closestIndex = i + 1;
        }
      }
    }

    return closestIndex;
  }, [dashboardWidgets.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("widget-id")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
      // Throttle index calculation to 1 per frame to avoid lag
      const cx = e.clientX;
      const cy = e.clientY;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const index = calcInsertIndex(cx, cy);
        if (index !== lastIndexRef.current) {
          lastIndexRef.current = index;
          setDropPreviewIndex(index);
        }
      });
    }
  }, [calcInsertIndex, setDropPreviewIndex]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
      cancelAnimationFrame(rafRef.current);
      lastIndexRef.current = null;
      setIsDragOver(false);
      setDropPreviewIndex(null);
    }
  }, [setDropPreviewIndex]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);
      lastIndexRef.current = null;
      setIsDragOver(false);
      const widgetId = e.dataTransfer.getData("widget-id");
      const index = dropPreviewIndex ?? dashboardWidgets.length;
      setDropPreviewIndex(null);
      if (widgetId) {
        addWidget(widgetId, index);
        setWidgetPanelOpen(false);
      }
    },
    [addWidget, setWidgetPanelOpen, setDropPreviewIndex, dropPreviewIndex, dashboardWidgets.length]
  );

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <SubHeader />
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 rounded-[12px] p-3"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {widgets.length > 0 ? (
          <WidgetGrid widgets={widgets} storageKey="pythia-dashboard-layouts-v3" />
        ) : (
          <EmptyDashboard onAddWidgets={() => setWidgetPanelOpen(true)} />
        )}

        {/* Cursor-following shadow while dragging from panel */}
        {isDragOver && (
          <div
            className="pointer-events-none absolute z-50"
            style={{
              left: cursorPos.x - 120,
              top: cursorPos.y - 80,
              width: 240,
              height: 160,
              transition: "left 0.05s ease-out, top 0.05s ease-out",
            }}
          >
            <div
              className="h-full w-full rounded-[18px]"
              style={{
                border: "2px dashed rgba(0, 255, 133, 0.4)",
                background: "rgba(0, 255, 133, 0.06)",
                boxShadow: "0 0 32px rgba(0, 255, 133, 0.12), inset 0 0 24px rgba(0, 255, 133, 0.06)",
              }}
            />
            <div className="mt-2 text-center text-[10px] font-medium text-signal-green/70">
              Drop to add
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
