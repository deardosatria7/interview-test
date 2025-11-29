import { db } from "@/db";
import { invoices, invoiceItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { InvoiceWithItems } from "@/lib/types";
import { notFound } from "next/navigation";
import BackButton from "@/components/back-button";
import InvoicePDFButton from "@/components/cetak-pdf";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;

  // 1️⃣ Fetch invoice
  const invoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!invoice[0]) {
    notFound();
  }

  const inv = invoice[0];

  // 2️⃣ Fetch invoice items
  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId));

  const invoiceWithItems: InvoiceWithItems = {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.clientName,
    clientAddress: inv.clientAddress,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    createdAt: inv.createdAt,
    totalAmount: inv.totalAmount.toString(),
    status: inv.status,
    invoiceItems: items.map((item) => ({
      id: item.id,
      invoiceId: item.invoiceId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      lineTotal: item.lineTotal.toString(),
    })),
  };

  return (
    <div className="flex flex-col gap-4 py-8 max-w-fit mx-auto w-full">
      <BackButton className="w-fit" />
      <div className="mx-auto p-6 space-y-6 border rounded-xl shadow-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            Invoice: {invoiceWithItems.invoiceNumber}
          </h1>
          <InvoicePDFButton invoice={invoiceWithItems} />
        </div>

        <div className="border rounded p-4 space-y-2">
          <p>
            <strong>Client:</strong> {invoiceWithItems.clientName}
          </p>
          <p>
            <strong>Address:</strong> {invoiceWithItems.clientAddress}
          </p>
          <p>
            <strong>Issue Date:</strong>{" "}
            {new Date(invoiceWithItems.issueDate).toLocaleDateString("id-ID")}
          </p>
          <p>
            <strong>Due Date:</strong>{" "}
            {new Date(invoiceWithItems.dueDate).toLocaleDateString("id-ID")}
          </p>
          <p>
            <strong>Status:</strong> {invoiceWithItems.status}
          </p>
          <p>
            <strong>Total Amount:</strong> Rp{" "}
            {Number(invoiceWithItems.totalAmount).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Invoice Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Qty</TableHead>
                <TableHead className="w-32">Unit Price</TableHead>
                <TableHead className="w-32">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceWithItems.invoiceItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    Rp {Number(item.unitPrice).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {Number(item.lineTotal).toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
