"use client";

import { TopNav } from "@/components/layout/top-nav";
import { WidgetPanel } from "@/components/ui/widget-panel";
import { CommandPalette } from "@/components/ui/command-palette";
import { WidgetContextMenu } from "@/components/ui/context-menu";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import { useWidgetShortcuts } from "@/hooks/use-widget-shortcuts";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const widgetPanelOpen = useAppStore((s) => s.widgetPanelOpen);
  const setWidgetPanelOpen = useAppStore((s) => s.setWidgetPanelOpen);
  const draggingFromPanel = useAppStore((s) => s.draggingFromPanel);
  const pathname = usePathname();

  useWidgetShortcuts();

  return (
    <div className="flex h-screen flex-col bg-bg-base-0">
      <TopNav />
      <div className="relative flex min-h-0 flex-1">
        <main className="flex-1 overflow-auto p-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Dark overlay when widget panel is open */}
        <AnimatePresence>
          {widgetPanelOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`absolute inset-0 z-30 transition-colors duration-200 ${
                draggingFromPanel
                  ? "pointer-events-none bg-black/30"
                  : "bg-black/50"
              }`}
              onClick={() => setWidgetPanelOpen(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {widgetPanelOpen && <WidgetPanel />}
        </AnimatePresence>
      </div>
      <CommandPalette />
      <WidgetContextMenu />
    </div>
  );
}
