// File: /dashboard/tax-certificates/page.tsx
import React from "react";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";

// Remove `export` from functions
async function getInvoices(userId: string) {
  return prisma.invoice.findMany({
    where: { userId },
    select: {
      id: true,
      clientName: true,
      total: true,
      createdAt: true, // This is a Date
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
      supplier: true, // supplier may be null
      quantity: true,
      stockRate: true,
      VAT: true,
      purchaseDate: true, // This is a Date
    },
    orderBy: { purchaseDate: "desc" },
  });
}

// Define types based on actual data
type InvoiceItem = {
  id: string;
  invoiceItemQuantity: number | null;
  invoiceItemRate: number | null;
  stockid: string | null;
};

type Invoice = {
  id: string;
  clientName: string | null;
  total: number;
  createdAt: Date;
  status: string | null;
  invoiceNumber: number | null;
  currency: string | null;
  invoiceItems: InvoiceItem[];
};

type Stock = {
  id: string;
  stockBarcode: string;
  stockName: string;
  supplier: string | null;
  quantity: number | null;
  stockRate: number | null;
  VAT: number | null;
  purchaseDate: Date | null;
};

export default async function TaxCertificatesPage() {
  const session = await requireUser();

  if (!session?.user?.id) {
    return <div>Unauthorized</div>;
  }

  const invoicesPromise = getInvoices(session.user.id);
  const stocks = await getStocks(session.user.id);
  const invoices = await invoicesPromise;

  // Compute total sales
  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);

  // Build a stock lookup map
  const stockMap = new Map<string, Stock>();
  stocks.forEach((stock) => {
    if (stock.id) stockMap.set(stock.id, stock);
  });

  // Compute total profit:
  let totalProfit = 0;
  invoices.forEach((inv) => {
    inv.invoiceItems.forEach((item) => {
      const qty = item.invoiceItemQuantity || 0;
      const sellingRate = item.invoiceItemRate || 0;
      const stock = item.stockid ? stockMap.get(item.stockid) : null;
      const purchaseRate = stock?.stockRate || 0;
      totalProfit += (sellingRate - purchaseRate) * qty;
    });
  });

  // Compute total VAT collected:
  let totalVAT = 0;
  invoices.forEach((inv) => {
    inv.invoiceItems.forEach((item) => {
      const qty = item.invoiceItemQuantity || 0;
      const stock = item.stockid ? stockMap.get(item.stockid) : null;
      if (stock && stock.VAT) {
        const purchaseRate = stock.stockRate || 0;
        totalVAT += (stock.VAT / 100) * purchaseRate * qty;
      }
    });
  });

  // Dynamically import the client component (with SSR disabled)
  const TaxCertificateClient = (await import("./TaxCertificateClient")).default;

  return (
    <TaxCertificateClient
      totalSales={totalSales}
      totalProfit={totalProfit}
      totalVAT={totalVAT}
    />
  );
}
