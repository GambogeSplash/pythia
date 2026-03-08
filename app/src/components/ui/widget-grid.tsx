"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, LayoutGroup } from "framer-motion";
import { useAppStore } from "@/lib/store";

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

function SortableItem({ id, span = 1, height, children }: { id: string; span?: number; height?: number; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${span}`,
    height: height || 320,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="widget-sortable-item"
      layout="position"
      layoutId={id}
      transition={{ type: "spring", stiffness: 200, damping: 28, mass: 0.8 }}
      {...attributes}
      {...listeners}
    >
      {isDragging ? (
        <div
          className="h-full w-full rounded-[18px]"
          style={{
            border: "2px dashed rgba(0, 255, 133, 0.35)",
            background: "rgba(0, 255, 133, 0.04)",
            boxShadow: "inset 0 0 24px rgba(0, 255, 133, 0.06)",
          }}
        />
      ) : (
        children
      )}
    </motion.div>
  );
}

export function WidgetGrid({ widgets, storageKey = "pythia-widget-order" }: WidgetGridProps) {
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const widgetSpans = useAppStore((s) => s.widgetSpans);
  const widgetHeights = useAppStore((s) => s.widgetHeights);
  const dropPreviewIndex = useAppStore((s) => s.dropPreviewIndex);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const defaultOrder = widgets.map((w) => w.id);

    if (!mounted) {
      // First mount: try to restore saved order
      const saved = loadOrder(storageKey);
      if (saved) {
        const valid = saved.filter((id) => widgets.some((w) => w.id === id));
        const missing = defaultOrder.filter((id) => !valid.includes(id));
        setWidgetOrder([...valid, ...missing]);
      } else {
        setWidgetOrder(defaultOrder);
      }
      setMounted(true);
    } else {
      // After mount: sync with widget list changes (additions/removals)
      setWidgetOrder((prev) => {
        const removed = prev.filter((id) => defaultOrder.includes(id));
        const added = defaultOrder.filter((id) => !removed.includes(id));
        if (added.length === 0 && removed.length === prev.length) return prev;
        // Insert new widgets at their position from the store order
        const next = [...removed];
        for (const id of added) {
          const storeIdx = defaultOrder.indexOf(id);
          // Find the right position: insert before the first existing widget that comes after it in defaultOrder
          let insertAt = next.length;
          for (let i = 0; i < next.length; i++) {
            if (defaultOrder.indexOf(next[i]) > storeIdx) {
              insertAt = i;
              break;
            }
          }
          next.splice(insertAt, 0, id);
        }
        saveOrder(storageKey, next);
        return next;
      });
    }
  }, [widgets, storageKey, mounted]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        saveOrder(storageKey, newOrder);
        return newOrder;
      });
    }
  }, [storageKey]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
        <LayoutGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" style={{ gridAutoRows: "min-content" }}>
            {widgetOrder.map((id, idx) => {
              const w = widgets.find((w) => w.id === id);
              if (!w) return null;
              const Component = w.component;
              // Derive default span from registry: 12-col w mapped to 3-col grid
              const defaultSpan = Math.max(1, Math.min(3, Math.round(w.defaultLayout.w / 4)));
              const span = widgetSpans[id] || defaultSpan;
              const height = widgetHeights[id] || (w.defaultLayout.h * 80);
              return (
                <React.Fragment key={id}>
                  {dropPreviewIndex === idx && (
                    <div
                      data-drop-preview="true"
                      className="rounded-[18px] animate-in fade-in zoom-in-95 duration-200"
                      style={{
                        gridColumn: "span 1",
                        height: 240,
                        border: "2px dashed rgba(0, 255, 133, 0.4)",
                        background: "rgba(0, 255, 133, 0.06)",
                        boxShadow: "0 0 32px rgba(0, 255, 133, 0.08), inset 0 0 24px rgba(0, 255, 133, 0.04)",
                      }}
                    />
                  )}
                  <SortableItem id={id} span={span} height={height}>
                    <div className="widget-grid-item h-full w-full">
                      <Component />
                    </div>
                  </SortableItem>
                </React.Fragment>
              );
            })}
            {/* Preview at the end */}
            {dropPreviewIndex !== null && dropPreviewIndex >= widgetOrder.length && (
              <div
                data-drop-preview="true"
                className="rounded-[18px] animate-in fade-in zoom-in-95 duration-200"
                style={{
                  gridColumn: "span 1",
                  height: 240,
                  border: "2px dashed rgba(0, 255, 133, 0.4)",
                  background: "rgba(0, 255, 133, 0.06)",
                  boxShadow: "0 0 32px rgba(0, 255, 133, 0.08), inset 0 0 24px rgba(0, 255, 133, 0.04)",
                }}
              />
            )}
          </div>
        </LayoutGroup>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" }}>
        {activeId ? (() => {
          const w = widgets.find((w) => w.id === activeId);
          if (!w) return null;
          const Component = w.component;
          return (
            <div
              className="widget-grid-item w-full"
              style={{
                opacity: 0.92,
                boxShadow: "0 0 0 1px rgba(0, 255, 133, 0.2), 0 12px 40px -4px rgba(0, 0, 0, 0.6), 0 0 32px rgba(0, 255, 133, 0.1)",
                borderRadius: 18,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <Component />
            </div>
          );
        })() : null}
      </DragOverlay>
    </DndContext>
  );
}

function loadOrder(key: string): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveOrder(key: string, order: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(order));
  } catch {
    // storage full, ignore
  }
}
