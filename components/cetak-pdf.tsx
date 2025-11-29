"use client";

import { InvoiceWithItems } from "@/lib/types";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import { Printer } from "lucide-react";

interface InvoicePDFButtonProps {
  invoice: InvoiceWithItems;
  buttonSize?: "small" | "normal"; // tambah props
}

export default function InvoicePDFButton({
  invoice,
  buttonSize = "normal",
}: InvoicePDFButtonProps) {
  const generatePDF = () => {
    const doc = new jsPDF("l", "mm", "a5"); // portrait, mm, A5
    const pageWidth = doc.internal.pageSize.getWidth();

    // ======================
    // Header
    // ======================
    doc.setFontSize(22);
    doc.setTextColor("#1e3a8a"); // navy-blue header
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 20);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 23, pageWidth - 14, 23); // garis bawah header

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#333333");
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
    const clientBoxX = 120;
    const clientBoxY = 30;
    const clientBoxWidth = pageWidth - clientBoxX - 14;
    const clientBoxHeight = 25;

    doc.setFillColor(240, 248, 255); // light blue
    doc.roundedRect(
      clientBoxX,
      clientBoxY,
      clientBoxWidth,
      clientBoxHeight,
      3,
      3,
      "FD"
    );
    doc.setTextColor("#000000");
    doc.setFont("helvetica", "bold");
    doc.text(`Client: ${invoice.clientName}`, clientBoxX + 2, clientBoxY + 7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Address: ${invoice.clientAddress}`,
      clientBoxX + 2,
      clientBoxY + 13
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}`,
      clientBoxX + 2,
      clientBoxY + 19
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
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
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
    const footerWidth = pageWidth - 28;

    doc.setFillColor(230, 230, 250); // light lavender
    doc.roundedRect(14, finalY + 5, footerWidth, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1e3a8a");
    doc.text(
      `TOTAL: Rp ${Number(invoice.totalAmount).toLocaleString("id-ID")}`,
      pageWidth - 16,
      finalY + 13,
      { align: "right" }
    );

    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  return buttonSize === "small" ? (
    <Button
      variant="default"
      size="icon"
      onClick={generatePDF}
      title="Cetak PDF"
    >
      <Printer size={16} />
    </Button>
  ) : (
    <Button className="mt-4" onClick={generatePDF}>
      Cetak PDF
    </Button>
  );
}
