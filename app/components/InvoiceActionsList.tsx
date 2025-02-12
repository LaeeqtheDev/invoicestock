// File: app/components/InvoiceActions.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  DownloadCloudIcon,
  Mail,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toaster";

interface InvoiceActionsProps {
  invoiceId: string;
  invoiceStatus: string; // e.g. "PENDING", "PAID", "RETURNED"
}

export function InvoiceActions({
  invoiceId,
  invoiceStatus,
}: InvoiceActionsProps) {
  const { toast } = useToast();

  const effectiveStatus = invoiceStatus ?? "PENDING";
  // Sends a reminder email for the invoice.
  const handleReminderEmail = async () => {
    try {
      const res = await fetch(`/api/invoice/reminder/${invoiceId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to send reminder email");
      toast({
        title: "Reminder Sent",
        description: "Reminder email sent successfully!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Deletes the invoice after user confirmation.
  const handleDeleteInvoice = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await fetch(`/api/invoice/${invoiceId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete invoice");
      toast({
        title: "Invoice Deleted",
        description: "Invoice deleted successfully!",
        variant: "default",
      });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Marks the invoice as paid.
  const handleMarkAsPaid = async () => {
    try {
      const res = await fetch(`/api/invoice/markAsPaid/${invoiceId}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to mark invoice as paid");
      toast({
        title: "Invoice Paid",
        description: "Invoice marked as paid successfully!",
        variant: "default",
      });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/invoices/return/${invoiceId}`}>
            <Pencil className="size-4 mr-2" /> Return Invoice
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/api/invoice/download/${invoiceId}`}>
            <DownloadCloudIcon className="size-4 mr-2" /> Download Invoice
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleDeleteInvoice}>
          <Trash className="size-4 mr-2" /> Delete Invoice
        </DropdownMenuItem>

        {/* Only show "Mark as Paid" if the invoice hasn't been returned */}
        {invoiceStatus !== "RETURNED" && (
          <DropdownMenuItem onClick={handleMarkAsPaid}>
            <CheckCircle className="size-4 mr-2" /> Mark as Paid
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
