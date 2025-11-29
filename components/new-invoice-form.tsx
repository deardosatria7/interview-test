"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import { generateInvoiceNumber } from "@/lib/functions";
import axios from "axios";
import { toast } from "sonner";
import { InvoiceFormValues } from "@/lib/types";
import { Trash } from "lucide-react";

export default function NewInvoiceForm() {
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm<InvoiceFormValues>({
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoiceItems",
  });

  const items = watch("invoiceItems");

  const totalAmount = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  // ======================
  // Fetch last invoice number
  // ======================
  useEffect(() => {
    async function fetchLastInvoice() {
      try {
        const response = await axios.get("/api/fetch-last-invoice-number");
        const lastInvoiceNumber: string = response.data.invoiceNumber;

        const newNumber = generateInvoiceNumber(lastInvoiceNumber);

        setLastInvoiceNumber(newNumber);
        setValue("invoiceNumber", newNumber);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch last invoice number!");
      }
    }

    fetchLastInvoice();
  }, [setValue]);

  // ======================
  // Handle Submit
  // ======================
  const onSubmit = async (data: InvoiceFormValues) => {
    console.log("DATA TO SUBMIT:", data);
    alert("Invoice created! (dummy)");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Create New Invoice</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Top Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Invoice Number */}
          <div>
            <label className="font-medium">Invoice Number</label>
            <input
              {...register("invoiceNumber", {
                required: "Invoice number is required",
              })}
              readOnly
              className="border w-full px-3 py-2 mt-1 rounded bg-gray-100"
            />
            {errors.invoiceNumber && (
              <p className="text-red-500 text-sm">
                {errors.invoiceNumber.message}
              </p>
            )}
          </div>

          {/* Invoice Date */}
          <div>
            <label className="font-medium">Invoice Date</label>
            <input
              type="date"
              {...register("invoiceDate", {
                required: "Invoice date is required",
              })}
              className="border w-full px-3 py-2 mt-1 rounded"
            />
            {errors.invoiceDate && (
              <p className="text-red-500 text-sm">
                {errors.invoiceDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Client Name */}
        <div>
          <label className="font-medium">Client Name</label>
          <input
            {...register("customerName", {
              required: "Client name is required",
            })}
            className="border w-full px-3 py-2 mt-1 rounded"
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm">
              {errors.customerName.message}
            </p>
          )}
        </div>

        {/* Client Address */}
        <div>
          <label className="font-medium">Client Address</label>
          <textarea
            {...register("clientAddress", {
              required: "Client address is required",
            })}
            className="border w-full px-3 py-2 mt-1 rounded h-24"
          />
          {errors.clientAddress && (
            <p className="text-red-500 text-sm">
              {errors.clientAddress.message}
            </p>
          )}
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Issue Date */}
          <div>
            <label className="font-medium">Issue Date</label>
            <input
              type="date"
              {...register("issueDate", { required: "Issue date is required" })}
              className="border w-full px-3 py-2 mt-1 rounded"
            />
            {errors.issueDate && (
              <p className="text-red-500 text-sm">{errors.issueDate.message}</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="font-medium">Due Date</label>
            <input
              type="date"
              {...register("dueDate", { required: "Due date is required" })}
              className="border w-full px-3 py-2 mt-1 rounded"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm">{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Items</h2>
            <button
              type="button"
              onClick={() => append({ description: "", quantity: 1, price: 0 })}
              className="px-3 py-2 bg-blue-600 text-white rounded"
            >
              Add Item
            </button>
          </div>

          <table className="w-full border mt-3">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="p-2 border">Description</th>
                <th className="p-2 border w-24">Qty</th>
                <th className="p-2 border w-32">Price per unit</th>
                <th className="p-2 border w-32">Total</th>
                <th className="p-2 border w-16"></th>
              </tr>
            </thead>

            <tbody>
              {fields.map((field, index) => {
                const items = watch("invoiceItems");
                const itemTotal =
                  (items?.[index]?.quantity || 0) *
                  (items?.[index]?.price || 0);

                return (
                  <tr key={field.id} className="border-b">
                    {/* Description */}
                    <td className="border p-2">
                      <input
                        {...register(`invoiceItems.${index}.description`, {
                          required: "Required",
                        })}
                        className="w-full px-2 py-1 border rounded"
                      />
                      {errors.invoiceItems?.[index]?.description && (
                        <p className="text-red-500 text-xs">
                          {errors.invoiceItems[index]?.description?.message}
                        </p>
                      )}
                    </td>

                    {/* Qty */}
                    <td className="border p-2">
                      <input
                        type="number"
                        {...register(`invoiceItems.${index}.quantity`, {
                          valueAsNumber: true,
                          required: "Required",
                        })}
                        className="w-full px-2 py-1 border rounded"
                      />
                      {errors.invoiceItems?.[index]?.quantity && (
                        <p className="text-red-500 text-xs">
                          {errors.invoiceItems[index]?.quantity?.message}
                        </p>
                      )}
                    </td>

                    {/* Price */}
                    <td className="border p-2">
                      <input
                        type="number"
                        {...register(`invoiceItems.${index}.price`, {
                          valueAsNumber: true,
                          required: "Required",
                        })}
                        className="w-full px-2 py-1 border rounded"
                      />
                      {errors.invoiceItems?.[index]?.price && (
                        <p className="text-red-500 text-xs">
                          {errors.invoiceItems[index]?.price?.message}
                        </p>
                      )}
                    </td>

                    {/* Total */}
                    <td className="border p-2 text-right">
                      Rp {itemTotal.toLocaleString()}
                    </td>

                    {/* Delete */}
                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-600 p-3 rounded-md bg-neutral-100 hover:cursor-pointer"
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
              {totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 mt-6 bg-green-600 text-white rounded text-lg"
        >
          Save Invoice
        </button>
      </form>
    </div>
  );
}
