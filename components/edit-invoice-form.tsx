"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import type { InvoiceFormValues } from "@/lib/types";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditInvoiceFormProps {
  data: InvoiceFormValues;
  onSuccess?: () => void;
}

export default function EditInvoiceForm({
  data,
  onSuccess,
}: EditInvoiceFormProps) {
  const [loadingStates, setLoadingStates] = useState({
    submittingInvoice: false,
  });
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    watch,
  } = useForm<InvoiceFormValues>({
    defaultValues: data,
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

  const onSubmit = async (formData: InvoiceFormValues) => {
    console.log("Submitted response:", formData);

    try {
      setLoadingStates((prev) => ({ ...prev, submittingInvoice: true }));
      const response = await axios.put(`/api/invoice-crud`, formData);
      toast.success(response.data.message);
      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan menyimpan invoice!");
    } finally {
      setLoadingStates((prev) => ({ ...prev, submittingInvoice: false }));
    }
  };

  return (
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
            className="border w-full px-3 py-2 mt-1 rounded bg-gray-100 text-sm"
          />
          {errors.invoiceNumber && (
            <p className="text-red-500 text-sm">
              {errors.invoiceNumber.message}
            </p>
          )}
        </div>
        {/* Invoice Date */}
        <div>
          <label className="font-medium">
            Invoice Date<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("invoiceDate", {
              required: "Invoice date is required",
            })}
            className="border w-full px-3 py-2 mt-1 rounded"
          />
          {errors.invoiceDate && (
            <p className="text-red-500 text-sm">{errors.invoiceDate.message}</p>
          )}
        </div>
      </div>

      {/* Client Name */}
      <div>
        <label className="font-medium">
          Client Name<span className="text-red-500">*</span>
        </label>
        <input
          {...register("customerName", {
            required: "Client name is required",
          })}
          className="border w-full px-3 py-2 mt-1 rounded"
        />
        {errors.customerName && (
          <p className="text-red-500 text-sm">{errors.customerName.message}</p>
        )}
      </div>

      {/* Client Address */}
      <div>
        <label className="font-medium">
          Client Address<span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("clientAddress", {
            required: "Client address is required",
          })}
          className="border w-full px-3 py-2 mt-1 rounded h-24"
        />
        {errors.clientAddress && (
          <p className="text-red-500 text-sm">{errors.clientAddress.message}</p>
        )}
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Issue Date */}
        <div>
          <label className="font-medium">
            Issue Date<span className="text-red-500">*</span>
          </label>
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
          <label className="font-medium">
            Due Date<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("dueDate", { required: "Due date is required" })}
            className="border w-full px-3 py-2 mt-1 rounded"
          />
          {errors.dueDate && (
            <p className="text-red-500 text-sm">{errors.dueDate.message}</p>
          )}
        </div>
        {/* Status */}
        <div>
          <label className="font-medium">
            Status<span className="text-red-500">*</span>
          </label>
          <select
            {...register("status", { required: "Wajib diisi" })}
            className="border w-full px-3 py-2 mt-1 rounded bg-white"
          >
            <option value="">-- Pilih Status --</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {errors.status && (
            <p className="text-red-500 text-sm">{errors.status.message}</p>
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
                (items?.[index]?.quantity || 0) * (items?.[index]?.price || 0);
              return (
                <tr key={field.id} className="border-b">
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
                  <td className="border p-2">
                    <input
                      type="number"
                      {...register(`invoiceItems.${index}.quantity`, {
                        valueAsNumber: true,
                        required: "Required",
                      })}
                      className="w-full px-2 py-1 border rounded"
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                    {errors.invoiceItems?.[index]?.quantity && (
                      <p className="text-red-500 text-xs">
                        {errors.invoiceItems[index]?.quantity?.message}
                      </p>
                    )}
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      {...register(`invoiceItems.${index}.price`, {
                        valueAsNumber: true,
                        required: "Required",
                      })}
                      className="w-full px-2 py-1 border rounded"
                      onWheel={(e) => e.currentTarget.blur()}
                    />
                    {errors.invoiceItems?.[index]?.price && (
                      <p className="text-red-500 text-xs">
                        {errors.invoiceItems[index]?.price?.message}
                      </p>
                    )}
                  </td>
                  <td className="border p-2 text-right">
                    {itemTotal.toLocaleString("ID-id")}
                  </td>
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
            Rp {totalAmount.toLocaleString("ID-id")}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3 mt-6 bg-green-600 text-white rounded text-lg"
        disabled={loadingStates.submittingInvoice}
      >
        {loadingStates.submittingInvoice ? "Saving..." : "Save Invoice"}
      </button>
    </form>
  );
}
