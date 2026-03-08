"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveGridLayout,
  verticalCompactor,
  type LayoutItem,
  type Layout,
  type ResponsiveLayouts,
} from "react-grid-layout";
import { useAppStore } from "@/lib/store";

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

/* ── Component ── */

export function WidgetGrid({ widgets, storageKey = "pythia-grid-layouts-v1" }: WidgetGridProps) {
  const [mounted, setMounted] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenWidgetId = useAppStore((s) => s.fullscreenWidgetId);

  const defaultLayouts = useMemo(() => generateDefaultLayouts(widgets), [widgets]);

  const [layouts, setLayouts] = useState<StoredLayouts>(() => {
    const saved = loadLayouts(storageKey);
    if (saved) {
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
    return defaultLayouts;
  });

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

  // Sync layouts when widgets change
  useEffect(() => {
    const widgetIds = new Set(widgets.map((w) => w.id));
    const currentIds = new Set(layouts.lg?.map((l) => l.i) ?? []);

    const added = widgets.filter((w) => !currentIds.has(w.id));
    const removed = [...currentIds].filter((id) => !widgetIds.has(id));

    if (added.length === 0 && removed.length === 0) return;

    setLayouts((prev) => {
      let lg = (prev.lg ?? []).filter((l) => widgetIds.has(l.i));
      let md = (prev.md ?? []).filter((l) => widgetIds.has(l.i));
      let sm = (prev.sm ?? []).filter((l) => widgetIds.has(l.i));

      if (added.length > 0) {
        const addedDefaults = generateDefaultLayouts(added);
        lg = [...lg, ...addedDefaults.lg];
        md = [...md, ...addedDefaults.md];
        sm = [...sm, ...addedDefaults.sm];
      }

      const next: StoredLayouts = { lg, md, sm };
      saveLayouts(storageKey, next);
      return next;
    });
  }, [widgets, storageKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
      // Convert readonly Layout to mutable for storage
      const mutable: StoredLayouts = {};
      for (const [key, value] of Object.entries(allLayouts)) {
        if (value) mutable[key] = [...value] as LayoutItem[];
      }
      setLayouts(mutable);
      saveLayouts(storageKey, mutable);
    },
    [storageKey]
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
        dragConfig={{ enabled: true, handle: ".widget-drag-handle", threshold: 5 }}
        resizeConfig={{ enabled: true, handles: ["se", "e", "s"] }}
      >
        {widgets.map((w) => {
          const Component = w.component;
          if (fullscreenWidgetId === w.id) {
            return <div key={w.id} />;
          }
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
