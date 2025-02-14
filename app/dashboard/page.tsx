"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  ReceiptText,
  BarChart,
  BadgeDollarSign as BadgeIcon,
} from "lucide-react";

// PDF generation imports
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Import the barcode scanner component (cast as any for TS workarounds)
import BarcodeScannerComponentImport from "react-qr-barcode-scanner";
const BarcodeScannerComponent: any = BarcodeScannerComponentImport;

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
  currency: "USD" | "EUR" | "GBP" | "PKR" | string;
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
  currency: "USD" | "EUR" | "GBP" | "PKR" | string;
  quantity?: number;
}

interface DashboardData {
  quickStats: QuickStats;
  saleTransactions: SaleTransaction[];
  purchaseTransactions: PurchaseTransaction[];
  stocks: any[]; // For low stock filtering
}

// ------------------------------
// Define interface for business details
// ------------------------------
interface BusinessDetails {
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessEIN: string;
  businessVAT: string;
  businessLogo: string;
  returnPolicy: string;
}

// ------------------------------
// Framer Motion variants for homepage fade-in
// ------------------------------
import { motion, animate } from "framer-motion";
const homepageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ------------------------------
// CountUp Component (animates count)
// ------------------------------
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
// StatCard Component (icon, title, animated number)
// ------------------------------
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  currencySymbol?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, currencySymbol }) => {
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
        {currencySymbol ? currencySymbol : (title.includes("Profit") ? "$" : "")}
        <CountUp value={value} />
      </p>
    </motion.div>
  );
};

// ------------------------------
// Currency symbols mapping
// ------------------------------
const currencySymbols: { [key: string]: string } = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  PKR: "₨",
  INR: "₹",
  CAD: "C$",
};

// ------------------------------
// DashboardHomepage Component
// ------------------------------
export default function DashboardHomepage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const dashboardData: DashboardData = await res.json();
        setData(dashboardData);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // Fetch business details separately
  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await fetch("/api/business");
        if (!res.ok) throw new Error("Failed to fetch business details");
        const details: BusinessDetails = await res.json();
        setBusinessDetails(details);
      } catch (error) {
        console.error("Business error:", error);
      }
    }
    fetchBusiness();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  // If no business exists, show a centered placeholder with image and button.
  if (!businessDetails || !businessDetails.businessName) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <img
          src="/404.png"
          alt="No Business Found"
          className="mx-auto mb-4 w-3/4 "
        />
        <p className="text-xl font-semibold mb-4">No Business Found</p>
        <Link href="/dashboard/create">
          <Button variant="default" className="px-6 py-3">
            Create Business
          </Button>
        </Link>
      </div>
    );
  }

  if (!data) return <p>No dashboard data available.</p>;

  // Compute total profit grouped by currency from sale transactions
  const profitByCurrency = data.saleTransactions.reduce((acc, tx) => {
    const curr = tx.currency;
    if (!acc[curr]) acc[curr] = 0;
    acc[curr] += tx.profit;
    return acc;
  }, {} as Record<string, number>);

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
            Here is how your <span className="text-green-500">Business</span> is doing
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
        {Object.entries(profitByCurrency).map(([curr, profit]) => (
          <StatCard
            key={curr}
            title={`Total Profit (${curr})`}
            value={profit}
            icon={BadgeIcon}
            currencySymbol={currencySymbols[curr] || ""}
          />
        ))}
      </div>

      {/* Low Stock Alerts Card */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-1">
          Low Stock Alerts <Package size={24} className="text-red-500" />
        </h3>
        <ul className="space-y-1">
          {data.stocks
            .filter((stock: any) => stock.quantity < 5)
            .map((stock: any) => (
              <li key={stock.id} className="flex items-center space-x-2 text-sm">
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
