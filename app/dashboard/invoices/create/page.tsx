"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

// PDF generation imports
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Import the barcode scanner component (casting to any to bypass TS issues).
import BarcodeScannerComponentImport from "react-qr-barcode-scanner";
const BarcodeScannerComponent: any = BarcodeScannerComponentImport;

// -----------------------------------------------------------------------------
// Business Details Getter
// -----------------------------------------------------------------------------
export interface BusinessDetails {
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessEIN: string;
  businessVAT: string;
  businessLogo: string; // URL of the business logo (from Cloudinary)
  returnPolicy: string; // The business return policy text
}

async function getBusinessDetails(): Promise<BusinessDetails> {
  const res = await fetch("/api/business");
  if (!res.ok) {
    throw new Error("Failed to fetch business details");
  }
  return res.json();
}

// -----------------------------------------------------------------------------
// Stock and Invoice Item Interfaces & Helpers
// -----------------------------------------------------------------------------
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

async function fetchStockByBarcode(barcode: string): Promise<Stock | null> {
  try {
    console.log("Fetching stock for barcode:", barcode);
    const response = await fetch(`/api/stock`);
    if (!response.ok) {
      console.error("Error fetching stocks:", response.statusText);
      return null;
    }
    const stocks: Stock[] = await response.json();
    console.log("Stocks returned:", stocks);
    const found = stocks.find((stock) => stock.stockBarcode === barcode);
    if (!found) {
      console.warn("Stock not found for barcode:", barcode);
    } else {
      console.log("Found stock:", found);
    }
    return found || null;
  } catch (error) {
    console.error("Error fetching stock by barcode:", error);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Helper: Convert an image URL to a Base64 data URL (for jsPDF)
// -----------------------------------------------------------------------------
async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// -----------------------------------------------------------------------------
// CreateInvoice Component
// -----------------------------------------------------------------------------
export default function CreateInvoice() {
  const router = useRouter();

  // Business details state.
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    businessName: "",
    businessAddress: "",
    businessEmail: "",
    businessEIN: "",
    businessVAT: "",
    businessLogo: "",
    returnPolicy: "",
  });

  // Header data.
  const [invoiceNumber, setInvoiceNumber] = useState(0);
  const [currency, setCurrency] = useState("USD");

  // Client details.
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");

  // Date state.
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // State for dynamic invoice items.
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

  // Barcode scanning modal state.
  const [isScanning, setIsScanning] = useState(false);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);

  // Currency symbols mapping.
  const currencySymbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "₨",
    INR: "₹",
    CAD: "C$",
  };

  // ------------------------------
  // Auto-generate a unique invoice number.
  // ------------------------------
  useEffect(() => {
    async function generateUniqueInvoiceNumber() {
      let unique = false;
      let randomInvoice: number = 0;
      while (!unique) {
        // Generate a random 4-digit number between 1000 and 9999.
        randomInvoice = Math.floor(1000 + Math.random() * 9000);
        const res = await fetch(
          `/api/invoice/check-unique?invoiceNumber=${randomInvoice}`
        );
        if (!res.ok) {
          console.error("Error checking invoice number uniqueness");
          break;
        }
        const data = await res.json();
        unique = data.unique; // Expecting { unique: true }
      }
      if (unique) {
        setInvoiceNumber(randomInvoice);
      }
    }
    generateUniqueInvoiceNumber();
  }, []);

  // ------------------------------
  // Fetch business details.
  // ------------------------------
  useEffect(() => {
    async function fetchBusiness() {
      try {
        const details = await getBusinessDetails();
        console.log("Fetched Business Details:", details);
        setBusinessDetails(details);
      } catch (error) {
        console.error("Error fetching business details:", error);
      }
    }
    fetchBusiness();
  }, []);

  // ------------------------------
  // Helper to update an invoice item.
  // ------------------------------
  const updateInvoiceItem = (index: number, item: Partial<InvoiceItem>) => {
    setInvoiceItems((prev) =>
      prev.map((invItem, i) =>
        i === index ? { ...invItem, ...item } : invItem
      )
    );
  };

  // ------------------------------
  // Handler for manual barcode lookup.
  // ------------------------------
  async function handleBarcodeLookup(index: number) {
    const barcode = invoiceItems[index].barcode;
    if (!barcode) return;
    const stock = await fetchStockByBarcode(barcode);
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
        error: "Stock not found for this barcode.",
        fetchedStock: null,
        rate: "",
        vatPercent: "0",
      });
    }
  }

  // ------------------------------
  // Barcode scanning functionality.
  // ------------------------------
  const handleScanBarcode = (index: number) => {
    setScanningIndex(index);
    setIsScanning(true);
  };

  // ------------------------------
  // Add/Remove invoice item rows.
  // ------------------------------
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

  const removeInvoiceItem = (index: number) => {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ------------------------------
  // Compute Totals.
  // ------------------------------
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
    0
  );

  // ------------------------------
  // After Print Redirect (as a fallback listener).
  // ------------------------------
  useEffect(() => {
    const handleAfterPrint = () => {
      router.push("/dashboard/invoices");
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [router]);

  // ------------------------------
  // PDF Generation using jsPDF and autoTable for Receipt Printing.
  // ------------------------------
  const generatePDF = async () => {
    // Increase the page height (from 200 to 250) to allow more space.
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200],
    });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add business logo if available.
    let logoBase64 = "";
    if (businessDetails.businessLogo) {
      try {
        logoBase64 = await getBase64ImageFromUrl(businessDetails.businessLogo);
        const logoWidth = 25;
        const logoHeight = 25;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(logoBase64, "PNG", logoX, 5, logoWidth, logoHeight);
      } catch (error) {
        console.error("Error loading logo image", error);
      }
    }

    // Header with business name and details.
    const headerY = 5 + 25 + 5; // 35mm
    doc.setFontSize(12);
    doc.text(businessDetails.businessName, pageWidth / 2, headerY, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(
      `EIN: ${businessDetails.businessEIN} VAT: ${businessDetails.businessVAT}`,
      pageWidth / 2,
      headerY + 5,
      { align: "center" }
    );
    doc.setLineWidth(0.5);
    doc.line(5, headerY + 7, pageWidth - 5, headerY + 7);

    // Invoice and client details.
    const detailsStartY = headerY + 10;
    doc.setFontSize(10);
    doc.text(`INV: ${invoiceNumber}`, 5, detailsStartY);
    doc.text(
      new Intl.DateTimeFormat("en-US", { dateStyle: "short" }).format(
        selectedDate
      ),
      pageWidth - 5,
      detailsStartY,
      { align: "right" }
    );
    doc.text(`CUR: ${currency}`, 5, detailsStartY + 4);
    doc.text(`${clientName}`, pageWidth - 5, detailsStartY + 4, {
      align: "right",
    });
    doc.line(5, detailsStartY + 6, pageWidth - 5, detailsStartY + 6);

    // Invoice items table.
    (doc as any).autoTable({
      head: [["Item", "Qty", "Amt"]],
      body: invoiceItems.map((item) => {
        const stockName = item.fetchedStock?.stockName || "";
        const quantity = item.quantity;
        const amount = (Number(item.quantity) * Number(item.rate)).toFixed(2);
        return [stockName, quantity, amount];
      }),
      startY: detailsStartY + 8,
      margin: { bottom: 10 },
      theme: "plain",
      styles: { fontSize: 8, cellPadding: 2 },
    });

    const finalY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY
      : detailsStartY + 8;

    // Print the subtotal with extra spacing so it isn’t cut off.
    doc.setFontSize(8);
    doc.text(
      `Subtotal: ${currencySymbols[currency]}${overallTotal.toFixed(2)}`,
      pageWidth - 5,
      finalY + 10,
      { align: "right" }
    );

    // Return policy text.
    const returnPolicyY = finalY + 16;
    doc.setFontSize(8);
    doc.text("Return Policy:", pageWidth / 2, returnPolicyY, {
      align: "center",
    });
    const policyLines = doc.splitTextToSize(
      businessDetails.returnPolicy,
      pageWidth - 10
    );
    doc.text(policyLines, pageWidth / 2, returnPolicyY + 4, {
      align: "center",
    });

    // Automatically trigger the print dialog.
    doc.autoPrint();

    // Generate a blob URL instead of a data URI.
    const pdfBlobUrl = doc.output("bloburl");

    // Open the PDF in a new window.
    const newWindow = window.open(pdfBlobUrl, "_blank");
    if (newWindow) {
      newWindow.focus();

      // Attach an onafterprint event handler.
      newWindow.onafterprint = () => {
        newWindow.close();
        router.push("/dashboard/invoices");
      };

      // Start an interval to check if the window has been closed.
      const printCheckInterval = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(printCheckInterval);
          router.push("/dashboard/invoices");
        }
      }, 500);

      // Call print on the new window after a slight delay to ensure the PDF loads.
      setTimeout(() => {
        newWindow.print();
      }, 500);
    } else {
      alert("Popup blocked! Please allow popups for this website.");
    }
  };

  // ------------------------------
  // Submission Handler.
  // ------------------------------
  async function handleCreateAndPrint(e: React.FormEvent) {
    e.preventDefault();

    const validItems = invoiceItems.filter((item) => item.fetchedStock);
    if (validItems.length === 0) {
      alert("Please add at least one valid invoice item with stock details.");
      return;
    }

    const invoiceData = {
      invoiceName: `Invoice ${invoiceNumber}`,
      total: overallTotal,
      status: "PENDING",
      date: selectedDate.toISOString(),
      fromName: businessDetails.businessName,
      fromEmail: businessDetails.businessEmail,
      fromAddress: businessDetails.businessAddress,
      clientName,
      clientEmail,
      clientAddress,
      currency,
      invoiceNumber: invoiceNumber,
      invoiceItems: validItems.map((item) => ({
        stockid: item.fetchedStock!.id,
        invoiceItemQuantity: Number(item.quantity),
        invoiceItemRate: Number(item.rate),
      })),
    };

    const formData = new FormData();
    formData.append("invoiceData", JSON.stringify(invoiceData));

    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Failed to create invoice");
      }
      await res.json();

      for (const item of validItems) {
        if (item.fetchedStock) {
          const soldQuantity = Number(item.quantity);
          const updatedQuantity = item.fetchedStock.quantity - soldQuantity;
          await fetch(`/api/stock/${item.fetchedStock.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: updatedQuantity }),
          });
        }
      }

      // Generate and immediately print the PDF receipt.
      await generatePDF();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  // ------------------------------
  // Render Component
  // ------------------------------
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleCreateAndPrint}>
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
                onValueChange={(value) => setCurrency(value)}
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
                  <SelectItem value="INR">Indian Rupee -- INR</SelectItem>
                  <SelectItem value="CAD">Canadian Dollar -- CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Business & Client Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6 border-b pb-6">
            <div>
              <Label>Business Details</Label>
              <p>{businessDetails.businessName || "Loading..."}</p>
              <p>{businessDetails.businessEmail || "Loading..."}</p>
              <p>{businessDetails.businessAddress || "Loading..."}</p>
              <p>EIN: {businessDetails.businessEIN || "Loading..."}</p>
              <p>VAT: {businessDetails.businessVAT || "Loading..."}</p>
            </div>
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
          </div>

          {/* Date */}
          <div className="mb-6">
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

          {/* Invoice Items Section */}
          <div className="border p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Invoice Items</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={addInvoiceItem}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>
            {invoiceItems.map((item, index) => {
              const itemTotal = computeItemTotal(item);
              return (
                <div key={index} className="border rounded p-4 mb-4">
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    {/* Barcode Input & Buttons */}
                    <div className="space-y-2">
                      <Label>Barcode</Label>
                      <Input
                        value={item.barcode}
                        onChange={(e) =>
                          updateInvoiceItem(index, { barcode: e.target.value })
                        }
                        placeholder="Enter barcode"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          type="button"
                          size="sm"
                          onClick={() => handleBarcodeLookup(index)}
                        >
                          Search Stock
                        </Button>
                        <Button
                          variant="outline"
                          type="button"
                          size="sm"
                          onClick={() => handleScanBarcode(index)}
                        >
                          Scan Barcode
                        </Button>
                      </div>
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
                    {/* Rate Input (read-only) */}
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
                  <div className="grid md:grid-cols-1 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        value={`${currencySymbols[currency]}${itemTotal.toFixed(
                          2
                        )}`}
                        readOnly
                      />
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
              <div className="flex justify-end py-2">
                <span>
                  Subtotal: {currencySymbols[currency]}
                  {overallTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* (Optional) Note Section */}
          <div className="mb-6">
            <Label>Note</Label>
            <Textarea placeholder="Add any additional notes here..." />
          </div>

          {/* Create & Print Invoice Button */}
          <div className="flex items-center justify-end space-x-4">
            <Button variant="default" type="submit">
              Create & Print Invoice
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Barcode Scanner Modal */}
      {isScanning && scanningIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded">
            <h2 className="text-lg font-bold mb-2">Scan Barcode</h2>
            {/* Container with fixed dimensions to display the camera preview */}
            <div style={{ width: "400px", height: "300px" }}>
              <BarcodeScannerComponent
                width={400}
                height={300}
                // onUpdate callback receives error and result.
                onUpdate={(error: unknown, result: any) => {
                  if (result) {
                    // Since result.text is a private property, cast to any to access it.
                    const extractedNumber = (result as any)
                      .text.replace(/\D/g, "");
                    console.log("Scanned barcode number:", extractedNumber);
                    updateInvoiceItem(scanningIndex, {
                      barcode: extractedNumber,
                      error: "",
                    });
                    handleBarcodeLookup(scanningIndex);
                    setIsScanning(false);
                    setScanningIndex(null);
                  } else if (error) {
                    console.error("Scan error:", error);
                  }
                }}
              />
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                setIsScanning(false);
                setScanningIndex(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
