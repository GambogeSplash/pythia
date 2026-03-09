"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ResponsiveGridLayout,
  verticalCompactor,
  type LayoutItem,
  type Layout,
  type ResponsiveLayouts,
} from "react-grid-layout";
import { useAppStore } from "@/lib/store";
import { ALL_WIDGETS } from "@/lib/widget-registry";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

export interface WidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType;
  defaultLayout: { w: number; h: number; minW?: number; minH?: number };
}

interface WidgetGridProps {
  widgets: WidgetConfig[];
  storageKey?: string;
}

/* ── Default layout generator ── */

function generateDefaultLayouts(widgets: WidgetConfig[]): Record<string, LayoutItem[]> {
  const lgItems: LayoutItem[] = [];
  let x = 0;
  let y = 0;
  let rowMaxH = 0;

  for (const w of widgets) {
    const colW = Math.min(w.defaultLayout.w, 12);
    const rowH = w.defaultLayout.h;
    const minW = w.defaultLayout.minW ?? 3;
    const minH = w.defaultLayout.minH ?? 2;

    if (x + colW > 12) {
      x = 0;
      y += rowMaxH;
      rowMaxH = 0;
    }

    lgItems.push({ i: w.id, x, y, w: colW, h: rowH, minW, minH });
    rowMaxH = Math.max(rowMaxH, rowH);
    x += colW;
  }

  const mdItems: LayoutItem[] = widgets.map((w, i) => ({
    i: w.id,
    x: (i % 2) * 5,
    y: Math.floor(i / 2) * w.defaultLayout.h,
    w: 5,
    h: w.defaultLayout.h,
    minW: 3,
    minH: w.defaultLayout.minH ?? 2,
  }));

  const smItems: LayoutItem[] = widgets.map((w, i) => ({
    i: w.id,
    x: 0,
    y: i * w.defaultLayout.h,
    w: 6,
    h: w.defaultLayout.h,
    minW: 3,
    minH: w.defaultLayout.minH ?? 2,
  }));

  return { lg: lgItems, md: mdItems, sm: smItems };
}

/* ── Persistence ── */

type StoredLayouts = Record<string, LayoutItem[]>;

function loadLayouts(key: string): StoredLayouts | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    return JSON.parse(saved) as StoredLayouts;
  } catch {
    return null;
  }
}

function saveLayouts(key: string, layouts: StoredLayouts) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(layouts));
  } catch {}
}

/* ── Build initial layouts for widget set ── */
function buildLayouts(storageKey: string, widgets: WidgetConfig[]): StoredLayouts {
  const saved = loadLayouts(storageKey);
  if (!saved) return generateDefaultLayouts(widgets);

  const widgetIds = new Set(widgets.map((w) => w.id));
  const existingIds = new Set(saved.lg?.map((l) => l.i) ?? []);
  const newWidgets = widgets.filter((w) => !existingIds.has(w.id));

  let result: StoredLayouts = {
    lg: (saved.lg ?? []).filter((l) => widgetIds.has(l.i)),
    md: (saved.md ?? []).filter((l) => widgetIds.has(l.i)),
    sm: (saved.sm ?? []).filter((l) => widgetIds.has(l.i)),
  };

  if (newWidgets.length > 0) {
    const newDefaults = generateDefaultLayouts(newWidgets);
    result = {
      lg: [...result.lg, ...newDefaults.lg],
      md: [...result.md, ...newDefaults.md],
      sm: [...result.sm, ...newDefaults.sm],
    };
  }

  return result;
}

/* ── Component ── */

export function WidgetGrid({ widgets, storageKey = "pythia-grid-layouts-v1" }: WidgetGridProps) {
  const [mounted, setMounted] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutLocked = useAppStore((s) => s.layoutLocked);
  const addWidget = useAppStore((s) => s.addWidget);
  const setWidgetPanelOpen = useAppStore((s) => s.setWidgetPanelOpen);
  const setDraggingFromPanel = useAppStore((s) => s.setDraggingFromPanel);

  // Key to force RGL to fully re-mount when widgets change.
  // RGL only reads `layouts` prop on mount — subsequent prop changes are ignored
  // for items RGL doesn't know about. Changing key forces a clean re-init.
  const [gridKey, setGridKey] = useState(0);

  // Track widget IDs to detect adds/removes
  const prevWidgetKeyRef = useRef(widgets.map((w) => w.id).join(","));

  // Compute layouts from localStorage + current widgets
  const layouts = buildLayouts(storageKey, widgets);

  // When widgets change, force RGL to remount so it picks up the new layout
  const currentWidgetKey = widgets.map((w) => w.id).join(",");
  if (currentWidgetKey !== prevWidgetKeyRef.current) {
    prevWidgetKeyRef.current = currentWidgetKey;
    // Save the merged layouts so RGL reads them on remount
    saveLayouts(storageKey, layouts);
    // Schedule a remount (will happen on next render)
    queueMicrotask(() => setGridKey((k) => k + 1));
  }

  // Measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // onLayoutChange: persist only — no state updates, no re-renders, no loops
  const handleLayoutChange = useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
      const toSave: StoredLayouts = {};
      for (const [key, value] of Object.entries(allLayouts)) {
        if (value) toSave[key] = [...value] as LayoutItem[];
      }
      saveLayouts(storageKey, toSave);
    },
    [storageKey]
  );

  // Drag-over: show placeholder
  const handleDropDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("widget-id")) return false;
    return { w: 4, h: 4 };
  }, []);

  // Drop: add widget to store. The widget change triggers remount with correct layout.
  const handleDrop = useCallback(
    (_layout: Layout, _item: LayoutItem | undefined, e: Event) => {
      const dragEvent = e as unknown as DragEvent;
      const widgetId = dragEvent?.dataTransfer?.getData("widget-id");
      if (!widgetId) return;

      addWidget(widgetId);
      setWidgetPanelOpen(false);
      setDraggingFromPanel(false);
    },
    [addWidget, setWidgetPanelOpen, setDraggingFromPanel]
  );

  if (!mounted || containerWidth === 0) {
    return (
      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((w) => (
          <div
            key={w.id}
            className="animate-pulse rounded-[18px] bg-bg-base-1"
            style={{
              minHeight: 200,
              boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <ResponsiveGridLayout
        key={gridKey}
        className="pythia-grid-layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 768, sm: 0 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={60}
        width={containerWidth}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        onLayoutChange={handleLayoutChange}
        compactor={verticalCompactor}
        dragConfig={{ enabled: !layoutLocked, handle: ".widget-drag-handle", threshold: 5 }}
        resizeConfig={{ enabled: !layoutLocked, handles: ["se", "e", "s"] }}
        dropConfig={{ enabled: true, defaultItem: { w: 4, h: 4 } }}
        onDrop={handleDrop}
        onDropDragOver={handleDropDragOver}
      >
        {widgets.map((w) => {
          const Component = w.component;
          return (
            <div key={w.id} className="widget-grid-item h-full w-full">
              <Component />
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
