"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { CalendarIcon } from "lucide-react";

// ------------------------
// Types and Interfaces
// ------------------------

interface BusinessDetails {
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessEIN: string;
  businessVAT: string;
}

interface Stock {
  id: string;
  stockBarcode: string;
  stockName: string;
  sellingRate: number;
  VAT?: number;
  quantity: number;
}

interface InvoiceItem {
  id: string;
  invoiceItemQuantity: number;
  invoiceItemRate: number;
  stockid: string;
  stockBarcode?: string;
  stockName?: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: number;
  // Some APIs may not return a property named "date" so we use "createdAt" as fallback.
  date?: string;
  createdAt?: string;
  currency: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  note: string;
  status: string;
  invoiceItems: InvoiceItem[];
}

// For the return form we extend invoice items with a return quantity field.
// We also add "originalQuantity" to store the initially invoiced quantity.
interface ExtendedInvoiceItem {
  fetchedStock: Stock | null;
  originalQuantity: number;
  returnQuantity: string;
  rate: string;
  error?: string;
}

// ------------------------
// Component
// ------------------------

export default function ReturnInvoicePage() {
  const router = useRouter();
  const { invoiceId } = useParams();

  // Header and client details state.
  const [invoiceNumber, setInvoiceNumber] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("USD");
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientAddress, setClientAddress] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [note, setNote] = useState<string>("");

  // Extended invoice items state.
  const [invoiceItems, setInvoiceItems] = useState<ExtendedInvoiceItem[]>([]);

  // Currency symbols for display.
  const currencySymbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "₨",
  };

  // ------------------------
  // Fetch Invoice Data and Join Stock Data
  // ------------------------
  useEffect(() => {
    async function fetchInvoice() {
      try {
        // Fetch the invoice data by ID.
        const res = await fetch(`/api/invoice/${invoiceId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch invoice details");
        }
        const data: InvoiceData = await res.json();
        console.log("Fetched invoice data:", data);

        // If the invoice is already marked as RETURNED, prevent duplicate returns.
        if (data.status === "RETURNED") {
          alert("This invoice has already been returned.");
          router.push("/dashboard/invoices");
          return;
        }

        // Determine the invoice date (use data.date if available; otherwise, use createdAt).
        const invoiceDateString = data.date || data.createdAt;
        const invoiceDate = invoiceDateString
          ? new Date(invoiceDateString)
          : new Date();
        if (isNaN(invoiceDate.getTime())) {
          console.warn("Invalid invoice date, defaulting to current date.");
          setSelectedDate(new Date());
        } else {
          setSelectedDate(invoiceDate);
        }

        // Set header and client details.
        setInvoiceNumber(data.invoiceNumber ?? 0);
        setCurrency(data.currency ?? "USD");
        setClientName(data.clientName ?? "");
        setClientEmail(data.clientEmail ?? "");
        setClientAddress(data.clientAddress ?? "");
        setNote(data.note ?? "");

        // Map invoice items into ExtendedInvoiceItem objects.
        // Save the original invoiced quantity.
        const items: ExtendedInvoiceItem[] = data.invoiceItems.map(
          (item: InvoiceItem) => ({
            fetchedStock: null, // To be updated after fetching full stock details.
            originalQuantity: item.invoiceItemQuantity,
            returnQuantity: String(item.invoiceItemQuantity),
            rate: String(item.invoiceItemRate),
            error: "",
          }),
        );
        setInvoiceItems(items);

        // Extract unique stock IDs from invoice items.
        const stockIds = data.invoiceItems
          .map((item) => item.stockid)
          .filter(Boolean);
        if (stockIds.length > 0) {
          // Fetch full stock details by passing the comma‑separated stock IDs.
          const resStocks = await fetch(`/api/stock?ids=${stockIds.join(",")}`);
          if (!resStocks.ok) {
            console.error("Failed to fetch stock details for invoice items");
          } else {
            const stocks: Stock[] = await resStocks.json();
            const stockMap = new Map<string, Stock>();
            stocks.forEach((stock) => stockMap.set(stock.id, stock));
            // Update each ExtendedInvoiceItem with its fetched stock details.
            setInvoiceItems((prevItems) =>
              prevItems.map((item, index) => {
                const correspondingItem = data.invoiceItems[index];
                if (correspondingItem && correspondingItem.stockid) {
                  return {
                    ...item,
                    fetchedStock:
                      stockMap.get(correspondingItem.stockid) || null,
                  };
                }
                return item;
              }),
            );
          }
        }
      } catch (error: any) {
        alert("Error fetching invoice: " + error.message);
      }
    }
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, router]);

  // ------------------------
  // Helper Functions
  // ------------------------
  const updateInvoiceItem = (
    index: number,
    newFields: Partial<ExtendedInvoiceItem>,
  ) => {
    setInvoiceItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...newFields } : item)),
    );
  };

  // Calculate the total for an invoice item based on the return quantity and rate.
  const computeItemTotal = (item: ExtendedInvoiceItem): number => {
    const qty = Number(item.returnQuantity) || 0;
    const rate = Number(item.rate) || 0;
    return qty * rate;
  };

  // Calculate the overall total.
  const overallTotal = invoiceItems.reduce(
    (sum, item) => sum + computeItemTotal(item),
    0,
  );

  // ------------------------
  // Submission Handler
  // ------------------------
  async function handleReturnInvoice(e: React.FormEvent) {
    e.preventDefault();
    const validItems = invoiceItems.filter((item) => item.fetchedStock);
    if (validItems.length === 0) {
      alert("No valid invoice items found for return.");
      return;
    }
    const invoiceReturnData = {
      invoiceName: `Invoice ${invoiceNumber}`,
      total: overallTotal,
      status: "RETURNED",
      date: selectedDate.toISOString(),
      clientName,
      clientEmail,
      clientAddress,
      currency,
      invoiceNumber,
      note,
      invoiceItems: validItems.map((item) => ({
        stockid: item.fetchedStock!.id,
        invoiceItemQuantity: Number(item.returnQuantity),
        invoiceItemRate: Number(item.rate),
      })),
    };

    try {
      const res = await fetch(`/api/invoice/return/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceReturnData),
      });
      if (!res.ok) throw new Error("Failed to process invoice return");
      alert("Invoice return processed successfully!");
      router.push("/dashboard/invoices");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  // ------------------------
  // Render
  // ------------------------
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleReturnInvoice}>
          {/* Invoice Number & Currency */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <Label>Invoice No.</Label>
              <div className="flex items-center gap-2">
                <span className="px-3 border border-r-0 rounded-l-md bg-muted">
                  #
                </span>
                <Input
                  type="number"
                  value={invoiceNumber.toString()}
                  readOnly
                  className="rounded-l-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Currency</Label>
              <Select
                value={currency}
                onValueChange={(val) => setCurrency(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">
                    United States Dollar -- USD
                  </SelectItem>
                  <SelectItem value="EUR">Euro -- EUR</SelectItem>
                  <SelectItem value="GBP">British Pound -- GBP</SelectItem>
                  <SelectItem value="PKR">Pakistani Rupee -- PKR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Details & Date */}
          <div className="grid md:grid-cols-2 gap-6 mb-6 border-b pb-6">
            <div className="space-y-2">
              <Label>Client Details</Label>
              <Input placeholder="Client Name" value={clientName} readOnly />
              <Input placeholder="Client Email" value={clientEmail} readOnly />
              <Input
                placeholder="Client Address"
                value={clientAddress}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] text-left justify-start"
                    disabled
                  >
                    <CalendarIcon className="mr-2" />
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "long",
                    }).format(selectedDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date || new Date())}
                    mode="single"
                    fromDate={new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Invoice Items Section */}
          <div className="border p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Invoice Items</h3>
              {/* "Add Product" button is intentionally removed */}
            </div>
            {invoiceItems.map((item, index) => {
              const itemTotal = computeItemTotal(item);
              return (
                <div key={index} className="border rounded p-4 mb-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {/* Stock Name (read-only) */}
                    <div className="space-y-2">
                      <Label>Stock Name</Label>
                      <Input
                        value={item.fetchedStock?.stockName || ""}
                        readOnly
                        placeholder="Stock Name"
                      />
                    </div>
                    {/* Return Quantity Input */}
                    <div className="space-y-2">
                      <Label>Return Quantity</Label>
                      <Input
                        type="number"
                        value={item.returnQuantity}
                        onChange={(e) => {
                          const newQty = Number(e.target.value);
                          // Compare newQty to the originally invoiced quantity.
                          if (
                            item.fetchedStock &&
                            newQty > item.originalQuantity
                          ) {
                            updateInvoiceItem(index, {
                              error:
                                "Return quantity cannot exceed originally invoiced quantity",
                            });
                          } else {
                            updateInvoiceItem(index, {
                              returnQuantity: e.target.value,
                              error: "",
                            });
                          }
                        }}
                        placeholder="0"
                      />
                      {item.error && (
                        <p className="text-red-500 text-xs">{item.error}</p>
                      )}
                    </div>
                    {/* Rate Input (read-only) */}
                    <div className="space-y-2">
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        readOnly
                        placeholder="Rate"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-1 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        value={`${currencySymbols[currency]}${itemTotal.toFixed(2)}`}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Subtotal */}
          <div className="flex justify-end mb-6">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>
                  {currencySymbols[currency]}
                  {overallTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Note Section (read-only) */}
          <div className="mb-6">
            <Label>Note</Label>
            <Textarea
              placeholder="Add your Note/s here..."
              value={note}
              readOnly
            />
          </div>

          {/* Process Return Button */}
          <div className="flex items-center justify-end space-x-4">
            <Button variant="default" type="submit">
              Process Return
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
