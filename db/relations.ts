import { relations } from "drizzle-orm";
import { invoices, invoiceItems } from "./schema";

export const invoiceRelations = relations(invoices, ({ many }) => ({
  invoiceItems: many(invoiceItems),
}));

export const invoiceItemRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));
