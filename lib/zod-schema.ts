import { z } from "zod";

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().min(1, "Quantity must be >= 1"),
  price: z.number().nonnegative("Price must be >= 0"),
});

export const invoiceSchema = z.object({
  invoiceId: z.string().optional().nullable(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  clientAddress: z.string(),
  invoiceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "invoiceDate must be YYYY-MM-DD"),
  issueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "issueDate must be YYYY-MM-DD"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dueDate must be YYYY-MM-DD"),
  // Jika kamu ingin membatasi status ke beberapa opsi, pakai z.enum.
  // Saya sertakan opsi umum — ubah/ tambah sesuai kebutuhan projectmu.
  status: z.enum(["Draft", "Sent", "Paid", "Cancelled"]),
  invoiceItems: z
    .array(invoiceItemSchema)
    .min(1, "At least one item is required"),
});
