import { db } from "@/db";
import { invoiceItems, invoices } from "@/db/schema";
import { invoiceSchema } from "@/lib/zod-schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // validate data sent by user
  const result = invoiceSchema.safeParse(await req.json());
  if (!result.success) {
    const formatted = result.error.flatten();
    const errorMessages = Object.entries(formatted.fieldErrors)
      .flatMap(
        ([field, messages]) => messages?.map((msg) => `${field}: ${msg}`) ?? []
      )
      .join(", ");

    console.error("Zod validation error:", errorMessages);

    return NextResponse.json(
      {
        success: false,
        error: errorMessages,
      },
      { status: 400 }
    );
  }

  const data = result.data;

  // insert ke table invoices terlebih dahulu
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

  // 2️⃣ Prepare data untuk insert invoice_items
  const dataToInsert = data.invoiceItems.map((item) => ({
    invoiceId: newInvoice.id, // camelCase sesuai schema
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.price.toFixed(2), // string untuk numeric
    lineTotal: (item.quantity * item.price).toFixed(2), // string untuk numeric
  }));

  // 3️⃣ Insert ke table invoice_items
  await db.insert(invoiceItems).values(dataToInsert);

  return NextResponse.json(
    { message: "Data berhasil ditambahkan!", success: true },
    { status: 200 }
  );
}

export async function PUT(req: NextRequest) {
  // 1️⃣ Parse body
  const body = await req.json();

  // Ambil id invoice yang akan diupdate
  const { invoiceId, ...dataWithoutId } = body;
  if (!invoiceId) {
    return NextResponse.json(
      { success: false, error: "Invoice ID is required" },
      { status: 400 }
    );
  }

  // 2️⃣ Validasi data
  const result = invoiceSchema.safeParse(dataWithoutId);
  if (!result.success) {
    const formatted = result.error.flatten();
    const errorMessages = Object.entries(formatted.fieldErrors)
      .flatMap(
        ([field, messages]) => messages?.map((msg) => `${field}: ${msg}`) ?? []
      )
      .join(", ");

    console.error("Zod validation error:", errorMessages);
    return NextResponse.json(
      { success: false, error: errorMessages },
      { status: 400 }
    );
  }

  const data = result.data;

  // 3️⃣ Update table invoices
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
    return NextResponse.json(
      { success: false, error: "Invoice not found" },
      { status: 404 }
    );
  }

  // 4️⃣ Hapus invoice_items lama

  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

  // 5️⃣ Insert invoice_items baru
  const dataToInsert = data.invoiceItems.map((item) => ({
    invoiceId: invoiceId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.price.toFixed(2),
    lineTotal: (item.quantity * item.price).toFixed(2),
  }));

  await db.insert(invoiceItems).values(dataToInsert);

  return NextResponse.json(
    { message: "Data berhasil diperbarui!", success: true },
    { status: 200 }
  );
}

export async function DELETE(req: NextRequest) {
  try {
    // Ambil invoiceId dari query string
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Hapus invoice_items terkait
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

    // 2️⃣ Hapus invoice utama
    const deleted = await db.delete(invoices).where(eq(invoices.id, invoiceId));

    if (deleted.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Invoice berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE invoice error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat menghapus invoice" },
      { status: 500 }
    );
  }
}
