import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  boolean,
  primaryKey,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

// ── NextAuth tables ─────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ],
);

// ── App tables ──────────────────────────────────────────────────────────────

export const positions = pgTable("positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  marketId: text("market_id").notNull(),
  marketQuestion: text("market_question").notNull(),
  venue: text("venue").notNull().default("polymarket"),
  side: text("side").notNull(), // "YES" | "NO"
  shares: real("shares").notNull().default(0),
  avgPrice: real("avg_price").notNull().default(0),
  currentPrice: real("current_price").notNull().default(0),
  costBasis: real("cost_basis").notNull().default(0),
  marketValue: real("market_value").notNull().default(0),
  pnl: real("pnl").notNull().default(0),
  pnlPercent: real("pnl_percent").notNull().default(0),
  category: text("category"),
  status: text("status").notNull().default("open"), // "open" | "closed"
  openedAt: timestamp("opened_at", { mode: "date" }).defaultNow().notNull(),
  closedAt: timestamp("closed_at", { mode: "date" }),
});

export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  positionId: uuid("position_id").references(() => positions.id),
  marketId: text("market_id").notNull(),
  marketQuestion: text("market_question").notNull(),
  venue: text("venue").notNull().default("polymarket"),
  side: text("side").notNull(), // "YES" | "NO"
  action: text("action").notNull(), // "buy" | "sell"
  shares: real("shares").notNull(),
  price: real("price").notNull(),
  amount: real("amount").notNull(),
  fee: real("fee").notNull().default(0),
  pnl: real("pnl"),
  executedAt: timestamp("executed_at", { mode: "date" }).defaultNow().notNull(),
});

export const bots = pgTable("bots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // "arbitrage" | "momentum" | "alpha" | "news-reactor" | "portfolio-guard" | "copy-trade"
  status: text("status").notNull().default("paused"), // "running" | "paused" | "stopped"
  mode: text("mode").notNull().default("paper"), // "live" | "paper"
  config: jsonb("config").default({}),
  capital: real("capital").notNull().default(0),
  pnl: real("pnl").notNull().default(0),
  pnlPercent: real("pnl_percent").notNull().default(0),
  totalTrades: integer("total_trades").notNull().default(0),
  winRate: real("win_rate").notNull().default(0),
  sharpe: real("sharpe").notNull().default(0),
  maxDrawdown: real("max_drawdown").notNull().default(0),
  marketsCount: integer("markets_count").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "price" | "whale" | "volume" | "anomaly" | "sentiment"
  marketId: text("market_id").notNull(),
  marketQuestion: text("market_question").notNull(),
  condition: text("condition").notNull(),
  threshold: text("threshold").notNull(),
  status: text("status").notNull().default("active"), // "active" | "paused"
  channels: jsonb("channels").default(["inapp"]),
  triggered: integer("triggered").notNull().default(0),
  lastTriggeredAt: timestamp("last_triggered_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const alertEvents = pgTable("alert_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  alertId: uuid("alert_id").notNull().references(() => alerts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  detail: text("detail").notNull(),
  severity: text("severity").notNull().default("medium"), // "critical" | "high" | "medium" | "low"
  read: boolean("read").notNull().default(false),
  triggeredAt: timestamp("triggered_at", { mode: "date" }).defaultNow().notNull(),
});

export const otpCodes = pgTable("otp_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const botLogs = pgTable("bot_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  botId: uuid("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // "scan" | "trade" | "alert" | "error"
  detail: text("detail").notNull(),
  marketId: text("market_id"),
  tradeId: uuid("trade_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const venueApiKeys = pgTable("venue_api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  venue: text("venue").notNull(), // "polymarket" | "kalshi" | "opinion-labs"
  apiKey: text("api_key").notNull(), // encrypted
  apiSecret: text("api_secret"), // encrypted
  status: text("status").notNull().default("active"), // "active" | "revoked"
  lastSyncAt: timestamp("last_sync_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
