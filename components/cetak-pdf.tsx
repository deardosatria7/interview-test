"use client";

import { InvoiceWithItems } from "@/lib/types";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export default function InvoicePDFButton({
  invoice,
}: {
  invoice: InvoiceWithItems;
}) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // ======================
    // Header
    // ======================
    doc.setFontSize(22);
    doc.setTextColor("#333333");
    doc.text("INVOICE", 14, 20);

    doc.setFontSize(12);
    doc.setTextColor("#555555");
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 30);
    doc.text(
      `Issue Date: ${new Date(invoice.issueDate).toLocaleDateString("id-ID")}`,
      14,
      36
    );
    doc.text(
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString("id-ID")}`,
      14,
      42
    );
    doc.text(`Status: ${invoice.status}`, 14, 48);

    // ======================
    // Client Info Box
    // ======================
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(120, 30, 70, 25, "FD"); // x, y, width, height, Fill+Draw
    doc.setTextColor("#000000");
    doc.text(`Client: ${invoice.clientName}`, 122, 38);
    doc.text(`Address: ${invoice.clientAddress}`, 122, 44);
    doc.text(
      `Total: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}`,
      122,
      50
    );

    // ======================
    // Table
    // ======================
    const startY = 70;
    autoTable(doc, {
      startY,
      head: [["Description", "Qty", "Unit Price", "Line Total"]],
      body: invoice.invoiceItems.map((item) => [
        item.description,
        item.quantity.toString(),
        `Rp ${Number(item.unitPrice).toLocaleString("id-ID")}`,
        `Rp ${Number(item.lineTotal).toLocaleString("id-ID")}`,
      ]),
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      theme: "grid",
    });

    // ======================
    // Footer Total
    // ======================
    const finalY = (doc as any).lastAutoTable?.finalY || startY + 20;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      `TOTAL: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}`,
      150,
      finalY + 10,
      { align: "right" }
    );

    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  return (
    <Button className="mt-4" onClick={generatePDF}>
      Cetak PDF
    </Button>
  );
}
