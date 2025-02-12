// File: app/serverActions/invoice.ts
"use server";

import prisma from "./utils/db";
import { requireUser } from "./utils/hooks";
import { invoiceSchema } from "./utils/zodSchema";

/**
 * Creates an Invoice from a FormData object.
 * We expect the form to include a field "invoiceData" which is a JSON string
 * representing the invoice data.
 */
export async function createInvoice(formData: FormData) {
  const session = await requireUser();
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }

  // Extract the JSON string from the FormData.
  const invoiceDataString = formData.get("invoiceData")?.toString();
  if (!invoiceDataString) {
    throw new Error("No invoiceData provided");
  }

  // Parse the JSON and validate against the schema.
  let parsedInvoice;
  try {
    parsedInvoice = JSON.parse(invoiceDataString);
  } catch (e) {
    throw new Error("Invalid JSON data");
  }

  const parsed = invoiceSchema.safeParse(parsedInvoice);
  if (!parsed.success) {
    console.error("Invoice validation errors:", parsed.error.format());
    throw new Error("Invoice validation failed");
  }
  const invoiceData = parsed.data;

  // Create the Invoice in the database.
  const invoice = await prisma.invoice.create({
    data: {
      userId: session.user.id, // Ensure user ID is correctly assigned
      invoiceName: invoiceData.invoiceName,
      total: invoiceData.total,
      status: invoiceData.status,
      date: new Date(invoiceData.date),
      fromName: invoiceData.fromName,
      fromEmail: invoiceData.fromEmail,
      fromAddress: invoiceData.fromAddress,
      clientName: invoiceData.clientName,
      clientEmail: invoiceData.clientEmail,
      clientAddress: invoiceData.clientAddress,
      currency: invoiceData.currency,
      invoiceNumber: invoiceData.invoiceNumber,
      note: invoiceData.note,
      invoiceItems: {
        create: invoiceData.invoiceItems.map((item) => {
          if (!item.stockid) {
            throw new Error("Stock ID is required for every invoice item");
          }
          return {
            stockid: item.stockid,
            invoiceItemQuantity: item.invoiceItemQuantity!,
            invoiceItemRate: item.invoiceItemRate,
          };
        }),
      },
    },
  });

  return invoice;
}
