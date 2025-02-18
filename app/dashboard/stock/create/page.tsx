"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
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

interface FormData {
  stockBarcode: string;
  stockID: string;
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
  purchaseDate: string;
  expiryDate: string;
  stockLocation: string;
}

export default function CreateStockPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    stockBarcode: "",
    stockID: "",
    stockName: "",
    SKU: "",
    category: "",
    subCategory: "",
    status: "",
    supplier: "",
    quantity: 0,
    stockRate: 0,
    sellingRate: 0,
    discountAllowed: false,
    VAT: 0,
    purchaseDate: "",
    expiryDate: "",
    stockLocation: "",
  });
  // State for image upload
  const [stockImageUrl, setStockImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Generates a random SKU
  const generateSKU = () => {
    setFormData((prev) => ({
      ...prev,
      SKU: `SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  // Reuse your existing file upload function
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formDataFile = new FormData();
    formDataFile.append("file", file);
    formDataFile.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    );

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataFile,
      });

      const data = await res.json();

      if (data.secure_url) {
        setStockImageUrl(data.secure_url);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate the status field
    if (!["In Stock", "Out of Stock"].includes(formData.status)) {
      setError("Status must be either 'In Stock' or 'Out of Stock'.");
      setLoading(false);
      return;
    }

    // Convert dates from string to Date object (or undefined if empty)
    const formattedData = {
      ...formData,
      purchaseDate: formData.purchaseDate
        ? new Date(formData.purchaseDate)
        : undefined,
      expiryDate: formData.expiryDate
        ? new Date(formData.expiryDate)
        : undefined,
    };

    const parsedData = StockSchema.safeParse(formattedData);

    if (!parsedData.success) {
      console.log(parsedData.error.format());
      setError(parsedData.error.errors[0].message);
      setLoading(false);
      return;
    }

    // Include the uploaded image URL (if available)
    const stockPayload = {
      ...parsedData.data,
      stockImage: stockImageUrl,
    };

    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockPayload),
      });

      if (!res.ok) throw new Error("Failed to create stock");

      router.push("/dashboard/stock");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Stock</CardTitle>
            <CardDescription>
              Add the{" "}
              <span className="text-green-500 font-semibold">Product</span>{" "}
              right here
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} noValidate>
          {error && <p className="text-red-500 mb-4">{error}</p>}
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
                name="stockID"
                value={formData.stockID}
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
              <Label>Status (In Stock or Out of Stock)</Label>
              <Input
                name="status "
                value={formData.status}
                onChange={handleChange}
                placeholder="In Stock or Out of Stock"
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
              <div className="flex gap-2">
                <Input
                  name="SKU"
                  value={formData.SKU}
                  onChange={handleChange}
                  placeholder="SKU"
                  required
                />
                <Button type="button" onClick={generateSKU}>
                  Auto-generate
                </Button>
              </div>
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
          {/* File input for the stock image */}
          <div className="mb-6">
            <Label>Stock Image</Label>
            <Input
              type="file"
              name="stockImage"
              onChange={handleFileChange}
              accept="image/*"
            />
            {isUploading && <p>Uploading...</p>}
            {stockImageUrl && (
              <img
                src={stockImageUrl}
                alt="Stock preview"
                className="mt-2 h-20"
              />
            )}
          </div>
          <div className="flex items-center justify-end mt-6">
            <SubmitButton
              text={loading ? "Adding..." : "Add Stock"}
              disabled={loading || isUploading}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
