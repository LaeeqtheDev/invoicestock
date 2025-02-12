// File: app/dashboard/invoices/edit/[invoiceId]/page.tsx
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
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";

interface Stock {
  id: string;
  stockBarcode: string;
  stockName: string;
  sellingRate: number;
  VAT?: number;
  quantity: number;
}

interface InvoiceItem {
  barcode: string;
  fetchedStock: Stock | null;
  quantity: string;
  rate: string;
  vatPercent: string;
  discount: string;
  error?: string;
}

export default function EditInvoice() {
  const router = useRouter();
  const { invoiceId } = useParams(); // Get invoiceId from URL parameters

  // Invoice header and client details state
  const [invoiceNumber, setInvoiceNumber] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("USD");
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientAddress, setClientAddress] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [note, setNote] = useState<string>("");

  // Dynamic invoice items state
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      barcode: "",
      fetchedStock: null,
      quantity: "",
      rate: "",
      vatPercent: "0",
      discount: "0",
    },
  ]);

  // Fetch invoice details when the component mounts
  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoice/${invoiceId}`);
        if (!res.ok) throw new Error("Failed to fetch invoice details");
        const data = await res.json();
        // Populate header and client details from the API response.
        setInvoiceNumber(data.invoiceNumber);
        setCurrency(data.currency);
        setClientName(data.clientName);
        setClientEmail(data.clientEmail);
        setClientAddress(data.clientAddress);
        setSelectedDate(new Date(data.date));
        setNote(data.note);

        // Map invoiceItems safely.
        // Use the nullish coalescing operator (??) to provide a default of 0 before converting to a string.
        const items: InvoiceItem[] = Array.isArray(data.invoiceItems)
          ? data.invoiceItems.map((item: any) => ({
              barcode: item.barcode || "",
              // Create a minimal fetchedStock object. Adjust property names as needed.
              fetchedStock: {
                id: item.stockid,
                stockBarcode: item.stockBarcode || "",
                stockName: item.stockName || "",
                sellingRate: item.invoiceItemRate ?? 0,
                VAT: 0,
                quantity: 0,
              },
              quantity: String(item.invoiceItemQuantity ?? 0),
              rate: String(item.invoiceItemRate ?? 0),
              vatPercent: "0", // Adjust if your API provides VAT percentage.
              discount: "0",
            }))
          : [];
        setInvoiceItems(items);
      } catch (error: any) {
        alert("Error fetching invoice: " + error.message);
      }
    }
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  // Helper to update an invoice item at a given index.
  const updateInvoiceItem = (index: number, item: Partial<InvoiceItem>) => {
    setInvoiceItems((prev) =>
      prev.map((invItem, i) =>
        i === index ? { ...invItem, ...item } : invItem,
      ),
    );
  };

  // Handler for barcode lookup on a given row.
  async function handleBarcodeLookup(index: number) {
    const barcode = invoiceItems[index].barcode;
    if (!barcode) return;
    try {
      const res = await fetch(`/api/stock?barcode=${barcode}`);
      if (!res.ok) throw new Error("Failed to fetch stock");
      const stocks: Stock[] = await res.json();
      const stock = stocks.find((s) => s.stockBarcode === barcode);
      if (stock) {
        if (stock.quantity === 0) {
          updateInvoiceItem(index, {
            error: "Out of stock",
            fetchedStock: null,
            rate: "",
            vatPercent: "0",
          });
        } else {
          updateInvoiceItem(index, {
            fetchedStock: stock,
            rate: stock.sellingRate.toString(),
            vatPercent: stock.VAT !== undefined ? stock.VAT.toString() : "0",
            error: "",
          });
        }
      } else {
        updateInvoiceItem(index, {
          error: "Stock not found",
          fetchedStock: null,
          rate: "",
          vatPercent: "0",
        });
      }
    } catch (error: any) {
      updateInvoiceItem(index, {
        error: "Error fetching stock",
        fetchedStock: null,
        rate: "",
        vatPercent: "0",
      });
    }
  }

  // Add a new invoice item row.
  const addInvoiceItem = () => {
    setInvoiceItems((prev) => [
      ...prev,
      {
        barcode: "",
        fetchedStock: null,
        quantity: "",
        rate: "",
        vatPercent: "0",
        discount: "0",
      },
    ]);
  };

  // Remove an invoice item row.
  const removeInvoiceItem = (index: number) => {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute total for an invoice item.
  const computeItemTotal = (item: InvoiceItem): number => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discount = Number(item.discount) || 0;
    const base = qty * rate;
    const vat = (base * (Number(item.vatPercent) || 0)) / 100;
    return base + vat - discount;
  };

  const overallTotal = invoiceItems.reduce(
    (sum, item) => sum + computeItemTotal(item),
    0,
  );

  // Handler for updating the invoice.
  async function handleUpdateInvoice(e: React.FormEvent) {
    e.preventDefault();
    const validItems = invoiceItems.filter((item) => item.fetchedStock);
    if (validItems.length === 0) {
      alert("Please add at least one valid invoice item with stock details.");
      return;
    }

    const invoiceData = {
      invoiceName: `Invoice ${invoiceNumber}`,
      total: overallTotal,
      status: "UPDATED",
      date: selectedDate.toISOString(),
      clientName,
      clientEmail,
      clientAddress,
      currency,
      invoiceNumber,
      note,
      invoiceItems: validItems.map((item) => ({
        stockid: item.fetchedStock!.id,
        invoiceItemQuantity: Number(item.quantity),
        invoiceItemRate: Number(item.rate),
      })),
    };

    try {
      const res = await fetch(`/api/invoice/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
      if (!res.ok) throw new Error("Failed to update invoice");
      alert("Invoice updated successfully!");
      router.push("/dashboard/invoices");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleUpdateInvoice}>
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setInvoiceNumber(Number(e.target.value))
                  }
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
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Details & Date */}
          <div className="grid md:grid-cols-2 gap-6 mb-6 border-b pb-6">
            <div className="space-y-2">
              <Label>Client Details</Label>
              <Input
                placeholder="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <Input
                placeholder="Client Email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
              <Input
                placeholder="Client Address"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] text-left justify-start"
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
              <Button variant="outline" type="button" onClick={addInvoiceItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
            {invoiceItems.map((item, index) => {
              const itemTotal = computeItemTotal(item);
              return (
                <div key={index} className="border rounded p-4 mb-4">
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    {/* Barcode Input & Search Button */}
                    <div className="space-y-2">
                      <Label>Barcode</Label>
                      <Input
                        value={item.barcode}
                        onChange={(e) =>
                          updateInvoiceItem(index, { barcode: e.target.value })
                        }
                        placeholder="Enter barcode"
                      />
                      <Button
                        variant="outline"
                        type="button"
                        size="sm"
                        onClick={() => handleBarcodeLookup(index)}
                        className="mt-2"
                      >
                        Search Stock
                      </Button>
                      {item.error && (
                        <p className="text-red-500 text-xs">{item.error}</p>
                      )}
                    </div>
                    {/* Stock Name (read-only) */}
                    <div className="space-y-2">
                      <Label>Stock Name</Label>
                      <Input
                        value={item.fetchedStock?.stockName || ""}
                        placeholder="Stock Name"
                        readOnly
                      />
                    </div>
                    {/* Quantity Input */}
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = Number(e.target.value);
                          const available = item.fetchedStock
                            ? item.fetchedStock.quantity
                            : Infinity;
                          if (item.fetchedStock && newQuantity > available) {
                            updateInvoiceItem(index, {
                              error: "Quantity exceeds available stock",
                            });
                          } else {
                            updateInvoiceItem(index, {
                              quantity: e.target.value,
                              error: "",
                            });
                          }
                        }}
                        placeholder="0"
                      />
                    </div>
                    {/* Rate Input (auto-populated) */}
                    <div className="space-y-2">
                      <Label>Rate</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          updateInvoiceItem(index, { rate: e.target.value })
                        }
                        placeholder="0"
                        readOnly={!!item.fetchedStock}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* VAT Input */}
                    <div className="space-y-2">
                      <Label>VAT (%)</Label>
                      <Input
                        type="number"
                        value={item.vatPercent}
                        onChange={(e) =>
                          updateInvoiceItem(index, {
                            vatPercent: e.target.value,
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                    {/* Discount Input */}
                    <div className="space-y-2">
                      <Label>Discount</Label>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) =>
                          updateInvoiceItem(index, { discount: e.target.value })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-1 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input value={`$${itemTotal.toFixed(2)}`} readOnly />
                    </div>
                  </div>
                  {invoiceItems.length > 1 && (
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        type="button"
                        size="sm"
                        onClick={() => removeInvoiceItem(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Subtotal */}
          <div className="flex justify-end mb-6">
            <div className="w-1/3">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>${overallTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="mb-6">
            <Label>Note</Label>
            <Textarea
              placeholder="Add your Note/s here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Update Invoice Button */}
          <div className="flex items-center justify-end space-x-4">
            <Button variant="default" type="submit">
              Update Invoice
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
