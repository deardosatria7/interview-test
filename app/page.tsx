import InvoiceTable from "@/components/invoice-table";
import { db } from "@/db";

export default async function HomePage() {
  const data = await db.query.invoices.findMany({
    with: {
      invoiceItems: true,
    },
    orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
  });

  return (
    <>
      <div className="max-w-6xl mx-auto py-4 px-2">
        <InvoiceTable invoices={data}></InvoiceTable>{" "}
      </div>
    </>
  );
}
