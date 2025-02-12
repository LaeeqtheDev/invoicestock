export interface Stock {
  VAT: any;
  id: string;

  stockId: string;
  stockBarcode: string;
  stockNumber: string;
  category: string;
  subCategory: string;
  status: string;
  quantity: number;
  stockRate: number;
  sellingRate: number;
  supplier: string;
  purchaseDate: string; // You can change this to Date if you prefer using Date objects
  expiryDate: any; // Same as above
  stockLocation: any;
  reorderLevel: number;
  discount: boolean;
  vat: boolean;
  stockImage: string; // Assuming a URL or file path for stock image
  SKU: string; // Stock Keeping Unit
  stockName: string;
}
