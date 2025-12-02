"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { InvoiceWithItems } from "@/lib/types";
import { DataTable } from "./data-table";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import InvoicePDFButton from "./cetak-pdf";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import EditInvoiceForm from "./edit-invoice-form";
import { convertInvoiceWithItemsToInvoiceFormValues } from "@/lib/functions";

import { deleteInvoiceAction } from "@/app/(actions)/invoices";
import { toast } from "sonner";

// ========================================================
// INVOICE TABLE CLIENT
// ========================================================

export default function InvoiceTableClient({
  data,
}: {
  data: InvoiceWithItems[];
}) {
  const router = useRouter();

  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceWithItems | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [invoiceToDelete, setInvoiceToDelete] =
    useState<InvoiceWithItems | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // ------------------------
  // Handlers
  // ------------------------

  const handleEditClick = (invoice: InvoiceWithItems) => {
    setSelectedInvoice(invoice);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (invoice: InvoiceWithItems) => {
    setInvoiceToDelete(invoice);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    setLoadingDelete(true);
    try {
      await deleteInvoiceAction(invoiceToDelete.id);
      toast.success("Invoice berhasil dihapus!");
      setIsDeleteOpen(false);
      setInvoiceToDelete(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus invoice!");
    } finally {
      setLoadingDelete(false);
    }
  };

  // ------------------------
  // COLUMNS (TANSTACK TABLE)
  // ------------------------

  const columns: ColumnDef<InvoiceWithItems>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice Number",
    },
    {
      accessorKey: "clientName",
      header: "Client",
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }) =>
        new Date(row.original.issueDate).toLocaleDateString("id-ID"),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) =>
        new Date(row.original.dueDate).toLocaleDateString("id-ID"),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) =>
        `Rp ${Number(row.original.totalAmount).toLocaleString("id-ID")}`,
    },
    {
      accessorKey: "status",
      header: "Status",
    },

    // =========================================
    //              ACTION COLUMN
    // =========================================
    {
      id: "actions",
      header: () => <div className="text-center w-32">Actions</div>,
      cell: ({ row }) => {
        const inv = row.original;

        return (
          <div className="flex items-center justify-center gap-2">
            <Button asChild variant="outline" size="icon">
              <Link href={`/invoice/${inv.id}`}>
                <Eye size={18} />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleEditClick(inv)}
            >
              <Pencil size={18} />
            </Button>

            <InvoicePDFButton invoice={inv} buttonSize="small" />

            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteClick(inv)}
            >
              <Trash2 size={18} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data} />

      {/* ============================
          EDIT DIALOG
      ============================ */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-full md:max-w-[80%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <EditInvoiceForm
              data={convertInvoiceWithItemsToInvoiceFormValues(selectedInvoice)}
              onSuccess={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ============================
          DELETE DIALOG
      ============================ */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Invoice?</DialogTitle>
          </DialogHeader>

          <p className="mt-2">
            Apakah Anda yakin ingin menghapus invoice{" "}
            <strong>{invoiceToDelete?.invoiceNumber}</strong>? Tindakan ini
            tidak bisa dibatalkan.
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={loadingDelete}
            >
              Batal
            </Button>

            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loadingDelete}
            >
              {loadingDelete ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
