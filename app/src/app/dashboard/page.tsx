"use client";

import { useMemo } from "react";
import { WidgetGrid } from "@/components/ui/widget-grid";
import { getWidgetsByIds } from "@/lib/widget-registry";
import { useAppStore } from "@/lib/store";
import { SubHeader } from "@/components/layout/sub-header";
import { EmptyDashboard } from "@/components/ui/empty-state";

export default function Dashboard() {
  const dashboardWidgets = useAppStore((s) => s.dashboardWidgets);
  const setWidgetPanelOpen = useAppStore((s) => s.setWidgetPanelOpen);
  const addWidget = useAppStore((s) => s.addWidget);
  const widgets = useMemo(() => getWidgetsByIds(dashboardWidgets), [dashboardWidgets]);

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("widget-id")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const widgetId = e.dataTransfer.getData("widget-id");
    if (widgetId) {
      addWidget(widgetId);
      setWidgetPanelOpen(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <SubHeader />
      <div
        className="relative min-h-0 flex-1 overflow-auto rounded-[12px] p-3"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {widgets.length > 0 ? (
          <WidgetGrid widgets={widgets} storageKey="pythia-grid-layouts-v2" />
        ) : (
          <EmptyDashboard onAddWidgets={() => setWidgetPanelOpen(true)} />
        )}
      </div>
    </div>
  );
}
