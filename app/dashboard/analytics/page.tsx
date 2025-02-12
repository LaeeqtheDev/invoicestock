// File: /dashboard/analytics/page.tsx
import React from "react";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import ClientAnalytics from "./ClientAnalytics";

function getInvoices(userId: string) {
  return prisma.invoice.findMany({
    where: { userId },
    select: {
      id: true,
      clientName: true,
      total: true,
      createdAt: true,
      status: true,
      invoiceNumber: true,
      currency: true,
      invoiceItems: {
        select: {
          id: true,
          invoiceItemQuantity: true,
          invoiceItemRate: true,
          stockid: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getStocks(userId: string) {
  return prisma.stock.findMany({
    where: { userId },
    select: {
      id: true,
      stockBarcode: true,
      stockName: true,
      supplier: true,
      quantity: true,
      stockRate: true,
      VAT: true,
      purchaseDate: true,
    },
    orderBy: { purchaseDate: "desc" },
  });
}

export default async function AnalyticsPage() {
  const session = await requireUser();

  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  const invoicesPromise = getInvoices(session.user.id);
  const stocks = await getStocks(session.user.id);
  const invoices = await invoicesPromise;

  return <ClientAnalytics rawInvoices={invoices} rawStocks={stocks} />;
}
