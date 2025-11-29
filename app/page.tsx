import InvoiceTable from "@/components/invoice-table";
import SearchBar from "@/components/search-bar";
import { db } from "@/db";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const searchQuery =
    typeof params.search === "string" ? params.search.trim() : "";

  const data = await db.query.invoices.findMany({
    with: {
      invoiceItems: true,
    },
    where: searchQuery
      ? (invoices, { ilike }) =>
          ilike(invoices.invoiceNumber, `%${searchQuery}%`)
      : undefined,
    orderBy: (invoices, { desc }) => [desc(invoices.invoiceNumber)],
  });

  return (
    <div className="max-w-6xl mx-auto py-4 px-2 space-y-4">
      <SearchBar />
      <InvoiceTable invoices={data} />
    </div>
  );
}
