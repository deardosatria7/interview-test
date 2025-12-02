"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import type { InvoiceFormValues } from "@/lib/types";
import { updateInvoiceAction } from "@/app/(actions)/invoices";

interface EditInvoiceFormProps {
  data: InvoiceFormValues;
  onSuccess: () => void;
}

export default function EditInvoiceForm({
  data,
  onSuccess,
}: EditInvoiceFormProps) {
  const [loadingStates, setLoadingStates] = useState({
    submittingInvoice: false,
  });
  const router = useRouter();

  const form = useForm<InvoiceFormValues>({
    defaultValues: data,
  });

  const { handleSubmit, control, watch } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoiceItems",
  });

  const items = watch("invoiceItems");
  const totalAmount = items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const onSubmit = async (data: InvoiceFormValues) => {
    try {
      setLoadingStates((prev) => ({ ...prev, submittingInvoice: true }));

      // langsung panggil server action, tidak pakai axios
      await updateInvoiceAction(data);

      toast.success("Invoice berhasil diedit!");
      router.refresh();
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan menyimpan invoice!");
    } finally {
      setLoadingStates((prev) => ({ ...prev, submittingInvoice: false }));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Top Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Invoice Number */}
          <FormField
            control={control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Number</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-muted text-sm" />
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
                <FormLabel>Invoice Date*</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Client Name */}
        <FormField
          control={control}
          name="customerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name*</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Max Verstappen" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Client Address */}
        <FormField
          control={control}
          name="clientAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Address*</FormLabel>
              <FormControl>
                <Textarea
                  className="h-24"
                  placeholder="Input address here"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dates Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Issue Date */}
          <FormField
            control={control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date*</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Due Date */}
          <FormField
            control={control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date*</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status*</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Items Table */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Items</h2>

            <Button
              type="button"
              onClick={() => append({ description: "", quantity: 1, price: 0 })}
            >
              Add Item
            </Button>
          </div>

          <table className="w-full border rounded-md overflow-hidden">
            <thead className="bg-muted border-b">
              <tr>
                <th className="p-2 border">Description</th>
                <th className="p-2 border w-24">Qty</th>
                <th className="p-2 border w-32">Price</th>
                <th className="p-2 border w-32">Total</th>
                <th className="p-2 border w-10"></th>
              </tr>
            </thead>

            <tbody>
              {fields.map((field, index) => {
                const item = items[index] ?? { quantity: 0, price: 0 };
                const itemTotal = item.quantity * item.price;

                return (
                  <tr key={field.id} className="border-b">
                    {/* Description */}
                    <td className="border p-2 align-top">
                      <FormField
                        control={control}
                        name={`invoiceItems.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} placeholder="Item name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>

                    {/* Quantity */}
                    <td className="border p-2 align-top">
                      <FormField
                        control={control}
                        name={`invoiceItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onWheel={(e) => e.currentTarget.blur()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>

                    {/* Price */}
                    <td className="border p-2 align-top">
                      <FormField
                        control={control}
                        name={`invoiceItems.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onWheel={(e) => e.currentTarget.blur()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </td>

                    {/* Total */}
                    <td className="border p-2 text-right align-top">
                      {itemTotal.toLocaleString("ID-id")}
                    </td>

                    {/* Remove */}
                    <td className="border p-2 text-center align-top">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total Amount */}
        <div className="text-right mt-6">
          <div className="inline-block text-left">
            <div className="font-medium">Total Amount</div>
            <div className="text-2xl font-semibold">
              Rp {totalAmount.toLocaleString("ID-id")}
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={loadingStates.submittingInvoice}
        >
          {loadingStates.submittingInvoice ? "Saving..." : "Save Invoice"}
        </Button>
      </form>
    </Form>
  );
}
