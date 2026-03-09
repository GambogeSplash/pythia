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

/* ── Widget Linking ── */
export const LINK_CHANNEL_COLORS = [
  "#3B82F6", // blue
  "#A855F7", // purple
  "#F59E0B", // amber
  "#FF3B3B", // red
] as const;

export interface LinkChannel {
  marketId: string | null;
}

/* ── Workspaces ── */
export interface Workspace {
  id: string;
  name: string;
  icon: string;
  widgets: string[];
}

const DEFAULT_WORKSPACES: Workspace[] = [
  { id: "market", name: "MARKET DASHBOARD", icon: "LayoutGrid", widgets: DEFAULT_DASHBOARD_WIDGETS },
  { id: "momentum", name: "MOMENTUM SCANNER", icon: "TrendingUp", widgets: ["trending", "closing-soon", "ticker-tape", "heatmap", "screener", "market-chart"] },
  { id: "alpha", name: "ALPHA FEED", icon: "Zap", widgets: ["news-feed", "anomaly", "narrative", "sentiment", "ai-signals", "correlation"] },
  { id: "portfolio", name: "PORTFOLIO TRACKER", icon: "BarChart3", widgets: ["portfolio", "positions", "pnl", "watchlist", "market-chart", "orderbook"] },
  { id: "risk", name: "RISK MONITOR", icon: "Shield", widgets: ["anomaly", "positions", "portfolio", "pnl", "closing-soon", "correlation"] },
];

/* ── Context Menu ── */
export interface ContextMenuState {
  widgetId: string;
  x: number;
  y: number;
}

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

  // Dashboard widgets (derived from active workspace)
  dashboardWidgets: string[];
  setDashboardWidgets: (widgets: string[]) => void;
  addWidget: (widgetId: string, index?: number) => void;
  removeWidget: (widgetId: string) => void;
  duplicateWidget: (widgetId: string) => void;

  // Workspaces
  workspaces: Workspace[];
  activeWorkspaceId: string;
  setActiveWorkspace: (id: string) => void;
  createWorkspace: (name: string) => void;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;

  // Widget Linking
  linkChannels: LinkChannel[];
  widgetLinks: Record<string, number>; // widgetId -> channel index (0-3)
  setWidgetLink: (widgetId: string, channel: number | null) => void;
  setChannelMarket: (channel: number, marketId: string) => void;
  getLinkedMarket: (widgetId: string) => string | null;

  // Context menu
  contextMenu: ContextMenuState | null;
  setContextMenu: (menu: ContextMenuState | null) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;

  // Layout undo/redo
  layoutHistory: string[][];
  layoutFuture: string[][];
  undoLayout: () => void;
  redoLayout: () => void;

  // Layout lock
  layoutLocked: boolean;
  toggleLayoutLock: () => void;

  // Layout reset
  resetLayout: () => void;
  _layoutResetCounter: number;

  // Dropdowns
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;

  // Hydration from localStorage (call once after mount)
  _hydrated: boolean;
  hydrateFromStorage: () => void;
}

/* ── Persistence helpers ── */
function loadWorkspaces(): Workspace[] | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("pythia-workspaces");
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveWorkspaces(workspaces: Workspace[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("pythia-workspaces", JSON.stringify(workspaces)); } catch {}
}

function loadActiveWorkspace(): string {
  if (typeof window === "undefined") return "market";
  try {
    return localStorage.getItem("pythia-active-workspace") || "market";
  } catch { return "market"; }
}

function saveActiveWorkspace(id: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("pythia-active-workspace", id); } catch {}
}

function loadWidgetLinks(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem("pythia-widget-links");
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveWidgetLinks(links: Record<string, number>) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem("pythia-widget-links", JSON.stringify(links)); } catch {}
}

