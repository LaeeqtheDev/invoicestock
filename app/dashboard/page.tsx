"use client";

import React, { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import Link from "next/link";
import {
  Package,
  ReceiptText,
  BarChart,
  BadgeDollarSign as BadgePoundSterling,
} from "lucide-react";

// ------------------------------
// Define interfaces for aggregated dashboard data
// ------------------------------
interface QuickStats {
  totalStock: number;
  pendingInvoices: number;
  totalTransactions: number;
}

interface SaleTransaction {
  id: string;
  type: "Sale";
  reference: string | number;
  name: string | null;
  amount: number;
  date: string;
  status: string | null;
  currency: "USD" | "EUR" | "GBP";
  profit: number;
  vat: number;
}

interface PurchaseTransaction {
  id: string;
  type: "Purchase";
  reference: string | number;
  name: string | null;
  supplier?: string | null;
  amount: number;
  date: string;
  status: string | null;
  currency: "USD" | "EUR" | "GBP";
  quantity?: number;
}

interface DashboardData {
  quickStats: QuickStats;
  saleTransactions: SaleTransaction[];
  purchaseTransactions: PurchaseTransaction[];
  stocks: any[]; // For low stock filtering
}

// ------------------------------
// Framer Motion variants for homepage fade-in
// ------------------------------
const homepageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ------------------------------
// CountUp Component
// ------------------------------
// This component animates the count from 0 to the target value.
const CountUp: React.FC<{ value: number; duration?: number }> = ({
  value,
  duration = 1.5,
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      onUpdate: (latest) => setCount(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value, duration]);

  return <span>{count}</span>;
};

// ------------------------------
// StatCard Component
// ------------------------------
// Renders an icon, title, and an animated number.
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => {
  return (
    <motion.div
      className="p-4 border rounded-lg shadow-md text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center mb-2">
        <Icon className="w-8 h-8 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">
        {title === "Total Profit" && "$"}
        <CountUp value={value} />
      </p>
    </motion.div>
  );
};

// ------------------------------
// DashboardHomepage Component
// ------------------------------
export default function DashboardHomepage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const dashboardData: DashboardData = await res.json();
        setData(dashboardData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>No dashboard data available.</p>;

  // Compute total profit from sale transactions
  const totalProfit = data.saleTransactions.reduce(
    (sum, tx) => sum + tx.profit,
    0
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={homepageVariants}
      className="p-3 space-y-2"
    >
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p>
            Here is how your{" "}
            <span className="text-green-500">Business</span> is doing
          </p>
        </div>
      </div>
      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock Items"
          value={data.quickStats.totalStock}
          icon={Package}
        />
        <StatCard
          title="Pending Invoices"
          value={data.quickStats.pendingInvoices}
          icon={ReceiptText}
        />
        <StatCard
          title="Total Transactions"
          value={data.quickStats.totalTransactions}
          icon={BarChart}
        />
        <StatCard
          title="Total Profit"
          value={totalProfit}
          icon={BadgePoundSterling}
        />
      </div>

      {/* Low Stock Alerts Card */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-1">Low Stock Alerts <Package size={24} className="text-red-500"/></h3>
        <ul className="space-y-1">
          {data.stocks
            .filter((stock: any) => stock.quantity < 5)
            .map((stock: any) => (
              <li
                key={stock.id}
                className="flex items-center space-x-2 text-sm"
              >
                <span>⚠️</span>
                <span className="font-semibold text-md">
                  {stock.stockName || stock.name}
                </span>
                <span>- {stock.quantity} left</span>
                <span className="font-semibold text-red-500">Reorder</span>
              </li>
            ))}
        </ul>
      </div>

      {/* Transactions Row: Sales on the left, Purchase on the right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sales Transactions Card */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Sales Transactions</h2>
          <div style={{ height: "12rem", overflowY: "auto" }}>
            {data.saleTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="mb-2 border-b border-gray-300 pb-2">
                <p>
                  <strong>Reference:</strong> {tx.reference}
                </p>
                <p>
                  <strong>Customer:</strong> {tx.name}
                </p>
                <p>
                  <strong>Amount:</strong> {tx.amount}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                  }).format(new Date(tx.date))}
                </p>
                <p>
                  <strong>Status:</strong> {tx.status}
                </p>
                <p>
                  <strong>Profit:</strong> {tx.profit}
                </p>
                <p>
                  <strong>VAT:</strong> {tx.vat.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/analytics">
            <button className="mt-4 bg-black text-white px-4 py-2 rounded dark:bg-white dark:text-black">
              View More
            </button>
          </Link>
        </div>

        {/* Purchase Transactions Card */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Purchase Transactions</h2>
          <div style={{ height: "12rem", overflowY: "auto" }}>
            {data.purchaseTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="mb-2 border-b border-gray-300 pb-2">
                <p>
                  <strong>Reference:</strong> {tx.reference}
                </p>
                <p>
                  <strong>Name:</strong> {tx.name}
                </p>
                <p>
                  <strong>Supplier:</strong> {tx.supplier}
                </p>
                <p>
                  <strong>Quantity:</strong> {tx.quantity}
                </p>
                <p>
                  <strong>Amount:</strong> {tx.amount}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                  }).format(new Date(tx.date))}
                </p>
                <p>
                  <strong>Status:</strong> {tx.status}
                </p>
              </div>
            ))}
          </div>
          <Link href="/dashboard/analytics">
            <button className="mt-4 bg-black text-white px-4 py-2 rounded dark:bg-white dark:text-black">
              View More
            </button>
          </Link>
        </div>
      </div>

      {/* Action Buttons Row (Create Stock and Create Invoice) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/invoices/create">
          <button className="flex items-center justify-center w-full bg-black text-white py-3 rounded-md dark:bg-white dark:text-black">
            <ReceiptText size={20} />
            <span className="ml-2">Create Invoice</span>
          </button>
        </Link>
        <Link href="/dashboard/stock/create">
          <button className="flex items-center justify-center w-full bg-black text-white py-3 rounded-md dark:bg-white dark:text-black">
            <Package size={20} />
            <span className="ml-2">Create Stock</span>
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
