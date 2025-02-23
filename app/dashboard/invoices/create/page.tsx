"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";
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
  /** The user's typed stock name value */
  stockNameInput: string;
  /** Controls whether the suggestion dropdown is shown */
  showSuggestions: boolean;
  /** For keyboard navigation */
  highlightedIndex: number;
  quantity: string;
  rate: string;
  vatPercent: string;
  discount: string;
  error?: string;
}

async function fetchStockByBarcode(barcode: string): Promise<Stock | null> {
  try {
    const response = await fetch(`/api/stock`);
    if (!response.ok) {
      console.error("Error fetching stocks:", response.statusText);
      return null;
    }
    const stocks: Stock[] = await response.json();
    const found = stocks.find((stock) => stock.stockBarcode === barcode);
    if (!found) {
      console.warn("Stock not found for barcode:", barcode);
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
  const [clientEmail, setClientEmail] = useState("business@invoicestock.online");
  const [clientAddress, setClientAddress] = useState("");

  // Payment details.
  const [amountPaid, setAmountPaid] = useState("");

  // Date state.
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // State for dynamic invoice items.
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      barcode: "",
      fetchedStock: null,
      stockNameInput: "",
      showSuggestions: true,
      highlightedIndex: 0,
      quantity: "",
      rate: "",
      vatPercent: "0",
      discount: "0",
    },
  ]);

  // Barcode scanning modal state.
  const [isScanning, setIsScanning] = useState(false);
  const [scanningIndex, setScanningIndex] = useState<number | null>(null);

  // Load the entire stock once for autocomplete.
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  useEffect(() => {
    async function fetchAllStocks() {
      try {
        const response = await fetch("/api/stock");
        if (response.ok) {
          const stocks: Stock[] = await response.json();
          setAllStocks(stocks);
        } else {
          console.error("Failed to fetch stocks");
        }
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    }
    fetchAllStocks();
  }, []);

  // Currency symbols mapping.
  const currencySymbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    PKR: "Rs",
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
        randomInvoice = Math.floor(1000 + Math.random() * 9000);
        const res = await fetch(
          `/api/invoice/check-unique?invoiceNumber=${randomInvoice}`
        );
        if (!res.ok) {
          console.error("Error checking invoice number uniqueness");
          break;
        }
        const data = await res.json();
        unique = data.unique;
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
        setBusinessDetails(details);
        setClientAddress(details.businessAddress);
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
      prev.map((invItem, i) => (i === index ? { ...invItem, ...item } : invItem))
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
          stockNameInput: stock.stockName,
          error: "",
          quantity: "1",
        });
        if (index === invoiceItems.length - 1) addInvoiceItem();
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
  // Handler when a stock is selected via autocomplete.
  // ------------------------------
  const handleSelectStock = (index: number, selectedStock: Stock) => {
    // Only set a default quantity if the stock is available.
    if (selectedStock.quantity === 0) {
      updateInvoiceItem(index, {
        fetchedStock: null,
        stockNameInput: selectedStock.stockName,
        barcode: selectedStock.stockBarcode,
        rate: "",
        vatPercent: "0",
        error: "Out of stock",
        showSuggestions: false,
        highlightedIndex: 0,
        quantity: "",
      });
    } else {
      updateInvoiceItem(index, {
        fetchedStock: selectedStock,
        stockNameInput: selectedStock.stockName,
        barcode: selectedStock.stockBarcode,
        rate: selectedStock.sellingRate.toString(),
        vatPercent:
          selectedStock.VAT !== undefined ? selectedStock.VAT.toString() : "0",
        error: "",
        showSuggestions: false,
        highlightedIndex: 0,
        quantity: "1", // Default quantity only when valid stock is found.
      });
      if (index === invoiceItems.length - 1) addInvoiceItem();
    }
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
        stockNameInput: "",
        showSuggestions: true,
        highlightedIndex: 0,
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
    const gst = (base * (Number(item.vatPercent) || 0)) / 100;
    return base + gst - discount;
  };

  const overallTotal = invoiceItems.reduce(
    (sum, item) => sum + computeItemTotal(item),
    0
  );

  // ------------------------------
  // Display Payment Summary on the Form
  // ------------------------------
  const paidAmountNum = Number(amountPaid) || 0;
  const changeReturned =
    paidAmountNum > overallTotal ? paidAmountNum - overallTotal : 0;

  // ------------------------------
  // After Print Redirect.
  // ------------------------------
  useEffect(() => {
    const handleAfterPrint = () => {
      router.push("/dashboard/invoices");
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [router]);

  // ------------------------------
  // PDF Generation using jsPDF and autoTable.
  // ------------------------------
  const generatePDF = async () => {
    // ----- LOGO HANDLING: "OBJECT CONTAIN" LOGIC -----
    let logoBase64 = "";
    let computedLogoWidth = 25; // default max size
    let computedLogoHeight = 25; // default max size
    if (businessDetails.businessLogo) {
      try {
        logoBase64 = await getBase64ImageFromUrl(businessDetails.businessLogo);
        const img = new Image();
        img.src = businessDetails.businessLogo;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const naturalWidth = img.width;
        const naturalHeight = img.height;
        const maxDimension = 25;
        if (naturalWidth >= naturalHeight) {
          computedLogoWidth = maxDimension;
          computedLogoHeight = maxDimension * (naturalHeight / naturalWidth);
        } else {
          computedLogoHeight = maxDimension;
          computedLogoWidth = maxDimension * (naturalWidth / naturalHeight);
        }
      } catch (error) {
        console.error("Error loading logo image", error);
      }
    }
  
    // ----- DYNAMIC PAGE HEIGHT CALCULATION -----
    // Create a temporary document to estimate the return policy text height.
    const tempDoc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 80],
    });
    tempDoc.setFontSize(8);
    const policyWidth = 80 - 10; // page width minus 5mm margins on each side
    const policyLines = tempDoc.splitTextToSize(businessDetails.returnPolicy, policyWidth);
    const lineHeight = 5; // using 5mm per line for return policy text
    const policyTextHeight = policyLines.length * lineHeight;
  
    // Section height estimates:
    // Header: top margin (5mm) + (logo height if available) + spacing (5mm) + header text (~10mm)
    const headerHeight = 5 + (businessDetails.businessLogo ? computedLogoHeight : 0) + 5 + 10;
    // Invoice details (invoice number, date, etc.)
    const detailsSectionHeight = 10 + 6;
    // Table: header (8mm) + each row (8mm per row)
    const filteredItems = invoiceItems.filter((item) => item.fetchedStock !== null);
    const tableHeaderHeight = 8;
    const tableRowHeight = 8;
    const tableHeight = tableHeaderHeight + (filteredItems.length * tableRowHeight);
    // Summary: Fixed height for totals (16mm), plus return policy label and text.
    const summaryFixedHeight = 16;
    const returnPolicyLabelHeight = 6; // height for "Return Policy:" label
    const extraReturnPolicySpacing = 4; // extra spacing before return policy text
    const summaryHeight = summaryFixedHeight + returnPolicyLabelHeight + extraReturnPolicySpacing + policyTextHeight;
  
    // Total dynamic page height:
    let dynamicPageHeight = headerHeight + detailsSectionHeight + tableHeight + summaryHeight;
    dynamicPageHeight = Math.max(dynamicPageHeight, 80); // enforce a minimum page height
  
    // Create the jsPDF document with the dynamic page height.
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, dynamicPageHeight],
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    // ----- RENDER LOGO -----
    if (logoBase64) {
      try {
        const logoX = (pageWidth - computedLogoWidth) / 2;
        // Place logo 5mm from the top.
        doc.addImage(logoBase64, "PNG", logoX, 5, computedLogoWidth, computedLogoHeight);
      } catch (error) {
        console.error("Error adding logo", error);
      }
    }
  
    // ----- HEADER: Business Details -----
    const headerY = 5 + (businessDetails.businessLogo ? computedLogoHeight : 0) + 5;
    doc.setFontSize(12);
    doc.text(businessDetails.businessName, pageWidth / 2, headerY, { align: "center" });
    doc.setFontSize(10);
    doc.text(
      `EIN: ${businessDetails.businessEIN} VAT: ${businessDetails.businessVAT}`,
      pageWidth / 2,
      headerY + 5,
      { align: "center" }
    );
    doc.setLineWidth(0.5);
    doc.line(5, headerY + 7, pageWidth - 5, headerY + 7);
  
    // ----- INVOICE DETAILS -----
    const detailsStartY = headerY + 10;
    doc.setFontSize(10);
    doc.text(`INV: ${invoiceNumber}`, 5, detailsStartY);
    doc.text(
      new Intl.DateTimeFormat("en-US", { dateStyle: "short" }).format(selectedDate),
      pageWidth - 5,
      detailsStartY,
      { align: "right" }
    );
    doc.text(`CUR: ${currency}`, 5, detailsStartY + 4);
    const displayClientName = clientName.trim() === "" ? "Walk In" : clientName;
    doc.text(displayClientName, pageWidth - 5, detailsStartY + 4, { align: "right" });
    doc.line(5, detailsStartY + 6, pageWidth - 5, detailsStartY + 6);
  
    // ----- INVOICE ITEMS TABLE -----
    (doc as any).autoTable({
      head: [["Item", "Price", "Qty", "GST", "Amt"]],
      body: filteredItems.map((item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.rate) || 0;
        const base = qty * price;
        const gstAmount = (base * (Number(item.vatPercent) || 0)) / 100;
        const discount = Number(item.discount) || 0;
        const amount = base + gstAmount - discount;
        return [
          item.fetchedStock?.stockName || "",
          price.toFixed(2),
          qty.toString(),
          gstAmount.toFixed(2),
          amount.toFixed(2),
        ];
      }),
      startY: detailsStartY + 8,
      margin: { left: 5, right: 5, bottom: 10 },
      theme: "plain",
      headStyles: { fillColor: 200, textColor: 50, halign: "center" },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 23 },
        1: { cellWidth: 12, overflow: "visible", halign: "right" },
        2: { cellWidth: 8, halign: "center" },
        3: { cellWidth: 12, overflow: "visible", halign: "right" },
        4: { cellWidth: 15, overflow: "visible", halign: "right" },
      },
    });
  
    let finalY = (doc as any).lastAutoTable.finalY;
    // If the content (including the summary) nears the bottom, add a new page.
    if (finalY + summaryHeight > pageHeight) {
      doc.addPage();
      finalY = 10;
    }
  
    // ----- SUMMARY: Totals, Payment, and Return Policy -----
    // Increase right margin offset further and reduce font size for summary texts.
    const summaryRightMargin = 8; // increased margin to push text further inward
    doc.setFontSize(10); // reduced font size to help fit the text
    const subtotalText = `Subtotal: ${currencySymbols[currency]}${overallTotal.toFixed(2)}`;
    doc.text(subtotalText, pageWidth - summaryRightMargin, finalY + 10, { align: "right" });
    
    let newY = finalY + 16;
    if (Number(amountPaid) > 0) {
      const paidText = `Paid Cash: ${currencySymbols[currency]}${Number(amountPaid).toFixed(2)}`;
      doc.text(paidText, pageWidth - summaryRightMargin, newY, { align: "right" });
      newY += 6;
      const change = Number(amountPaid) > overallTotal ? Number(amountPaid) - overallTotal : 0;
      const changeText = `Change: ${currencySymbols[currency]}${change.toFixed(2)}`;
      doc.text(changeText, pageWidth - summaryRightMargin, newY, { align: "right" });
      newY += 6;
    }
    
    const returnPolicyY = newY + 6;
    // Restore font size for the return policy title/text if desired.
    doc.setFontSize(8);
    doc.text("Return Policy:", pageWidth / 2, returnPolicyY, { align: "center" });
    // Render the return policy text using the pre-calculated lines.
    doc.text(policyLines, pageWidth / 2, returnPolicyY + 4, { align: "center" });
  
    // ----- PRINTING & POST-PRINT NAVIGATION -----
    doc.autoPrint();
    const pdfBlobUrl = doc.output("bloburl");
    const newWindow = window.open(pdfBlobUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
      newWindow.onafterprint = () => {
        newWindow.close();
        router.push("/dashboard/invoices");
      };
      const printCheckInterval = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(printCheckInterval);
          router.push("/dashboard/invoices");
        }
      }, 500);
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
    const validItems = invoiceItems.filter((item) => item.fetchedStock !== null);
    if (validItems.length === 0) {
      alert("Please add at least one valid invoice item with stock details.");
      return;
    }
    const finalClientName = clientName.trim() === "" ? "Walk In" : clientName;
    const invoiceData = {
      invoiceName: `Invoice ${invoiceNumber}`,
      total: overallTotal,
      status: "PENDING",
      date: selectedDate.toISOString(),
      fromName: businessDetails.businessName,
      fromEmail: businessDetails.businessEmail,
      fromAddress: businessDetails.businessAddress,
      clientName: finalClientName,
      clientEmail,
      clientAddress,
      currency,
      invoiceNumber: invoiceNumber,
      amountPaid: amountPaid,
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
      await generatePDF();
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  }

  // ------------------------------
  // Handler for key press in the Stock Name autocomplete.
  // ------------------------------
  const handleStockNameKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    index: number,
    suggestions: Stock[]
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const currentIndex = invoiceItems[index].highlightedIndex;
      const newIndex = (currentIndex + 1) % suggestions.length;
      updateInvoiceItem(index, { highlightedIndex: newIndex });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const currentIndex = invoiceItems[index].highlightedIndex;
      const newIndex = (currentIndex - 1 + suggestions.length) % suggestions.length;
      updateInvoiceItem(index, { highlightedIndex: newIndex });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectStock(index, suggestions[invoiceItems[index].highlightedIndex]);
      }
      updateInvoiceItem(index, { showSuggestions: false });
    }
  };

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
                <span className="px-3 border border-r-0 rounded-l-md bg-muted">#</span>
                <Input type="number" value={invoiceNumber.toString()} readOnly className="rounded-l-none" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">United States Dollar -- USD</SelectItem>
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
              <Input placeholder="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              <Input placeholder="Client Email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
              <Input placeholder="Client Address" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
            </div>
          </div>

          {/* Date */}
          <div className="mb-6">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] text-left justify-start">
                  <CalendarIcon className="mr-2" />
                  {new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(selectedDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar selected={selectedDate} onSelect={(date) => setSelectedDate(date || new Date())} mode="single" fromDate={new Date()} />
              </PopoverContent>
            </Popover>
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
              const suggestions = allStocks.filter((stock) =>
                stock.stockName.toLowerCase().includes(item.stockNameInput.toLowerCase())
              );
              return (
                <div key={index} className="border rounded p-4 mb-4 relative">
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    {/* Barcode Input & Buttons */}
                    <div className="space-y-2">
                      <Label>Barcode</Label>
                      <Input value={item.barcode} onChange={(e) => updateInvoiceItem(index, { barcode: e.target.value })} placeholder="Enter barcode" />
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" type="button" size="sm" onClick={() => handleBarcodeLookup(index)}>
                          Search Stock
                        </Button>
                        <Button variant="outline" type="button" size="sm" onClick={() => handleScanBarcode(index)}>
                          Scan Barcode
                        </Button>
                      </div>
                      {item.error && <p className="text-red-500 text-xs">{item.error}</p>}
                    </div>
                    {/* Stock Name Autocomplete */}
                    <div className="space-y-2 relative">
                      <Label>Stock Name</Label>
                      <Input
                        value={item.stockNameInput}
                        onChange={(e) =>
                          updateInvoiceItem(index, {
                            stockNameInput: e.target.value,
                            fetchedStock: null,
                            showSuggestions: true,
                          })
                        }
                        placeholder="Type to search..."
                        onKeyDown={(e) => handleStockNameKeyDown(e, index, suggestions)}
                      />
                      {item.stockNameInput && suggestions.length > 0 && item.showSuggestions && (
                        <div className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto">
                          {suggestions.map((stock, i) => (
                            <div
                              key={stock.id}
                              className={`p-2 cursor-pointer hover:bg-gray-100 ${i === item.highlightedIndex ? "bg-gray-200" : ""}`}
                              onMouseDown={() => handleSelectStock(index, stock)}
                            >
                              <p>{stock.stockName}</p>
                              <p className="text-xs text-gray-600">Barcode: {stock.stockBarcode}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Quantity Input */}
                    <div className="space-y-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = Number(e.target.value);
                          const available = item.fetchedStock ? item.fetchedStock.quantity : Infinity;
                          if (item.fetchedStock && newQuantity > available) {
                            updateInvoiceItem(index, { error: "Qty exceeds stock" });
                          } else {
                            updateInvoiceItem(index, { quantity: e.target.value, error: "" });
                          }
                        }}
                        placeholder="0"
                      />
                    </div>
                    {/* Rate Input */}
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input type="number" value={item.rate} onChange={(e) => updateInvoiceItem(index, { rate: e.target.value })} placeholder="0" readOnly={!!item.fetchedStock} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-1 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Amt</Label>
                      <Input value={itemTotal.toFixed(2)} readOnly />
                    </div>
                  </div>
                  {invoiceItems.length > 1 && (
                    <div className="flex justify-end">
                      <Button variant="destructive" type="button" size="sm" onClick={() => removeInvoiceItem(index)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Details Section */}
          <div className="border p-4 mb-6">
            <h3 className="text-lg font-medium">Payment Details</h3>
            <div className="flex flex-col gap-2">
              <Label>Amount Paid</Label>
              <Input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Payment Summary on the Form */}
          {amountPaid !== "" && (
            <div className="mt-4 border p-2">
              <Label>Payment Summary</Label>
              <p>
                Paid Cash: {currencySymbols[currency]}
                {Number(amountPaid).toFixed(2)}
              </p>
              <p>
                Change Returned: {currencySymbols[currency]}
                {(Number(amountPaid) > overallTotal
                  ? Number(amountPaid) - overallTotal
                  : 0
                ).toFixed(2)}
              </p>
            </div>
          )}

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

          {/* Note Section */}
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
            <div style={{ width: "400px", height: "300px" }}>
              <BarcodeScannerComponent
                width={400}
                height={300}
                onUpdate={(error: unknown, result: any) => {
                  if (result) {
                    const extractedNumber = (result as any).text.replace(/\D/g, "");
                    updateInvoiceItem(scanningIndex, { barcode: extractedNumber, error: "" });
                    handleBarcodeLookup(scanningIndex);
                    setIsScanning(false);
                    setScanningIndex(null);
                  } else if (error) {
                    console.error("Scan error:", error);
                  }
                }}
              />
            </div>
            <Button variant="destructive" onClick={() => { setIsScanning(false); setScanningIndex(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
