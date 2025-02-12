// /dashboard/tax-certificates/TaxCertificateClient.tsx
"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/app/components/formatCurrency";

interface TaxCertificateClientProps {
  totalSales: number;
  totalProfit: number;
  totalVAT: number;
}

// Define tax rates for US and UK, and also specify the currency for each country
const TAX_RATES = {
  US: 0.21, // 21%
  UK: 0.19, // 19%
};

export default function TaxCertificateClient({
  totalSales,
  totalProfit,
  totalVAT,
}: TaxCertificateClientProps) {
  const [country, setCountry] = useState<"US" | "UK">("US");

  // Choose currency based on selected country: US uses USD, UK uses GBP
  const currency = country === "US" ? "USD" : "GBP";

  // Get applicable tax rate
  const taxRate = TAX_RATES[country];

  // Compute estimated tax due (based on profit)
  const taxDue = totalProfit * taxRate;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Tax Certificate</h1>
      <p className="mb-4 text-lg">
        The certificate below summarizes your business performance for tax
        filing.
      </p>

      <div className="mb-6">
        <label htmlFor="country" className="block mb-2 font-medium">
          Select Country:
        </label>
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value as "US" | "UK")}
          className="p-2 border rounded w-full"
        >
          <option value="US">United States</option>
          <option value="UK">United Kingdom</option>
        </select>
      </div>

      <div className="border p-4 rounded shadow bg-white">
        {country === "US" ? (
          <>
            <h2 className="text-xl font-bold mb-2">US Tax Certificate</h2>
            <p className="mb-2">
              This certificate is generated according to U.S. tax law.
            </p>
            <ul className="list-disc pl-5 mb-2">
              <li>
                <strong>Total Sales:</strong>{" "}
                {formatCurrency({ amount: totalSales, currency: "USD" })}
              </li>
              <li>
                <strong>Total Profit:</strong>{" "}
                {formatCurrency({ amount: totalProfit, currency: "USD" })}
              </li>
              <li>
                <strong>Total VAT Collected:</strong>{" "}
                {formatCurrency({ amount: totalVAT, currency: "USD" })}
              </li>
              <li>
                <strong>Applicable Tax Rate:</strong> 21%
              </li>
              <li>
                <strong>Estimated Tax Due:</strong>{" "}
                {formatCurrency({ amount: taxDue, currency: "USD" })}
              </li>
            </ul>
            <p className="mt-2 text-sm italic">
              Please verify all details with your accountant before filing.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">UK Tax Certificate</h2>
            <p className="mb-2">
              This certificate is generated according to UK tax law.
            </p>
            <ul className="list-disc pl-5 mb-2">
              <li>
                <strong>Total Sales:</strong>{" "}
                {formatCurrency({ amount: totalSales, currency: "GBP" })}
              </li>
              <li>
                <strong>Total Profit:</strong>{" "}
                {formatCurrency({ amount: totalProfit, currency: "GBP" })}
              </li>
              <li>
                <strong>Total VAT Collected:</strong>{" "}
                {formatCurrency({ amount: totalVAT, currency: "GBP" })}
              </li>
              <li>
                <strong>Applicable Tax Rate:</strong> 19%
              </li>
              <li>
                <strong>Estimated Tax Due:</strong>{" "}
                {formatCurrency({ amount: taxDue, currency: "GBP" })}
              </li>
            </ul>
            <p className="mt-2 text-sm italic">
              Please verify all details with your accountant before filing.
            </p>
          </>
        )}
      </div>

      <button
        onClick={() => window.print()}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Print Certificate
      </button>
    </div>
  );
}
