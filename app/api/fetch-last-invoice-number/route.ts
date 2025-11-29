import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET() {
  try {
    const lastInvoice = await db.query.invoices.findFirst({
      columns: {
        invoiceNumber: true,
      },
      orderBy: (invoices, { desc }) => [desc(invoices.invoiceNumber)],
    });

    // Jika tidak ada data, return default invoice number
    if (!lastInvoice?.invoiceNumber) {
      return NextResponse.json({ invoiceNumber: "INV/00000" });
    }

    return NextResponse.json({
      invoiceNumber: lastInvoice.invoiceNumber,
    });
  } catch (error) {
    console.error("Error fetching last invoice number:", error);
    return NextResponse.json(
      { error: "Failed to fetch last invoice number" },
      { status: 500 }
    );
  }
}
