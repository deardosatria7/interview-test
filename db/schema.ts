import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  timestamp,
  numeric,
  integer,
} from "drizzle-orm/pg-core";

// =============================
// ENUM untuk status invoice
// =============================
export const invoiceStatusEnum = [
  "Draft",
  "Sent",
  "Paid",
  "Cancelled",
] as const;

// =============================
// TABEL INVOICES
// =============================
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),

  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),

  clientName: varchar("client_name", { length: 200 }).notNull(),
  clientAddress: text("client_address").notNull(),

  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),

  totalAmount: numeric("total_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  status: varchar("status", { length: 20 }).notNull().default("Draft"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================
// TABEL INVOICE ITEMS
// =============================
export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),

  description: varchar("description", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
});

export const schema = {
  invoices,
  invoiceItems,
};
