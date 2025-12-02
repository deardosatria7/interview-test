"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import { generateInvoiceNumber } from "@/lib/functions";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { invoiceSchema } from "@/lib/zod-schema";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  createInvoiceAction,
  getLastInvoiceNumberAction,
} from "@/app/(actions)/invoices";

export default function NewInvoiceForm() {
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState("");
  const [loadingStates, setLoadingStates] = useState({
    fetchingLastInvoice: true,
    submittingInvoice: false,
  });

  const router = useRouter();

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      customerName: "",
      clientAddress: "",
      invoiceDate: "",
      issueDate: "",
      dueDate: "",
      status: "Draft",
      invoiceItems: [{ description: "", quantity: 1, price: 0 }],
    },
  });

  const {
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoiceItems",
  });

  const items = watch("invoiceItems");
  const totalAmount = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  // Fetch last invoice number
  useEffect(() => {
    async function fetchLastInvoice() {
      try {
        const { invoiceNumber } = await getLastInvoiceNumberAction();

        const newNumber = generateInvoiceNumber(invoiceNumber);

        setLastInvoiceNumber(newNumber);
        setValue("invoiceNumber", newNumber);
      } catch (error: any) {
        console.error("Failed to fetch last invoice number:", error);
        toast.error(error?.message ?? "Failed to fetch last invoice number!");
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          fetchingLastInvoice: false,
        }));
      }
    }

    fetchLastInvoice();
  }, [setValue]);

  async function onSubmit(data: z.infer<typeof invoiceSchema>) {
    try {
      setLoadingStates((prev) => ({ ...prev, submittingInvoice: true }));

      // langsung panggil server action, tidak pakai axios
      await createInvoiceAction(data);

      toast.success("Invoice berhasil disimpan!", {
        description: "Halaman akan di refresh otomatis...",
      });
      form.reset();
      setTimeout(() => {
        window.location.reload();
      }, 2000); // jeda sebelum refresh
    } catch (err: any) {
      console.error("Create invoice error:", err);
      toast.error(err?.message ?? "Terjadi kesalahan menyimpan invoice!");
    } finally {
      setLoadingStates((prev) => ({ ...prev, submittingInvoice: false }));
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 border rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6">Create New Invoice</h1>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* === Top Row === */}
          <div className="grid grid-cols-2 gap-6">
            {/* Invoice Number */}
            <FormField
              control={control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      value={
                        loadingStates.fetchingLastInvoice
                          ? "Loading..."
                          : field.value
                      }
                      className="bg-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice Date */}
            <FormField
              control={control}
              name="invoiceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* === Client Name === */}
          <FormField
            control={control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Max Verstappen" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* === Client Address === */}
          <FormField
            control={control}
            name="clientAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Address</FormLabel>
                <FormControl>
                  <Textarea {...field} className="h-24" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* === Dates Row === */}
          <div className="grid grid-cols-2 gap-6">
            {/* Issue Date */}
            <FormField
              name="issueDate"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              name="dueDate"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              name="status"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border w-full px-3 py-2 rounded bg-white"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ============================= */}
          {/*         ITEMS TABLE           */}
          {/* ============================= */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium">Items</h2>
              <Button
                type="button"
                onClick={() =>
                  append({ description: "", quantity: 1, price: 0 })
                }
              >
                Add Item
              </Button>
            </div>

            <table className="w-full border mt-3">
              <thead className="bg-gray-200 border-b">
                <tr>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border w-24">Qty</th>
                  <th className="p-2 border w-32">Price</th>
                  <th className="p-2 border w-32">Total</th>
                  <th className="p-2 border w-10" />
                </tr>
              </thead>

              <tbody>
                {fields.map((field, index) => {
                  const current = items[index];
                  const itemTotal = current.quantity * current.price;

                  return (
                    <tr key={field.id} className="border-b">
                      {/* Description */}
                      <td className="border p-2">
                        <Input
                          {...form.register(
                            `invoiceItems.${index}.description`
                          )}
                          placeholder="Item name"
                        />
                        {errors.invoiceItems?.[index]?.description && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.invoiceItems[index]?.description?.message}
                          </p>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="border p-2">
                        <Input
                          type="number"
                          {...form.register(`invoiceItems.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </td>

                      {/* Price */}
                      <td className="border p-2">
                        <Input
                          type="number"
                          {...form.register(`invoiceItems.${index}.price`, {
                            valueAsNumber: true,
                          })}
                          onWheel={(e) => e.currentTarget.blur()}
                        />
                      </td>

                      {/* Total */}
                      <td className="border p-2 text-right">
                        {itemTotal.toLocaleString("ID-id")}
                      </td>

                      {/* Delete */}
                      <td className="border p-2 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 p-2"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total Amount */}
          <div className="text-right mt-4">
            <div className="inline-block text-left">
              <div className="font-medium">Total Amount</div>
              <div className="text-2xl font-semibold">
                Rp {totalAmount.toLocaleString("ID-id")}
              </div>
            </div>
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={loadingStates.submittingInvoice}
          >
            {loadingStates.submittingInvoice ? "Saving..." : "Save Invoice"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
