import InvoiceTableClient from "@/components/invoice/invoice-data-table";
import Pagination from "@/components/pagination";
import SearchBar from "@/components/search-bar";
import { db } from "@/db";
import Link from "next/link";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const searchQuery =
    typeof params.search === "string" ? params.search.trim() : "";

  const page = params.page ? Number(params.page) : 1;
  const limit = params.limit ? Number(params.limit) : 3;

  const offset = (page - 1) * limit;

  // 1️⃣ Hitung total data
  const totalItems = (
    await db.query.invoices.findMany({
      columns: { id: true },
      where: searchQuery
        ? (invoices, { ilike }) =>
            ilike(invoices.invoiceNumber, `%${searchQuery}%`)
        : undefined,
    })
  ).length;

  // 2️⃣ Ambil data sesuai pagination
  const data = await db.query.invoices.findMany({
    with: {
      invoiceItems: true,
    },
    where: searchQuery
      ? (invoices, { ilike }) =>
          ilike(invoices.invoiceNumber, `%${searchQuery}%`)
      : undefined,
    orderBy: (invoices, { desc }) => [desc(invoices.invoiceNumber)],
    limit,
    offset,
  });

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* SearchBar jadi full width di mobile */}
        <div className="w-full sm:w-auto">
          <SearchBar />
        </div>

        {/* Button responsive */}
        <Link
          href="/new-invoice"
          className="w-full sm:w-auto text-center bg-black rounded-md text-white px-4 py-2 text-sm hover:bg-neutral-700 transition"
        >
          Create New Invoice
        </Link>
      </div>

      <InvoiceTableClient data={data} />

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
