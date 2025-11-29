import BackButton from "@/components/back-button";
import NewInvoiceForm from "@/components/new-invoice-form";

export default function NewInvoicePage() {
  return (
    <>
      <div className="flex flex-col gap-4 py-8 mx-auto max-w-2xl w-full">
        <BackButton className="w-fit" />
        <NewInvoiceForm />
      </div>
    </>
  );
}
