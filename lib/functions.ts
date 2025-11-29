// globally used functions

export function generateInvoiceNumber(last_invoice: string) {
  if (!last_invoice) return "INV/00001";

  // Pisahkan prefix dan angka
  const [prefix, numberPart] = last_invoice.split("/");

  // Konversi angka string → number
  const currentNumber = parseInt(numberPart, 10);

  // Tambah 1
  const nextNumber = currentNumber + 1;

  // Format kembali ke 5 digit (leading zeros)
  const padded = String(nextNumber).padStart(5, "0");

  return `${prefix}/${padded}`;
}
