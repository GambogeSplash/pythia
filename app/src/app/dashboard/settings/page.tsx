"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, User, Moon, Sun, Monitor, Bell, Key, Database,
  Globe, Trash2, Download, Check, Eye, EyeOff, Plus, X,
  ChevronRight,
} from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useThemeStore, type Theme } from "@/lib/theme-store";
import { signOut } from "next-auth/react";

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                */
/* ------------------------------------------------------------------ */

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type SettingsTab = "profile" | "appearance" | "notifications" | "api-keys" | "data";

interface VenueKey {
  id: string;
  venue: string;
  apiKey: string;
  status: "active" | "revoked";
  lastSyncAt: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  SIDEBAR NAV                                                        */
/* ------------------------------------------------------------------ */

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User className="h-3.5 w-3.5" /> },
  { id: "appearance", label: "Appearance", icon: <Moon className="h-3.5 w-3.5" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-3.5 w-3.5" /> },
  { id: "api-keys", label: "API Keys", icon: <Key className="h-3.5 w-3.5" /> },
  { id: "data", label: "Data", icon: <Database className="h-3.5 w-3.5" /> },
];

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <div className="flex h-full flex-col">
      {/* ============ SUB-HEADER ============ */}
      <motion.div
        className="flex h-8 shrink-0 items-center bg-bg-base-0 px-3"
        style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)" }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-6 items-center gap-1.5 rounded-[4px] bg-bg-base-2 px-2 text-body-12 font-semibold text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy">
          <Settings className="h-3 w-3 text-signal-green" />
          SETTINGS
        </div>
      </motion.div>

      {/* ============ CONTENT ============ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Settings sidebar */}
        <motion.nav
          className="flex w-48 shrink-0 flex-col gap-0.5 overflow-y-auto p-3"
          style={{ boxShadow: "inset -1px 0 0 0 var(--color-divider-heavy)" }}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 rounded-[6px] px-3 py-2 text-body-12 font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? "bg-action-translucent-hover text-signal-green"
                  : "text-text-secondary hover:bg-action-translucent-hover hover:text-text-primary"
              }`}
            >
              <span className={activeTab === tab.id ? "text-signal-green" : "text-text-tertiary"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </motion.nav>

        {/* Main panel */}
        <motion.div
          className="flex-1 overflow-y-auto p-6"
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="mx-auto max-w-2xl">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "appearance" && <AppearanceSection />}
            {activeTab === "notifications" && <NotificationsSection />}
            {activeTab === "api-keys" && <ApiKeysSection />}
            {activeTab === "data" && <DataSection />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PROFILE SECTION                                                    */
/* ------------------------------------------------------------------ */

function ProfileSection() {
  const { user } = useSession();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: wire to API to update user name
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-header-20 font-bold text-text-primary">Profile</h2>
        <p className="mt-1 text-body-12 text-text-secondary">Manage your account information.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-bg-base-0"
            style={{ background: "linear-gradient(135deg, #00FF85, #4DA6FF)" }}
          >
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-body-14 font-semibold text-text-primary">
              {user?.name || user?.email?.split("@")[0] || "User"}
            </div>
            <div className="text-[11px] text-text-quaternary">
              Member since {new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Display Name */}
        <SettingsField label="Display Name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="h-8 w-full rounded-[6px] bg-bg-base-2 px-3 text-body-12 text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy placeholder:text-text-quaternary focus:outline-signal-green/50"
          />
        </SettingsField>

        {/* Email */}
        <SettingsField label="Email" hint="Email cannot be changed">
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="h-8 w-full cursor-not-allowed rounded-[6px] bg-bg-base-1 px-3 text-body-12 text-text-tertiary outline outline-1 -outline-offset-1 outline-divider-heavy"
          />
        </SettingsField>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex h-8 items-center gap-2 rounded-[6px] bg-action-brand px-4 text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-action-brand/90"
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : null}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div variants={fadeUp} className="pt-4" style={{ borderTop: "1px solid var(--color-divider-heavy)" }}>
        <h3 className="text-body-12 font-semibold text-action-fall">Danger Zone</h3>
        <p className="mt-1 text-[11px] text-text-quaternary">
          Sign out of your account on this device.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-3 flex h-8 items-center gap-2 rounded-[6px] bg-action-fall-dim px-4 text-body-12 font-medium text-action-fall transition-colors hover:bg-action-fall/20"
        >
          Sign Out
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  APPEARANCE SECTION                                                 */
/* ------------------------------------------------------------------ */

function AppearanceSection() {
  const currentTheme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const themes: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    { value: "dark", label: "Dark", icon: <Moon className="h-5 w-5" />, description: "Dark background, easy on the eyes" },
    { value: "light", label: "Light", icon: <Sun className="h-5 w-5" />, description: "Light background, high contrast" },
    { value: "system", label: "System", icon: <Monitor className="h-5 w-5" />, description: "Match your OS preference" },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-header-20 font-bold text-text-primary">Appearance</h2>
        <p className="mt-1 text-body-12 text-text-secondary">Customize the look and feel of Pythia.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <label className="text-body-12 font-medium text-text-secondary">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`flex flex-col items-center gap-2 rounded-[10px] p-4 text-center transition-all duration-150 ${
                currentTheme === t.value
                  ? "bg-signal-green/10 text-signal-green outline outline-1 -outline-offset-1 outline-signal-green/40"
                  : "bg-bg-base-2 text-text-secondary outline outline-1 -outline-offset-1 outline-divider-heavy hover:bg-bg-base-3 hover:text-text-primary"
              }`}
            >
              {t.icon}
              <span className="text-body-12 font-semibold">{t.label}</span>
              <span className="text-[10px] text-text-quaternary">{t.description}</span>
              {currentTheme === t.value && <Check className="h-3.5 w-3.5 text-signal-green" />}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  NOTIFICATIONS SECTION                                              */
/* ------------------------------------------------------------------ */

function NotificationsSection() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [whaleAlerts, setWhaleAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [botAlerts, setBotAlerts] = useState(false);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-header-20 font-bold text-text-primary">Notifications</h2>
        <p className="mt-1 text-body-12 text-text-secondary">Choose what notifications you receive.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-1">
        <ToggleRow
          label="Email Alerts"
          description="Receive important alerts via email"
          checked={emailAlerts}
          onChange={setEmailAlerts}
        />
        <ToggleRow
          label="In-App Notifications"
          description="Show notification badge and popup"
          checked={inAppNotifs}
          onChange={setInAppNotifs}
        />
        <ToggleRow
          label="Whale Movement Alerts"
          description="Get notified when whales make large trades"
          checked={whaleAlerts}
          onChange={setWhaleAlerts}
        />
        <ToggleRow
          label="Price Alerts"
          description="Notifications when price thresholds are hit"
          checked={priceAlerts}
          onChange={setPriceAlerts}
        />
        <ToggleRow
          label="Bot Activity"
          description="Receive updates on bot trades and errors"
          checked={botAlerts}
          onChange={setBotAlerts}
        />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  API KEYS SECTION                                                   */
/* ------------------------------------------------------------------ */

function ApiKeysSection() {
  const [keys, setKeys] = useState<VenueKey[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVenue, setNewVenue] = useState("polymarket");
  const [newApiKey, setNewApiKey] = useState("");
  const [newApiSecret, setNewApiSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  const venues = [
    { value: "polymarket", label: "Polymarket", icon: <Globe className="h-4 w-4 text-signal-green" /> },
    { value: "kalshi", label: "Kalshi", icon: <Globe className="h-4 w-4 text-signal-blue" /> },
    { value: "manifold", label: "Manifold", icon: <Globe className="h-4 w-4 text-signal-amber" /> },
  ];

  const handleAdd = () => {
    if (!newApiKey) return;
    const newKey: VenueKey = {
      id: crypto.randomUUID(),
      venue: newVenue,
      apiKey: newApiKey,
      status: "active",
      lastSyncAt: null,
      createdAt: new Date().toISOString(),
    };
    setKeys([...keys, newKey]);
    setNewApiKey("");
    setNewApiSecret("");
    setShowAddForm(false);
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-header-20 font-bold text-text-primary">API Keys</h2>
        <p className="mt-1 text-body-12 text-text-secondary">
          Connect your prediction market accounts to enable live trading.
        </p>
      </motion.div>

      {/* Connected venues */}
      <motion.div variants={fadeUp} className="space-y-2">
        {keys.length === 0 && !showAddForm && (
          <div className="rounded-[10px] bg-bg-base-2 p-6 text-center outline outline-1 -outline-offset-1 outline-divider-heavy">
            <Key className="mx-auto h-8 w-8 text-text-quaternary" />
            <p className="mt-2 text-body-12 text-text-secondary">No API keys connected</p>
            <p className="mt-0.5 text-[11px] text-text-quaternary">Add a venue API key to start trading</p>
          </div>
        )}

        {keys.map((k) => {
          const venue = venues.find((v) => v.value === k.venue);
          return (
            <div
              key={k.id}
              className="flex items-center gap-3 rounded-[10px] bg-bg-base-2 px-4 py-3 outline outline-1 -outline-offset-1 outline-divider-heavy"
            >
              {venue?.icon}
              <div className="flex-1">
                <div className="text-body-12 font-semibold text-text-primary">{venue?.label || k.venue}</div>
                <div className="text-[10px] font-mono text-text-quaternary">
                  {k.apiKey.slice(0, 8)}{"****"}
                </div>
              </div>
              <span className="rounded-full bg-signal-green/10 px-2 py-0.5 text-[9px] font-bold text-signal-green">
                ACTIVE
              </span>
              <button
                onClick={() => handleRevoke(k.id)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-text-quaternary transition-colors hover:bg-action-fall-dim hover:text-action-fall"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </motion.div>

      {/* Add form */}
      {showAddForm ? (
        <motion.div
          variants={fadeUp}
          className="space-y-3 rounded-[10px] bg-bg-base-2 p-4 outline outline-1 -outline-offset-1 outline-divider-heavy"
        >
          <SettingsField label="Venue">
            <select
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
              className="h-8 w-full rounded-[6px] bg-bg-base-1 px-3 text-body-12 text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy focus:outline-signal-green/50"
            >
              {venues.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </SettingsField>

          <SettingsField label="API Key">
            <input
              type="text"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="h-8 w-full rounded-[6px] bg-bg-base-1 px-3 font-mono text-body-12 text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy placeholder:text-text-quaternary focus:outline-signal-green/50"
            />
          </SettingsField>

          <SettingsField label="API Secret (optional)">
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={newApiSecret}
                onChange={(e) => setNewApiSecret(e.target.value)}
                placeholder="Enter your API secret"
                className="h-8 w-full rounded-[6px] bg-bg-base-1 px-3 pr-9 font-mono text-body-12 text-text-primary outline outline-1 -outline-offset-1 outline-divider-heavy placeholder:text-text-quaternary focus:outline-signal-green/50"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-quaternary hover:text-text-secondary"
              >
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </SettingsField>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAdd}
              className="flex h-8 items-center gap-2 rounded-[6px] bg-action-brand px-4 text-body-12 font-semibold text-bg-base-0 transition-colors hover:bg-action-brand/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Key
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex h-8 items-center rounded-[6px] bg-action-translucent px-4 text-body-12 font-medium text-text-secondary transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp}>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex h-8 items-center gap-2 rounded-[6px] bg-action-translucent px-4 text-body-12 font-medium text-text-secondary outline outline-1 -outline-offset-1 outline-divider-heavy transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add API Key
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  DATA SECTION                                                       */
/* ------------------------------------------------------------------ */

function DataSection() {
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleClearHistory = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    // TODO: wire to API to clear trade history
    setClearConfirm(false);
  };

  const handleExport = () => {
    // TODO: wire to API to export data
    const data = { exportedAt: new Date().toISOString(), trades: [], positions: [] };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pythia-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-header-20 font-bold text-text-primary">Data</h2>
        <p className="mt-1 text-body-12 text-text-secondary">Manage your trading data and exports.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-4">
        {/* Export */}
        <div
          className="flex items-center justify-between rounded-[10px] bg-bg-base-2 px-4 py-3 outline outline-1 -outline-offset-1 outline-divider-heavy"
        >
          <div>
            <div className="text-body-12 font-semibold text-text-primary">Export Data</div>
            <div className="text-[11px] text-text-quaternary">Download your trades, positions, and settings as JSON</div>
          </div>
          <button
            onClick={handleExport}
            className="flex h-8 items-center gap-2 rounded-[6px] bg-action-translucent px-3 text-body-12 font-medium text-text-secondary outline outline-1 -outline-offset-1 outline-divider-heavy transition-colors hover:bg-action-translucent-hover hover:text-text-primary"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>

        {/* Clear history */}
        <div
          className="flex items-center justify-between rounded-[10px] bg-bg-base-2 px-4 py-3 outline outline-1 -outline-offset-1 outline-divider-heavy"
        >
          <div>
            <div className="text-body-12 font-semibold text-text-primary">Clear Trade History</div>
            <div className="text-[11px] text-text-quaternary">Permanently delete all your trade records</div>
          </div>
          <button
            onClick={handleClearHistory}
            className={`flex h-8 items-center gap-2 rounded-[6px] px-3 text-body-12 font-medium transition-colors ${
              clearConfirm
                ? "bg-action-fall text-white"
                : "bg-action-fall-dim text-action-fall hover:bg-action-fall/20"
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {clearConfirm ? "Confirm Delete" : "Clear History"}
          </button>
        </div>
        {clearConfirm && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-action-fall">This action cannot be undone.</span>
            <button
              onClick={() => setClearConfirm(false)}
              className="text-[11px] text-text-secondary underline hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  SHARED COMPONENTS                                                  */
/* ------------------------------------------------------------------ */

function SettingsField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-body-12 font-medium text-text-secondary">{label}</label>
        {hint && <span className="text-[10px] text-text-quaternary">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-[10px] px-4 py-3 text-left transition-colors duration-150 hover:bg-action-translucent-hover"
      style={{ boxShadow: "inset 0 -1px 0 0 var(--color-divider-thin)" }}
    >
      <div className="flex-1">
        <div className="text-body-12 font-medium text-text-primary">{label}</div>
        <div className="text-[11px] text-text-quaternary">{description}</div>
      </div>
      <div
        className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${
          checked ? "bg-signal-green" : "bg-bg-base-3"
        }`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
