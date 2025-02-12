"use client";
import { cn } from "@/lib/utils";
import {
  Home as HomeIcon,
  Package,
  BadgeDollarSign as BadgePoundSterling,
  BookMarked,
  Users2,
  ListTodo,
  NotebookPen,
  BarChart,
  User,
  Truck,
  ShoppingCart,
  FileText,
  Settings,
  Bell,
  HelpCircle,
  BookAudio,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const dashboardlinks = [
  {
    id: 0,
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    id: 3,
    name: "Stock",
    href: "/dashboard/stock",
    icon: Package,
  },
  {
    id: 1,
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: ReceiptText,
  },
  {
    id: 4,
    name: "Transactions", // Combines Sales and Purchases
    href: "/dashboard/transactions",
    icon: BadgePoundSterling,
  },
  {
    id: 7,
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },

  {
    id: 6,
    name: "Todo",
    href: "/dashboard/todo",
    icon: ListTodo,
  },
  {
    id: 2,
    name: "Notes",
    href: "/dashboard/notes",
    icon: NotebookPen,
  },
  // New sections

  {
    id: 10,
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    id: 11,
    name: "Support", // Combines Notifications and Help
    href: "mailto:support@invoicestock.com",
    icon: HelpCircle,
  },
];

export default function DashboardLinks() {
  const pathname = usePathname();
  return (
    <>
      {dashboardlinks.map((link) => (
        <Link
          className={cn(
            pathname === link.href
              ? "text-primary bg-green-600/10"
              : "text-muted-foreground hover:text-foreground",
            "flex items-center gap-3 rounded-full px-3 py-2 transition-all hover:text-primary",
          )}
          href={link.href}
          key={link.id}
        >
          <link.icon size={24} />
          {link.name}
        </Link>
      ))}
    </>
  );
}
