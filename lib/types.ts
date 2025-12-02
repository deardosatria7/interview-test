export type Invoice = {
  id: number;
  customerName: string;
  customerEmail: string | null;
  totalAmount: number;
  createdAt: Date;
};

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type InvoiceWithItems = {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  totalAmount: string;
  status: string;
  createdAt: Date;
  issueDate: string;
  dueDate: string;
  invoiceItems: InvoiceItem[];
};

export interface InvoiceItemForm {
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceFormValues {
  invoiceId?: string;
  invoiceNumber: string;
  customerName: string;
  clientAddress: string;
  invoiceDate: string;
  issueDate: string;
  dueDate: string;
  status: "Draft" | "Sent" | "Paid" | "Cancelled";
  invoiceItems: InvoiceItemForm[];
}