export const useAppStore = create<AppState>((set, get) => {
  // Always initialize with defaults — hydrate from localStorage after mount
  // to avoid SSR/client hydration mismatch
  const initialWorkspaces = DEFAULT_WORKSPACES;
  const activeWs = initialWorkspaces[0];

  return {
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

    // Dashboard widgets — synced with active workspace
    dashboardWidgets: activeWs.widgets,
    setDashboardWidgets: (widgets) => {
      set({ dashboardWidgets: widgets });
      // Sync back to workspace
      const state = get();
      const updated = state.workspaces.map((ws) =>
        ws.id === state.activeWorkspaceId ? { ...ws, widgets } : ws
      );
      set({ workspaces: updated });
      saveWorkspaces(updated);
    },
    addWidget: (widgetId, index) =>
      set((state) => {
        if (state.dashboardWidgets.includes(widgetId)) return state;
        const next = [...state.dashboardWidgets];
        if (index !== undefined && index >= 0 && index <= next.length) {
          next.splice(index, 0, widgetId);
        } else {
          next.push(widgetId);
        }
        const history = [...state.layoutHistory, state.dashboardWidgets].slice(-20);
        const updated = state.workspaces.map((ws) =>
          ws.id === state.activeWorkspaceId ? { ...ws, widgets: next } : ws
        );
        saveWorkspaces(updated);
        return { dashboardWidgets: next, workspaces: updated, layoutHistory: history, layoutFuture: [] };
      }),
    removeWidget: (widgetId) =>
      set((state) => {
        const next = state.dashboardWidgets.filter((id) => id !== widgetId);
        const history = [...state.layoutHistory, state.dashboardWidgets].slice(-20);
        const updated = state.workspaces.map((ws) =>
          ws.id === state.activeWorkspaceId ? { ...ws, widgets: next } : ws
        );
        saveWorkspaces(updated);
        return { dashboardWidgets: next, workspaces: updated, layoutHistory: history, layoutFuture: [] };
      }),
    duplicateWidget: (widgetId) =>
      set((state) => {
        // Can't duplicate if already present — just a visual feedback
        if (!state.dashboardWidgets.includes(widgetId)) return state;
        // Widget is already there, so this is a no-op for now
        // In a real app, we'd create a second instance
        return state;
      }),

    // Workspaces
    workspaces: initialWorkspaces,
    activeWorkspaceId: activeWs.id,
    setActiveWorkspace: (id) => {
      const state = get();
      const ws = state.workspaces.find((w) => w.id === id);
      if (!ws) return;
      saveActiveWorkspace(id);
      set({ activeWorkspaceId: id, dashboardWidgets: ws.widgets });
    },
    createWorkspace: (name) =>
      set((state) => {
        const id = `ws-${Date.now()}`;
        const newWs: Workspace = {
          id,
          name: name.toUpperCase(),
          icon: "LayoutGrid",
          widgets: [...DEFAULT_DASHBOARD_WIDGETS],
        };
        const updated = [...state.workspaces, newWs];
        saveWorkspaces(updated);
        saveActiveWorkspace(id);
        return { workspaces: updated, activeWorkspaceId: id, dashboardWidgets: newWs.widgets };
      }),
    deleteWorkspace: (id) =>
      set((state) => {
        if (state.workspaces.length <= 1) return state;
        const updated = state.workspaces.filter((ws) => ws.id !== id);
        saveWorkspaces(updated);
        if (state.activeWorkspaceId === id) {
          const next = updated[0];
          saveActiveWorkspace(next.id);
          return { workspaces: updated, activeWorkspaceId: next.id, dashboardWidgets: next.widgets };
        }
        return { workspaces: updated };
      }),
    renameWorkspace: (id, name) =>
      set((state) => {
        const updated = state.workspaces.map((ws) =>
          ws.id === id ? { ...ws, name: name.toUpperCase() } : ws
        );
        saveWorkspaces(updated);
        return { workspaces: updated };
      }),

    // Widget Linking
    linkChannels: [
      { marketId: null },
      { marketId: null },
      { marketId: null },
      { marketId: null },
    ],
    widgetLinks: {},
    setWidgetLink: (widgetId, channel) =>
      set((state) => {
        const next = { ...state.widgetLinks };
        if (channel === null) {
          delete next[widgetId];
        } else {
          next[widgetId] = channel;
        }
        saveWidgetLinks(next);
        return { widgetLinks: next };
      }),
    setChannelMarket: (channel, marketId) =>
      set((state) => {
        const next = [...state.linkChannels];
        next[channel] = { marketId };
        return { linkChannels: next };
      }),
    getLinkedMarket: (widgetId) => {
      const state = get();
      const channel = state.widgetLinks[widgetId];
      if (channel === undefined) return null;
      return state.linkChannels[channel]?.marketId ?? null;
    },

    // Context menu
    contextMenu: null,
    setContextMenu: (menu) => set({ contextMenu: menu }),

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

    // Layout undo/redo
    layoutHistory: [],
    layoutFuture: [],
    undoLayout: () =>
      set((state) => {
        if (state.layoutHistory.length === 0) return state;
        const prev = state.layoutHistory[state.layoutHistory.length - 1];
        const history = state.layoutHistory.slice(0, -1);
        const future = [state.dashboardWidgets, ...state.layoutFuture].slice(0, 20);
        const updated = state.workspaces.map((ws) =>
          ws.id === state.activeWorkspaceId ? { ...ws, widgets: prev } : ws
        );
        saveWorkspaces(updated);
        return { dashboardWidgets: prev, layoutHistory: history, layoutFuture: future, workspaces: updated };
      }),
    redoLayout: () =>
      set((state) => {
        if (state.layoutFuture.length === 0) return state;
        const next = state.layoutFuture[0];
        const future = state.layoutFuture.slice(1);
        const history = [...state.layoutHistory, state.dashboardWidgets].slice(-20);
        const updated = state.workspaces.map((ws) =>
          ws.id === state.activeWorkspaceId ? { ...ws, widgets: next } : ws
        );
        saveWorkspaces(updated);
        return { dashboardWidgets: next, layoutHistory: history, layoutFuture: future, workspaces: updated };
      }),

    // Layout lock
    layoutLocked: false,
    toggleLayoutLock: () => set((s) => ({ layoutLocked: !s.layoutLocked })),

    // Layout reset
    _layoutResetCounter: 0,
    resetLayout: () => {
      const state = get();
      if (typeof window !== "undefined") {
        localStorage.removeItem(`pythia-grid-${state.activeWorkspaceId}`);
      }
      set({ _layoutResetCounter: state._layoutResetCounter + 1 });
    },

    activeDropdown: null,
    setActiveDropdown: (id) => set({ activeDropdown: id }),

    _hydrated: false,
    hydrateFromStorage: () => {
      const state = get();
      if (state._hydrated) return;

      const savedWorkspaces = loadWorkspaces() ?? DEFAULT_WORKSPACES;
      const savedActiveId = loadActiveWorkspace();
      const savedLinks = loadWidgetLinks();
      const activeWs = savedWorkspaces.find((w) => w.id === savedActiveId) ?? savedWorkspaces[0];

      set({
        _hydrated: true,
        workspaces: savedWorkspaces,
        activeWorkspaceId: activeWs.id,
        dashboardWidgets: activeWs.widgets,
        widgetLinks: savedLinks,
      });
    },
  };
});
