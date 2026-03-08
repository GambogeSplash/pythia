import { create } from "zustand";

const DEFAULT_DASHBOARD_WIDGETS = [
  "signal",
  "mm-opportunities",
  "news-feed",
  "traders-activity",
  "sentiment",
  "ai-signals",
];

export interface Notification {
  id: string;
  type: "alert" | "trade" | "system" | "whale";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [];

interface AppState {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Widget panel (right sidebar)
  widgetPanelOpen: boolean;
  setWidgetPanelOpen: (open: boolean) => void;
  toggleWidgetPanel: () => void;
  draggingFromPanel: boolean;
  setDraggingFromPanel: (v: boolean) => void;

  // Fullscreen widget
  fullscreenWidgetId: string | null;
  setFullscreenWidgetId: (id: string | null) => void;

  // Dashboard widgets
  dashboardWidgets: string[];
  setDashboardWidgets: (widgets: string[]) => void;
  addWidget: (widgetId: string, index?: number) => void;
  removeWidget: (widgetId: string) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;

  // Dropdowns
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),

  widgetPanelOpen: false,
  setWidgetPanelOpen: (open) => set({ widgetPanelOpen: open }),
  toggleWidgetPanel: () => set((s) => ({ widgetPanelOpen: !s.widgetPanelOpen })),
  draggingFromPanel: false,
  setDraggingFromPanel: (v) => set({ draggingFromPanel: v }),

  fullscreenWidgetId: null,
  setFullscreenWidgetId: (id) => set({ fullscreenWidgetId: id }),

  dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS,
  setDashboardWidgets: (widgets) => set({ dashboardWidgets: widgets }),
  addWidget: (widgetId, index) =>
    set((state) => {
      if (state.dashboardWidgets.includes(widgetId)) return state;
      const next = [...state.dashboardWidgets];
      if (index !== undefined && index >= 0 && index <= next.length) {
        next.splice(index, 0, widgetId);
      } else {
        next.push(widgetId);
      }
      return { dashboardWidgets: next };
    }),
  removeWidget: (widgetId) =>
    set((state) => ({
      dashboardWidgets: state.dashboardWidgets.filter((id) => id !== widgetId),
    })),

  notifications: INITIAL_NOTIFICATIONS,
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  activeDropdown: null,
  setActiveDropdown: (id) => set({ activeDropdown: id }),
}));
