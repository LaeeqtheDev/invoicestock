"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/app/components/SubmitButtons";
import { StockSchema } from "@/app/utils/zodSchema";
import { Stock } from "@/app/types/types";

interface FormData {
  stockBarcode: string;
  stockid: string;
  stockName: string;
  SKU: string;
  category: string;
  subCategory: string;
  status: string;
  supplier: string;
  quantity: number;
  stockRate: number;
  sellingRate: number;
  discountAllowed: boolean;
  VAT: number;
  purchaseDate: any;
  expiryDate: any;
  stockLocation: any;
}

export default function EditStockPage() {
  const router = useRouter();
  const { stockid } = useParams(); // Get the stockId from URL params
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string>(""); // Track error message
  const [loading, setLoading] = useState<boolean>(false); // Track loading state

  // Fetch stock data based on stockId when the component mounts
  useEffect(() => {
    if (!stockid) return; // If stockId is not available, return early

    const fetchStock = async () => {
      try {
        const response = await fetch(`/api/stock/${stockid}`);
        if (!response.ok) {
          throw new Error("Failed to fetch stock details.");
        }
        const data = await response.json();
        setFormData(data); // Populate form data with fetched stock data
      } catch (error) {
        console.error("Error fetching stock:", error);
        setError("Error fetching stock data.");
      }
    };

    fetchStock();
  }, [stockid]);

  // Handle changes to form inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (prev) {
        return {
          ...prev,
          [name]:
            type === "checkbox"
              ? checked
              : type === "number"
                ? Number(value)
                : value,
        };
      }
      return prev;
    });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); // Reset error message
    setLoading(true); // Set loading state

    // Validate the status field
    if (!["In Stock", "Out of Stock"].includes(formData?.status || "")) {
      setError("Status must be either 'In Stock' or 'Out of Stock'.");
      setLoading(false);
      return;
    }

    // Convert dates from string to Date object (or undefined if empty)
    const formattedData = {
      ...formData,
      purchaseDate: formData?.purchaseDate
        ? new Date(formData.purchaseDate)
        : undefined,
      expiryDate: formData?.expiryDate
        ? new Date(formData.expiryDate)
        : undefined,
    };

    // Parse the data with Zod schema
    const parsedData = StockSchema.safeParse(formattedData);

    // Handle validation errors
    if (!parsedData.success) {
      console.log(parsedData.error.format()); // Debugging to see missing fields
      setError(parsedData.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      // Send the PUT request to update the stock
      const res = await fetch(`/api/stock/${stockid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData.data), // Send the validated data
      });

      if (!res.ok) throw new Error("Failed to update stock");

      router.push("/dashboard/stock"); // Redirect to the stock dashboard on success
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message); // Set error message if request fails
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  // Loading state if form data is not yet available
  if (!formData) {
    return <div>Loading...</div>; // Show loading indicator while fetching stock data
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Edit Stock</CardTitle>
            <CardDescription>
              Edit the{" "}
              <span className="text-green-500 font-semibold">Product</span>{" "}
              details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} noValidate>
          {error && <p className="text-red-500 mb-4">{error}</p>}{" "}
          {/* Error display */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Stock Barcode</Label>
              <Input
                name="stockBarcode"
                value={formData.stockBarcode}
                onChange={handleChange}
                placeholder="Stock Barcode"
                required
              />
            </div>
            <div>
              <Label>Stock ID</Label>
              <Input
                name="stockid" // Changed from stockID to stockid
                value={formData.stockid}
                onChange={handleChange}
                placeholder="Stock ID"
                required
              />
            </div>
            <div>
              <Label>Stock Name</Label>
              <Input
                name="stockName"
                value={formData.stockName}
                onChange={handleChange}
                placeholder="Stock Name"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Category</Label>
              <Input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Category"
                required
              />
            </div>
            <div>
              <Label>SubCategory</Label>
              <Input
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="SubCategory"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Status</Label>
              <Input
                name="status"
                value={formData.status}
                onChange={handleChange}
                placeholder="Status"
                required
              />
            </div>
            <div>
              <Label>Supplier</Label>
              <Input
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Supplier"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Quantity"
              />
            </div>
            <div>
              <Label>Stock Rate</Label>
              <Input
                type="number"
                name="stockRate"
                value={formData.stockRate}
                onChange={handleChange}
                placeholder="Stock Rate"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Selling Rate</Label>
              <Input
                type="number"
                name="sellingRate"
                value={formData.sellingRate}
                onChange={handleChange}
                placeholder="Selling Rate"
              />
            </div>
            <div>
              <Label>Discount Allowed</Label>
              <Input
                type="checkbox"
                name="discountAllowed"
                checked={formData.discountAllowed}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>VAT</Label>
              <Input
                type="number"
                name="VAT"
                value={formData.VAT}
                onChange={handleChange}
                placeholder="VAT"
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                name="SKU"
                value={formData.SKU}
                onChange={handleChange}
                placeholder="SKU"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Purchase Date</Label>
              <Input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Stock Location</Label>
              <Input
                name="stockLocation"
                value={formData.stockLocation}
                onChange={handleChange}
                placeholder="Stock Location"
              />
            </div>
          </div>
          <SubmitButton loading={loading} text={"Save Changes"} />
        </form>
      </CardContent>
    </Card>
  );
}
