"use client";

import {
  ChevronDown,
  Plus,
  Check,
  LayoutGrid,
  TrendingUp,
  Zap,
  BarChart3,
  Shield,
  X,
  Lock,
  Unlock,
  Undo2,
  Redo2,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback, type KeyboardEvent } from "react";
import { useAppStore } from "@/lib/store";

/* ── Icon map: string → component ── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutGrid,
  TrendingUp,
  Zap,
  BarChart3,
  Shield,
};

function resolveIcon(name: string) {
  return ICON_MAP[name] ?? LayoutGrid;
}

export function SubHeader() {
  const [time, setTime] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const workspaces = useAppStore((s) => s.workspaces);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const createWorkspace = useAppStore((s) => s.createWorkspace);
  const deleteWorkspace = useAppStore((s) => s.deleteWorkspace);
  const renameWorkspace = useAppStore((s) => s.renameWorkspace);
  const toggleWidgetPanel = useAppStore((s) => s.toggleWidgetPanel);
  const layoutLocked = useAppStore((s) => s.layoutLocked);
  const toggleLayoutLock = useAppStore((s) => s.toggleLayoutLock);
  const resetLayout = useAppStore((s) => s.resetLayout);
  const layoutHistory = useAppStore((s) => s.layoutHistory);
  const layoutFuture = useAppStore((s) => s.layoutFuture);
  const undoLayout = useAppStore((s) => s.undoLayout);
  const redoLayout = useAppStore((s) => s.redoLayout);

  const current = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

  /* ── Undo/redo keyboard shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undoLayout();
      } else if (mod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redoLayout();
      } else if (mod && e.key === "y") {
        e.preventDefault();
        redoLayout();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undoLayout, redoLayout]);

  /* ── Live clock ── */
  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setCreatingWorkspace(false);
        setRenamingId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  /* ── Focus create input when it appears ── */
  useEffect(() => {
    if (creatingWorkspace) createInputRef.current?.focus();
  }, [creatingWorkspace]);

  /* ── Focus rename input when it appears ── */
  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  /* ── Handlers ── */
  const handleSelectWorkspace = useCallback(
    (id: string) => {
      setActiveWorkspace(id);
      setDropdownOpen(false);
      setRenamingId(null);
    },
    [setActiveWorkspace]
  );

  const handleCreateSubmit = useCallback(() => {
    const trimmed = newWorkspaceName.trim();
    if (trimmed) {
      createWorkspace(trimmed);
    }
    setNewWorkspaceName("");
    setCreatingWorkspace(false);
  }, [newWorkspaceName, createWorkspace]);

  const handleCreateKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCreateSubmit();
      } else if (e.key === "Escape") {
        setNewWorkspaceName("");
        setCreatingWorkspace(false);
      }
    },
    [handleCreateSubmit]
  );

  const handleRenameSubmit = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      renameWorkspace(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  }, [renamingId, renameValue, renameWorkspace]);

  const handleRenameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleRenameSubmit();
      } else if (e.key === "Escape") {
        setRenamingId(null);
        setRenameValue("");
      }
    },
    [handleRenameSubmit]
  );

  const startRename = useCallback((id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  }, []);

  return (
    <div
      className="flex h-8 items-center bg-bg-base-0 px-3"
      style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
    >
      {/* ── Workspace selector dropdown ── */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <div className="flex h-6 items-center overflow-hidden rounded-[4px] bg-bg-base-2 outline outline-1 -outline-offset-1 outline-divider-heavy">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex min-w-0 flex-1 items-center gap-1.5 truncate whitespace-nowrap px-2 text-body-12 font-semibold text-text-primary transition-colors duration-150 hover:bg-action-translucent-hover active:bg-action-translucent-active"
          >
            {current.name}
          </button>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative flex h-full items-center px-1 text-text-primary transition-colors duration-150 before:absolute before:-left-px before:bottom-1 before:top-1 before:w-px before:bg-divider-heavy hover:bg-action-translucent-hover active:bg-action-translucent-active"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* ── Dropdown panel ── */}
        {dropdownOpen && (
          <div
            className="absolute left-0 top-8 z-50 w-64 overflow-hidden rounded-[8px] bg-bg-base-2 py-1"
            style={{
              boxShadow:
                "inset 0 0 0 1px var(--color-divider-heavy), 0 8px 24px -4px rgba(0,0,0,0.5)",
            }}
          >
            <div className="px-3 py-1.5">
              <span className="text-label-10 text-text-quaternary">
                Workspaces
              </span>
            </div>

            {workspaces.map((ws) => {
              const Icon = resolveIcon(ws.icon);
              const isActive = ws.id === activeWorkspaceId;
              const isRenaming = renamingId === ws.id;

              return (
                <div
                  key={ws.id}
                  className={`group flex w-full items-center gap-2.5 px-3 py-2 transition-colors duration-150 ${
                    isActive
                      ? "bg-action-translucent-hover"
                      : "hover:bg-action-translucent-hover"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[4px] ${
                      isActive
                        ? "bg-signal-green/12 text-signal-green"
                        : "bg-bg-base-3 text-text-tertiary"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {/* Name — inline editable on double-click */}
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => {
                      if (!isRenaming) handleSelectWorkspace(ws.id);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startRename(ws.id, ws.name);
                    }}
                  >
                    {isRenaming ? (
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        onBlur={handleRenameSubmit}
                        className="w-full rounded-[2px] bg-bg-base-0 px-1 text-body-12 font-semibold text-text-primary outline-none ring-1 ring-signal-green/40"
                      />
                    ) : (
                      <div className="text-body-12 font-semibold text-text-primary">
                        {ws.name}
                      </div>
                    )}
                  </div>

                  {/* Active check */}
                  {isActive && !isRenaming && (
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-signal-green" />
                  )}

                  {/* Delete button — hidden if only 1 workspace */}
                  {workspaces.length > 1 && !isRenaming && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkspace(ws.id);
                      }}
                      className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[2px] text-text-quaternary opacity-0 transition-all duration-150 hover:bg-action-translucent-hover hover:text-text-secondary group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            <div className="mx-2 my-1 h-px bg-divider-heavy" />

            {/* Create workspace */}
            {creatingWorkspace ? (
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[4px] bg-bg-base-3 text-text-tertiary">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                <input
                  ref={createInputRef}
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  onKeyDown={handleCreateKeyDown}
                  onBlur={() => {
                    if (!newWorkspaceName.trim()) {
                      setCreatingWorkspace(false);
                      setNewWorkspaceName("");
                    } else {
                      handleCreateSubmit();
                    }
                  }}
                  placeholder="Workspace name..."
                  className="w-full rounded-[2px] bg-bg-base-0 px-1.5 py-0.5 text-body-12 text-text-primary placeholder:text-text-quaternary outline-none ring-1 ring-signal-green/40"
                />
              </div>
            ) : (
              <button
                onClick={() => setCreatingWorkspace(true)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-body-12 text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover hover:text-text-primary"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-bg-base-3 text-text-tertiary">
                  <Plus className="h-3.5 w-3.5" />
                </div>
                Create Workspace
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Add widget button ── */}
      <button
        onClick={toggleWidgetPanel}
        className="ml-2 flex h-6 flex-shrink-0 items-center gap-1 rounded-[4px] bg-action-translucent px-2 text-body-12 font-semibold text-text-primary transition-colors duration-150 hover:bg-action-translucent-hover active:bg-action-translucent-active sm:ml-3"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Add Widgets</span>
      </button>

      {/* ── Lock layout button ── */}
      <button
        onClick={toggleLayoutLock}
        title={layoutLocked ? "Layout locked" : "Layout unlocked"}
        className={`ml-2 flex h-6 flex-shrink-0 items-center gap-1 rounded-[4px] px-2 text-body-12 font-semibold transition-colors duration-150 ${
          layoutLocked
            ? "bg-signal-green/12 text-signal-green"
            : "bg-action-translucent text-text-secondary hover:bg-action-translucent-hover active:bg-action-translucent-active"
        }`}
      >
        {layoutLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
      </button>

      {/* ── Undo / Redo buttons ── */}
      <button
        onClick={undoLayout}
        disabled={layoutHistory.length === 0}
        title="Undo layout change (Ctrl+Z)"
        className={`ml-2 flex h-6 flex-shrink-0 items-center rounded-[4px] bg-action-translucent px-2 transition-colors duration-150 ${
          layoutHistory.length === 0
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-action-translucent-hover active:bg-action-translucent-active"
        }`}
      >
        <Undo2 className="h-3.5 w-3.5 text-text-secondary" />
      </button>
      <button
        onClick={redoLayout}
        disabled={layoutFuture.length === 0}
        title="Redo layout change (Ctrl+Shift+Z)"
        className={`ml-1 flex h-6 flex-shrink-0 items-center rounded-[4px] bg-action-translucent px-2 transition-colors duration-150 ${
          layoutFuture.length === 0
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-action-translucent-hover active:bg-action-translucent-active"
        }`}
      >
        <Redo2 className="h-3.5 w-3.5 text-text-secondary" />
      </button>

      {/* ── Auto-arrange button ── */}
      <button
        onClick={resetLayout}
        title="Auto-arrange widgets"
        className="ml-2 flex h-6 flex-shrink-0 items-center gap-1 rounded-[4px] bg-action-translucent px-2 text-body-12 font-semibold text-text-secondary transition-colors duration-150 hover:bg-action-translucent-hover active:bg-action-translucent-active"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>

      {/* ── Right: live clock — hidden on mobile ── */}
      <div className="ml-auto hidden items-center gap-2 sm:flex">
        <span className="text-numbers-10 text-text-quaternary">Last Updated</span>
        <span className="text-numbers-12 text-text-secondary">{time}</span>
      </div>
    </div>
  );
}
