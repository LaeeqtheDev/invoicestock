// File: app/serverActions/invoiceReturnAction.ts
"use server";

import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
// Optionally, import and use a Zod schema to validate the return data
// import { invoiceReturnSchema } from "@/app/utils/zodSchema";

export interface InvoiceReturnData {
  invoiceName: string;
  total: number;
  status: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  currency: string;
  invoiceNumber: number;
  note: string;
  invoiceItems: {
    stockid: string;
    invoiceItemQuantity: number; // the quantity being returned
    invoiceItemRate: number;
  }[];
}

export async function returnInvoiceAction(
  invoiceId: string,
  invoiceData: InvoiceReturnData,
) {
  // Ensure the user is authenticated.
  const session = await requireUser();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  // (Optional) Validate invoiceData using your Zod schema:
  // const parsed = invoiceReturnSchema.safeParse(invoiceData);
  // if (!parsed.success) throw new Error("Invoice return validation failed");

  // Update the invoice's status to "RETURNED" (or "PARTIALLY_RETURNED" as needed)
  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "RETURNED" },
  });

  // For each returned invoice item, update the corresponding stock:
  for (const item of invoiceData.invoiceItems) {
    // Increment the stock's quantity by the returned quantity.
    // (You may wish to validate that the returned quantity is <= the original invoiced quantity.)
    await prisma.stock.update({
      where: { id: item.stockid },
      data: {
        quantity: {
          increment: item.invoiceItemQuantity,
        },
      },
    });
  }

  return updatedInvoice;
}
