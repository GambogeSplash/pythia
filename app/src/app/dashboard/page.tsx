"use client";

import { useMemo } from "react";
import { WidgetGrid } from "@/components/ui/widget-grid";
import { getWidgetsByIds } from "@/lib/widget-registry";
import { useAppStore } from "@/lib/store";
import { SubHeader } from "@/components/layout/sub-header";
import { EmptyDashboard } from "@/components/ui/empty-state";

export default function Dashboard() {
  const dashboardWidgets = useAppStore((s) => s.dashboardWidgets);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const resetCounter = useAppStore((s) => s._layoutResetCounter);
  const setWidgetPanelOpen = useAppStore((s) => s.setWidgetPanelOpen);
  const widgets = useMemo(() => getWidgetsByIds(dashboardWidgets), [dashboardWidgets]);

  return (
    <div className="flex h-full flex-col">
      <SubHeader />
      <div className="relative min-h-0 flex-1 overflow-auto rounded-[12px] p-3">
        {widgets.length > 0 ? (
          <WidgetGrid
            key={`${activeWorkspaceId}-${resetCounter}`}
            widgets={widgets}
            storageKey={`pythia-grid-${activeWorkspaceId}`}
          />
        ) : (
          <EmptyDashboard onAddWidgets={() => setWidgetPanelOpen(true)} />
        )}
      </div>
    </div>
  );
}
