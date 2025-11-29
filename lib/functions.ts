// globally used functions

import { InvoiceFormValues, InvoiceWithItems } from "./types";

export function generateInvoiceNumber(last_invoice: string) {
  if (!last_invoice) return "INV/00001";

  // Pisahkan prefix dan angka
  const [prefix, numberPart] = last_invoice.split("/");

  // Konversi angka string → number
  const currentNumber = parseInt(numberPart, 10);

  // Tambah 1
  const nextNumber = currentNumber + 1;

  // Format kembali ke 5 digit (leading zeros)
  const padded = String(nextNumber).padStart(5, "0");

  return `${prefix}/${padded}`;
}

// convert tipe data dari InvoiceWithItems ke InvoiceFormValues
export function convertInvoiceWithItemsToInvoiceFormValues(
  data: InvoiceWithItems
): InvoiceFormValues {
  return {
    invoiceId: data.id,
    invoiceNumber: data.invoiceNumber,
    customerName: data.clientName,
    clientAddress: data.clientAddress,
    invoiceDate: formatDateToYYYYMMDD(data.createdAt),
    issueDate: data.issueDate,
    dueDate: data.dueDate,
    status: data.status,
    invoiceItems: data.invoiceItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      price: Number(item.unitPrice),
    })),
  };
}

export function formatDateToYYYYMMDD(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0"); // bulan dimulai dari 0
  const day = d.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}
