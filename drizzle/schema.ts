import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean as mysqlBoolean, json, index, float } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "pro"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Proiecte de vizualizare texturi ──────────────────────────────────────────
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(),
  originalImageUrl: text("originalImageUrl").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  sessionIdIdx: index("idx_projects_sessionId").on(table.sessionId),
}))

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

//// ── Randări generate AI ───────────────────────────────────────────────────
export const renders = mysqlTable("renders", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  textureId: varchar("textureId", { length: 64 }).notNull(),
  colorHex: varchar("colorHex", { length: 16 }),
  intensity: int("intensity").default(80),
  resultImageUrl: text("resultImageUrl").notNull(),
  prompt: text("prompt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  projectIdIdx: index("idx_renders_projectId").on(table.projectId),
}));

export type Render = typeof renders.$inferSelect;
export type InsertRender = typeof renders.$inferInsert;

// ── Contor generări AI per sesiune ─────────────────────────────────────────────────────────────────────────────────
// Fiecare sesiune anonimă are dreptul la FREE_GENERATIONS generări gratuite.
// Dopo epuizare, clientul este invitat să contacteze Decor Carpi pe WhatsApp.
export const sessionUsage = mysqlTable("session_usage", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(),
  generationsUsed: int("generationsUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SessionUsage = typeof sessionUsage.$inferSelect;
export type InsertSessionUsage = typeof sessionUsage.$inferInsert;
// ── Preventive (Preventivi) ──────────────────────────────────────────────────
export const preventives = mysqlTable("preventives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectName: varchar("projectName", { length: 255 }).notNull(),
  preventiveNumber: varchar("preventiveNumber", { length: 64 }).notNull(),
  clientName: varchar("clientName", { length: 255 }),
  clientCF: varchar("clientCF", { length: 64 }),
  clientAddress: varchar("clientAddress", { length: 255 }),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 20 }),
  calculator: varchar("calculator", { length: 255 }),
  description: text("description"),
  subtotal: float("subtotal").default(0).notNull(),
  iva: float("iva").default(0).notNull(),
  altri: float("altri").default(0).notNull(),
  total: float("total").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "sent", "accepted", "rejected"]).default("draft").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  userIdIdx: index("idx_preventives_userId").on(table.userId),
  statusIdx: index("idx_preventives_status").on(table.status),
}));

export type Preventive = typeof preventives.$inferSelect;
export type InsertPreventive = typeof preventives.$inferInsert;

// ── Preventive Items (Articoli nel Preventivo) ───────────────────────────────
export const preventiveItems = mysqlTable("preventive_items", {
  id: int("id").autoincrement().primaryKey(),
  preventiveId: int("preventiveId").notNull().references(() => preventives.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 64 }).notNull(), // stucco, paint, antimold
  model: varchar("model", { length: 255 }).notNull(),
  color: varchar("color", { length: 16 }),
  room: varchar("room", { length: 255 }).notNull(),
  sqm: int("sqm").notNull(),
  pricePerSqm: int("pricePerSqm").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
}, (table) => ({
  preventiveIdIdx: index("idx_preventive_items_preventiveId").on(table.preventiveId),
}))

export type PreventiveItem = typeof preventiveItems.$inferSelect;
export type InsertPreventiveItem = typeof preventiveItems.$inferInsert;

// ── Email Logs (Mesaje trimise) ──────────────────────────────────────────────────
export const emails = mysqlTable("emails", {
  id: varchar("id", { length: 36 }).primaryKey(),
  
  // Destinatar
  to: varchar("to", { length: 255 }).notNull(),
  from: varchar("from", { length: 255 }).notNull().default("contact@decorcarpi.it"),
  
  // Conținut
  subject: varchar("subject", { length: 255 }).notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  
  // Tip email
  type: mysqlEnum("type", ["contact", "preventivo", "confirmation", "admin_notification"]).notNull().default("contact"),
  
  // Status
  status: mysqlEnum("status", ["sent", "failed", "pending", "retry"]).notNull().default("pending"),
  
  // Metadata
  clientName: varchar("client_name", { length: 255 }),
  clientEmail: varchar("client_email", { length: 255 }),
  preventiveType: varchar("preventive_type", { length: 100 }),
  
  // Retry info
  retryCount: int("retry_count").notNull().default(0),
  lastError: text("last_error"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = typeof emails.$inferInsert;


// ── Push Notifications Subscriptions ────────────────────────────────────────────
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  isActive: mysqlBoolean("is_active").default(true).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// ── AI Usage Logging ──────────────────────────────────────────────────────────────────
export const aiUsage = mysqlTable("ai_usage", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }),
  userId: int("userId").references(() => users.id, { onDelete: "set null" }),
  modelUsed: varchar("modelUsed", { length: 64 }).notNull(), // render.generate, style_transfer
  costEstimated: int("costEstimated").notNull(), // cost in cents (e.g., 50 = $0.50)
  status: mysqlEnum("status", ["success", "failed"]).default("success").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index("idx_ai_usage_sessionId").on(table.sessionId),
  userIdIdx: index("idx_ai_usage_userId").on(table.userId),
  createdAtIdx: index("idx_ai_usage_createdAt").on(table.createdAt),
}));

export type AiUsage = typeof aiUsage.$inferSelect;
export type InsertAiUsage = typeof aiUsage.$inferInsert;

// ── Audit Logs ──────────────────────────────────────────────────────────────────
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 64 }).notNull(), // contact_submitted, email_sent, push_sent, retry_email, etc.
  entityType: varchar("entity_type", { length: 64 }), // contact, email, push_subscription, preventivo, etc.
  entityId: varchar("entity_id", { length: 128 }),
  details: json("details"), // JSON cu detalii acțiune
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("pending").notNull(),
  errorMessage: text("error_message"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ── Promo Codes (Coduri de activare) ────────────────────────────────────────────
export const promoCodes = mysqlTable("promo_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  generationsLimit: int("generationsLimit").notNull(), // -1 = unlimited
  generationsUsed: int("generationsUsed").default(0).notNull(),
  isActive: mysqlBoolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  createdBy: int("createdBy").references(() => users.id, { onDelete: "set null" }),
  notes: text("notes"), // descriere cod (ex: "20 generări", "nelimitat")
}, (table) => ({
  codeIdx: index("idx_promo_codes_code").on(table.code),
  isActiveIdx: index("idx_promo_codes_isActive").on(table.isActive),
}));

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;

// ── Session Promo Codes (Coduri aplicate pe sesiune) ────────────────────────────────────────────
export const sessionPromoCodes = mysqlTable("session_promo_codes", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  promoCodeId: int("promoCodeId").notNull().references(() => promoCodes.id, { onDelete: "cascade" }),
  generationsRemaining: int("generationsRemaining").notNull(), // copie din generationsLimit
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index("idx_session_promo_codes_sessionId").on(table.sessionId),
  promoCodeIdIdx: index("idx_session_promo_codes_promoCodeId").on(table.promoCodeId),
}));

export type SessionPromoCode = typeof sessionPromoCodes.$inferSelect;
export type InsertSessionPromoCode = typeof sessionPromoCodes.$inferInsert;
