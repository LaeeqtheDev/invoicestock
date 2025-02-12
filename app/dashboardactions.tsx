// app/dashboardactions.tsx
"use server";

import prisma from "@/app/utils/db";

import { InvoiceStatus } from "@prisma/client";

// ...

export async function getInvoices(userId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { userId },
    select: {
      id: true,
      clientName: true,
      total: true,
      createdAt: true,
      status: true, // Use this field to determine payment status.
      invoiceNumber: true,
      currency: true,
      invoiceItems: {
        select: {
          id: true,
          invoiceItemQuantity: true,
          invoiceItemRate: true,
          stockid: true, // ensure your model includes this
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return invoices;
}

/**
 * Fetch stocks (purchase data) for a given user.
 */
export async function getStocks(userId: string) {
  const stocks = await prisma.stock.findMany({
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
    orderBy: {
      purchaseDate: "desc",
    },
  });
  return stocks;
}

/**
 * Combine invoices and stocks to compute aggregated transactions.
 * - Sale transactions are built from invoice items.
 * - Purchase transactions are built directly from stocks (if a purchaseDate exists).
 */
export async function getDashboardTransactions(userId: string) {
  const [invoices, stocks] = await Promise.all([
    getInvoices(userId),
    getStocks(userId),
  ]);

  // Create a lookup map for stocks by id.
  const stockMap = new Map<string, (typeof stocks)[0]>();
  stocks.forEach((stock) => {
    if (stock.id) stockMap.set(stock.id, stock);
  });

  // Build sale transactions from invoice items.
  const saleTransactions: any[] = [];
  invoices.forEach((invoice) => {
    invoice.invoiceItems.forEach((item) => {
      const stock = item.stockid ? stockMap.get(item.stockid) : null;
      const quantity = item.invoiceItemQuantity ?? 0;
      const sellingRate = item.invoiceItemRate ?? 0;
      const purchaseRate = stock?.stockRate ?? 0;
      const profit = (sellingRate - purchaseRate) * quantity;
      const vat =
        stock && stock.VAT ? (stock.VAT / 100) * purchaseRate * quantity : 0;

      saleTransactions.push({
        id: item.id, // using invoice item id
        type: "Sale",
        reference: invoice.invoiceNumber ?? "N/A",
        name: invoice.clientName,
        amount: sellingRate * quantity,
        date: invoice.createdAt ? new Date(invoice.createdAt) : new Date(),
        status: invoice.status,
        currency: (invoice.currency ?? "USD") as "USD" | "EUR" | "GBP",
        profit,
        vat,
      });
    });
  });

  // Build purchase transactions from stocks that have a purchaseDate.
  const purchaseTransactions = stocks
    .filter((stock) => stock.purchaseDate !== null)
    .map((stock) => {
      const rate = stock.stockRate ?? 0;
      const quantity = stock.quantity ?? 0;
      const vatPercent = stock.VAT ?? 0;
      // Total purchase amount: stockRate × (1 + VAT/100) × quantity
      const totalPurchase = rate * (1 + vatPercent / 100) * quantity;
      return {
        id: stock.id,
        type: "Purchase",
        reference: stock.stockBarcode,
        name: stock.stockName,
        supplier: stock.supplier,
        amount: totalPurchase,
        date: stock.purchaseDate ? new Date(stock.purchaseDate) : new Date(),
        status: "Completed",
        currency: "USD",
        quantity,
      };
    });

  // Sort transactions by date (most recent first)
  saleTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  purchaseTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return { invoices, stocks, saleTransactions, purchaseTransactions };
}

/**
 * Aggregate all dashboard data.
 * Also compute quick stats:
 * - Total Stock Items: number of stocks
 * - Pending Invoices: count of invoices where status is not "Paid"
 * - Total Transactions: count of sale + purchase transactions
 */
export async function getDashboardData(userId: string) {
  const { invoices, stocks, saleTransactions, purchaseTransactions } =
    await getDashboardTransactions(userId);

  const quickStats = {
    totalStock: stocks.length,
    pendingInvoices: invoices.filter((inv) => inv.status !== InvoiceStatus.PAID)
      .length,
    totalTransactions: saleTransactions.length + purchaseTransactions.length,
  };

  return {
    invoices,
    stocks,
    saleTransactions,
    purchaseTransactions,
    quickStats,
  };
}
