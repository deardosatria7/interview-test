"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceWithItems } from "@/lib/types";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export default function InvoiceTable({
  invoices,
}: {
  invoices: InvoiceWithItems[];
}) {
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">List Invoice</h2>

        <Link
          href="/new-invoice"
          className="px-4 py-2 text-sm rounded bg-black text-white hover:bg-gray-900"
        >
          Create New Invoice
        </Link>
      </div>

      <Table>
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead>Invoice Number</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Issue Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center w-32">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>{inv.invoiceNumber}</TableCell>
              <TableCell>{inv.clientName}</TableCell>

              <TableCell>
                {new Date(inv.issueDate).toLocaleDateString("id-ID")}
              </TableCell>

              <TableCell>
                {new Date(inv.dueDate).toLocaleDateString("id-ID")}
              </TableCell>

              <TableCell>
                {Number(inv.totalAmount).toLocaleString("id-ID")}
              </TableCell>

              <TableCell>{inv.status}</TableCell>

              <TableCell>
                <div className="flex items-center justify-center gap-3">
                  <button className="hover:text-blue-600">
                    <Eye size={18} />
                  </button>
                  <button className="hover:text-green-600">
                    <Pencil size={18} />
                  </button>
                  <button className="hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
