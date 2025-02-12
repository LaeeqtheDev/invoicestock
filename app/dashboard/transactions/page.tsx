// /dashboard/transactions/page.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/app/components/formatCurrency";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { Card } from "@/components/ui/card";

// Fetch invoices (sales transactions)
async function getInvoices(userId: string) {
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
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Fetch stocks (purchase transactions)
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
    orderBy: {
      purchaseDate: "desc",
    },
  });
}

// Transaction types
type Transaction = {
  id: string;
  type: "Purchase";
  reference: string | number;
  name: string | null;
  supplier?: string | null;
  amount: number;
  date: Date;
  status: string | null;
  currency: "USD" | "EUR" | "GBP";
  quantity?: number;
};

type SaleTransaction = {
  id: string;
  type: "Sale";
  reference: string | number;
  name: string | null;
  amount: number;
  date: Date;
  status: string | null;
  currency: "USD" | "EUR" | "GBP";
  profit: number;
  vat: number;
};

export default async function TransactionsPage() {
  const session = await requireUser();
  const userId = session.user?.id as string;

  const [invoices, stocks] = await Promise.all([
    getInvoices(userId),
    getStocks(userId),
  ]);
  console.log("Invoices:", invoices, "Stocks:", stocks);

  const stockMap = new Map<string, (typeof stocks)[0]>();
  stocks.forEach((stock) => {
    if (stock.id) stockMap.set(stock.id, stock);
  });

  // Build sales transactions
  const saleTransactions: SaleTransaction[] = invoices.flatMap((invoice) =>
    invoice.invoiceItems.map((item) => {
      const stock = item.stockid ? stockMap.get(item.stockid) : null;
      const quantity = item.invoiceItemQuantity ?? 0;
      const sellingRate = item.invoiceItemRate ?? 0;
      const purchaseRate = stock?.stockRate ?? 0;
      const profit = (sellingRate - purchaseRate) * quantity;
      const vat = stock && stock.VAT ? (stock.VAT / 100) * purchaseRate * quantity : 0;

      return {
        id: item.id,
        type: "Sale",
        reference: invoice.invoiceNumber ?? "N/A",
        name: invoice.clientName,
        amount: sellingRate * quantity,
        date: invoice.createdAt ? new Date(invoice.createdAt) : new Date(),
        status: invoice.status,
        currency: (invoice.currency ?? "USD") as "USD" | "EUR" | "GBP",
        profit,
        vat,
      };
    })
  );

  // Build purchase transactions
  const purchaseTransactions: Transaction[] = stocks
    .filter((stock) => stock.purchaseDate !== null)
    .map((stock) => {
      const rate = stock.stockRate ?? 0;
      const quantity = stock.quantity ?? 0;
      const vatPercent = stock.VAT ?? 0;
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

  // Sort by date
  saleTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  purchaseTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="mb-4 text-sm">
          View all your <span className="text-green-500">transactions</span> here
        </p>
      </div>

      {/* Sales Transactions Table */}
      <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-2">Sales Transactions</h2>
        <Card className="overflow-hidden">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>VAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saleTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.reference}</TableCell>
                  <TableCell>{tx.name}</TableCell>
                  <TableCell>{formatCurrency({ amount: tx.amount, currency: tx.currency })}</TableCell>
                  <TableCell>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(tx.date)}</TableCell>
                  <TableCell><Badge variant="secondary">{tx.status}</Badge></TableCell>
                  <TableCell>{formatCurrency({ amount: tx.profit, currency: tx.currency })}</TableCell>
                  <TableCell>{tx.vat.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Purchase Transactions Table */}
      <div className="overflow-x-auto mt-8">
        <h2 className="text-xl font-semibold mb-2">Purchase Transactions</h2>
        <Card className="overflow-hidden">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.reference}</TableCell>
                  <TableCell>{tx.name}</TableCell>
                  <TableCell>{tx.supplier}</TableCell>
                  <TableCell>{tx.quantity}</TableCell>
                  <TableCell>{formatCurrency({ amount: tx.amount, currency: tx.currency })}</TableCell>
                  <TableCell>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(tx.date)}</TableCell>
                  <TableCell><Badge variant="default">{tx.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
