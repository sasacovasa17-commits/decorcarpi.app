/**
 * Email Schema - Drizzle ORM
 * Tabel pentru salvare email-uri trimise (contact, preventivo, etc.)
 */

import { mysqlTable, varchar, text, timestamp, enum as mysqlEnum, int } from "drizzle-orm/mysql-core";

export const emails = mysqlTable("emails", {
  id: varchar("id", { length: 36 }).primaryKey().default(() => crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9)),
  
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sentAt: timestamp("sent_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;
