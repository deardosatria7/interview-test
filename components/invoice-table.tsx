"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { InvoiceWithItems } from "@/lib/types";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import EditInvoiceForm from "./edit-invoice-form";
import { convertInvoiceWithItemsToInvoiceFormValues } from "@/lib/functions";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import InvoicePDFButton from "./cetak-pdf";

export default function InvoiceTable({
  invoices,
}: {
  invoices: InvoiceWithItems[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceWithItems | null>(null);
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] =
    useState<InvoiceWithItems | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleEditClick = (invoice: InvoiceWithItems) => {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedInvoice(null);
  };

  // open delete confirmation
  const handleDeleteClick = (invoice: InvoiceWithItems) => {
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    setLoadingDelete(true);
    try {
      await axios.delete(`/api/invoice-crud?invoiceId=${invoiceToDelete.id}`);
      toast.success("Invoice berhasil dihapus!");
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus invoice!");
    } finally {
      setLoadingDelete(false);
    }
  };

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
                  <Button asChild variant={"outline"}>
                    <Link
                      className="hover:text-blue-600"
                      href={`/invoice/${inv.id}`}
                    >
                      <Eye size={18} />
                    </Link>
                  </Button>
                  <Button
                    className="hover:text-green-600"
                    variant={"outline"}
                    onClick={() => handleEditClick(inv)}
                  >
                    <Pencil size={18} />
                  </Button>
                  <InvoicePDFButton invoice={inv} buttonSize="small" />
                  <Button
                    className="hover:text-black"
                    variant={"destructive"}
                    onClick={() => handleDeleteClick(inv)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Invoice Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full md:max-w-[80%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <EditInvoiceForm
              data={convertInvoiceWithItemsToInvoiceFormValues(selectedInvoice)}
              onSuccess={handleDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="w-xl">
          <DialogHeader>
            <DialogTitle>Hapus Invoice?</DialogTitle>
          </DialogHeader>
          <p className="mt-2">
            Apakah Anda yakin ingin menghapus invoice{" "}
            <strong>{invoiceToDelete?.invoiceNumber}</strong> ini? Tindakan ini
            tidak bisa dibatalkan.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
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
    </div>
  );
}
