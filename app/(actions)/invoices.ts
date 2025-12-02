"use server";

import { db } from "@/db";
import { invoiceItems, invoices } from "@/db/schema";
import { invoiceSchema } from "@/lib/zod-schema";
import { eq } from "drizzle-orm";
import z from "zod";

export async function createInvoiceAction(
  formData: z.infer<typeof invoiceSchema>
) {
  // Validate data
  const result = invoiceSchema.safeParse(formData);

  if (!result.success) {
    const formatted = result.error.flatten();
    const errorMessages = Object.entries(formatted.fieldErrors)
      .flatMap(
        ([field, messages]) => messages?.map((msg) => `${field}: ${msg}`) ?? []
      )
      .join(", ");

    console.error("Zod validation error:", errorMessages);
    throw new Error(errorMessages);
  }

  const data = result.data;

  // Insert invoice utama
  const [newInvoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber: data.invoiceNumber,
      clientName: data.customerName,
      clientAddress: data.clientAddress,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      createdAt: new Date(data.invoiceDate),
      totalAmount: data.invoiceItems
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2),
      status: data.status,
    })
    .returning();

  // Siapkan data untuk invoice_items
  const itemsToInsert = data.invoiceItems.map((item) => ({
    invoiceId: newInvoice.id,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.price.toFixed(2),
    lineTotal: (item.quantity * item.price).toFixed(2),
  }));

  // Insert invoice_items
  await db.insert(invoiceItems).values(itemsToInsert);

  return {
    success: true,
    message: "Data berhasil ditambahkan!",
    invoiceId: newInvoice.id,
  };
}

export async function updateInvoiceAction(
  formData: z.infer<typeof invoiceSchema>
) {
  // Extract invoiceId terlebih dahulu
  const { invoiceId, ...dataWithoutId } = formData as any;

  if (!invoiceId) {
    console.error("Invoice ID is required");
    throw new Error("Invoice ID is required");
  }

  // Validasi field lain
  const result = invoiceSchema.safeParse(dataWithoutId);

  if (!result.success) {
    const formatted = result.error.flatten();
    const errorMessages = Object.entries(formatted.fieldErrors)
      .flatMap(
        ([field, messages]) => messages?.map((msg) => `${field}: ${msg}`) ?? []
      )
      .join(", ");

    console.error("Zod validation error:", errorMessages);
    throw new Error(errorMessages);
  }

  const data = result.data;

  // Update invoice utama
  const [updatedInvoice] = await db
    .update(invoices)
    .set({
      invoiceNumber: data.invoiceNumber,
      clientName: data.customerName,
      clientAddress: data.clientAddress,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      createdAt: new Date(data.invoiceDate),
      totalAmount: data.invoiceItems
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2),
      status: data.status,
    })
    .where(eq(invoices.id, invoiceId))
    .returning();

  if (!updatedInvoice) {
    console.error("Invoice not found:", invoiceId);
    throw new Error("Invoice not found");
  }

  // Hapus semua invoice_items lama
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

  // Insert invoice_items baru
  const dataToInsert = data.invoiceItems.map((item) => ({
    invoiceId: invoiceId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.price.toFixed(2),
    lineTotal: (item.quantity * item.price).toFixed(2),
  }));

  await db.insert(invoiceItems).values(dataToInsert);

  return {
    success: true,
    message: "Data berhasil diperbarui!",
    invoiceId,
  };
}

export async function deleteInvoiceAction(invoiceId: string) {
  if (!invoiceId) {
    throw new Error("Invoice ID is required");
  }

  // 1️⃣ Hapus invoice_items terkait
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

  // 2️⃣ Hapus invoice utama
  const deleted = await db.delete(invoices).where(eq(invoices.id, invoiceId));

  // Jika tidak ada row yang dihapus
  if (deleted.rowCount === 0) {
    throw new Error("Invoice not found");
  }

  return {
    success: true,
    message: "Invoice berhasil dihapus",
  };
}

export async function getLastInvoiceNumberAction() {
  // Query data
  const lastInvoice = await db.query.invoices.findFirst({
    columns: {
      invoiceNumber: true,
    },
    orderBy: (invoices, { desc }) => [desc(invoices.invoiceNumber)],
  });

  // Jika tidak ada invoice sebelumnya
  if (!lastInvoice?.invoiceNumber) {
    return { invoiceNumber: "INV/00000" };
  }

  return {
    invoiceNumber: lastInvoice.invoiceNumber,
  };
}
