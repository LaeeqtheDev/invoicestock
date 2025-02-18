"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Stock } from "@/app/types/types"; // Ensure your Stock type includes `stockImage`
import { StockActions } from "@/app/components/stockActions";

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: string | null): string => {
  if (!date) return "";
  return date.split("T")[0];
};

// Helper function to construct the Cloudinary URL.
// If the stored value is already a URL, we return it as is.
const getCloudinaryImageUrl = (publicId: string): string => {
  // Check if it's already a URL
  if (publicId.startsWith("http")) return publicId;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.error("Cloudinary cloud name is not set in environment variables.");
    return publicId;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};

const StockList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<Stock[]>([]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        console.log("Fetching stock data...");
        const response = await fetch("/api/stock");
        if (response.ok) {
          const stocks: Stock[] = await response.json();
          console.log("Fetched stock data:", stocks);
          setData(stocks);
        } else {
          console.error("Failed to fetch stock data");
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStockData();
  }, []);

  const filteredData = data.filter((stock) =>
    [stock.stockBarcode, stock.category, stock.subCategory, stock.status].some(
      (field) => field?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  console.log("Current search term:", searchTerm);
  console.log("Filtered data:", filteredData);

  return (
    <div className="overflow-hidden px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Stock</CardTitle>
              <CardDescription>
                Manage your{" "}
                <span className="text-green-500 font-semibold">Stock</span>{" "}
                right here
              </CardDescription>
            </div>
            <Link href="/dashboard/stock/create" className={buttonVariants()}>
              <PlusIcon /> Add Stock
            </Link>
          </div>
          <input
            type="text"
            placeholder="Search Stock..."
            className="mt-4 p-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => {
              console.log("Search term changed to:", e.target.value);
              setSearchTerm(e.target.value);
            }}
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="w-full min-w-max">
            <TableHeader>
              <TableRow>
                {[
                  "Barcode",
                  "Name",
                  "Image",
                  "Category",
                  "SubCategory",
                  "Status",
                  "Quantity",
                  "Stock Rate",
                  "Selling Rate",
                  "Supplier",
                  "Purchase Date",
                  "Expiry Date",
                  "Discount",
                  "VAT",
                  "SKU",
                  "Actions",
                ].map((head) => (
                  <TableHead
                    key={head}
                    className="px-3 py-2 text-center text-xs sm:text-sm"
                  >
                    {head}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((stock, index) => {
                console.log(`Rendering stock at index ${index}:`, stock);
                // Compute status based on quantity: if quantity is less than 5, it's Out of Stock.
                const computedStatus =
                  (stock.quantity ?? 0) < 5 ? "Out of Stock" : "In Stock";
                return (
                  <TableRow key={index}>
                    <TableCell className="px-3 py-2 text-center truncate max-w-[150px]">
                      {stock.stockBarcode}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center truncate max-w-[150px]">
                      {stock.stockName}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {stock.stockImage ? (
                        <img
                          src={getCloudinaryImageUrl(stock.stockImage)}
                          alt={stock.stockName}
                          className="w-20 h-20 object-cover mx-auto"
                        />
                      ) : (
                        "No Image"
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center truncate max-w-[150px]">
                      {stock.category}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center truncate max-w-[150px]">
                      {stock.subCategory}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <Badge
                        className={
                          computedStatus === "In Stock"
                            ? "bg-green-500 hover:bg-green-600 dark:text-white cursor-default"
                            : "bg-red-500 dark:text-white hover:bg-red-600 cursor-default"
                        }
                      >
                        {computedStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {stock.quantity}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {stock.stockRate}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {stock.sellingRate}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {stock.supplier}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {formatDate(stock.purchaseDate)}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {formatDate(stock.expiryDate)}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {stock.discount ? "Yes" : "No"}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {stock.VAT}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      {stock.SKU}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <StockActions stockid={stock.id} refreshData={() => {}} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockList;
