"use client";

import React, { useState, useMemo, JSX } from "react";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/app/components/formatCurrency";

// Chart.js imports and registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define the props for our client component.
interface ClientAnalyticsProps {
  rawInvoices: any[];
  rawStocks: any[];
}

export default function ClientAnalytics({
  rawInvoices,
  rawStocks,
}: ClientAnalyticsProps) {
  // ---------- Date Range Filter ----------
  const [range, setRange] = useState<"1week" | "1month" | "1year">("1week");

  // Compute cutoff date based on the selected range.
  const cutoffDate = useMemo((): string => {
    const now = new Date();
    if (range === "1week") now.setDate(now.getDate() - 7);
    else if (range === "1month") now.setMonth(now.getMonth() - 1);
    else if (range === "1year") now.setFullYear(now.getFullYear() - 1);
    return now.toISOString().split("T")[0];
  }, [range]);

  // ---------- Filter Data Based on Date Range ----------
  const filteredInvoices = useMemo(() => {
    return rawInvoices.filter((inv: any): boolean => {
      const invDate: string = new Date(inv.createdAt)
        .toISOString()
        .split("T")[0];
      return invDate >= cutoffDate;
    });
  }, [rawInvoices, cutoffDate]);

  // For stocks, if purchaseDate is missing, fallback to createdAt.
  const filteredStocks = useMemo(() => {
    return rawStocks.filter((stock: any): boolean => {
      const stockDate = stock.purchaseDate || stock.createdAt;
      if (!stockDate) return false;
      const stockDateISO: string = new Date(stockDate)
        .toISOString()
        .split("T")[0];
      return stockDateISO >= cutoffDate;
    });
  }, [rawStocks, cutoffDate]);

  // Build a filtered stock map.
  const filteredStockMap = useMemo(() => {
    const map = new Map<string, any>();
    filteredStocks.forEach((stock: any) => {
      if (stock.id) map.set(stock.id, stock);
    });
    return map;
  }, [filteredStocks]);

  // ---------- Determine Business Currency ----------
  // Assume the business currency is from the first invoice (default to "USD")
  const businessCurrency = useMemo(() => {
    return rawInvoices.length && rawInvoices[0].currency
      ? rawInvoices[0].currency
      : "USD";
  }, [rawInvoices]);

  // ---------- Compute Summary Aggregates (for one currency) ----------
  const totalSalesFiltered = useMemo((): number => {
    return filteredInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0);
  }, [filteredInvoices]);

  const totalPurchasesFiltered = useMemo((): number => {
    return filteredStocks.reduce((sum: number, stock: any) => {
      const rate: number = stock.stockRate ?? 0;
      const qty: number = stock.quantity ?? 0;
      const vatPercent: number = stock.VAT ?? 0;
      return sum + rate * (1 + vatPercent / 100) * qty;
    }, 0);
  }, [filteredStocks]);

  const totalProfitFiltered = useMemo((): number => {
    let profit = 0;
    filteredInvoices.forEach((inv: any) => {
      inv.invoiceItems.forEach((item: any) => {
        const qty: number = item.invoiceItemQuantity ?? 0;
        const sellingRate: number = item.invoiceItemRate ?? 0;
        const stock = item.stockid ? filteredStockMap.get(item.stockid) : null;
        const purchaseRate: number = stock?.stockRate ?? 0;
        profit += (sellingRate - purchaseRate) * qty;
      });
    });
    return profit;
  }, [filteredInvoices, filteredStockMap]);

  const totalVATFiltered = useMemo((): number => {
    let vat = 0;
    filteredInvoices.forEach((inv: any) => {
      inv.invoiceItems.forEach((item: any) => {
        const qty: number = item.invoiceItemQuantity ?? 0;
        const stock = item.stockid ? filteredStockMap.get(item.stockid) : null;
        if (stock && stock.VAT) {
          const rate: number = stock.stockRate ?? 0;
          vat += (stock.VAT / 100) * rate * qty;
        }
      });
    });
    return vat;
  }, [filteredInvoices, filteredStockMap]);

  // ---------- Daily Aggregations for Charts ----------
  const daySalesMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredInvoices.forEach((inv: any) => {
      const day: string = new Date(inv.createdAt).toISOString().split("T")[0];
      map.set(day, (map.get(day) || 0) + inv.total);
    });
    return map;
  }, [filteredInvoices]);

  const dayProfitMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredInvoices.forEach((inv: any) => {
      const day: string = new Date(inv.createdAt).toISOString().split("T")[0];
      let invProfit = 0;
      inv.invoiceItems.forEach((item: any) => {
        const qty: number = item.invoiceItemQuantity ?? 0;
        const sellingRate: number = item.invoiceItemRate ?? 0;
        const stock = item.stockid ? filteredStockMap.get(item.stockid) : null;
        const purchaseRate: number = stock?.stockRate ?? 0;
        invProfit += (sellingRate - purchaseRate) * qty;
      });
      map.set(day, (map.get(day) || 0) + invProfit);
    });
    return map;
  }, [filteredInvoices, filteredStockMap]);

  const dayPurchasesMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredStocks.forEach((stock: any) => {
      const stockDate = stock.purchaseDate || stock.createdAt;
      if (stockDate) {
        const day: string = new Date(stockDate).toISOString().split("T")[0];
        const rate: number = stock.stockRate ?? 0;
        const qty: number = stock.quantity ?? 0;
        const vatPercent: number = stock.VAT ?? 0;
        const purchaseAmt: number = rate * (1 + vatPercent / 100) * qty;
        map.set(day, (map.get(day) || 0) + purchaseAmt);
      }
    });
    return map;
  }, [filteredStocks]);

  const allDaysSet = useMemo(() => {
    return new Set<string>([
      ...Array.from(daySalesMap.keys()),
      ...Array.from(dayProfitMap.keys()),
      ...Array.from(dayPurchasesMap.keys()),
    ]);
  }, [daySalesMap, dayProfitMap, dayPurchasesMap]);
  const sortedDays = useMemo(() => Array.from(allDaysSet).sort(), [allDaysSet]);

  const chartDataSalesValues = useMemo(
    () => sortedDays.map((day: string) => daySalesMap.get(day) || 0),
    [sortedDays, daySalesMap]
  );
  const chartDataProfitValues = useMemo(
    () => sortedDays.map((day: string) => dayProfitMap.get(day) || 0),
    [sortedDays, dayProfitMap]
  );
  const chartDataPurchasesValues = useMemo(
    () => sortedDays.map((day: string) => dayPurchasesMap.get(day) || 0),
    [sortedDays, dayPurchasesMap]
  );

  const cumulativeSales = useMemo((): number[] => {
    const arr: number[] = [];
    let sum = 0;
    chartDataSalesValues.forEach((val: number) => {
      sum += val;
      arr.push(sum);
    });
    return arr;
  }, [chartDataSalesValues]);

  const cumulativeProfit = useMemo((): number[] => {
    const arr: number[] = [];
    let sum = 0;
    chartDataProfitValues.forEach((val: number) => {
      sum += val;
      arr.push(sum);
    });
    return arr;
  }, [chartDataProfitValues]);

  const cumulativePurchases = useMemo((): number[] => {
    const arr: number[] = [];
    let sum = 0;
    chartDataPurchasesValues.forEach((val: number) => {
      sum += val;
      arr.push(sum);
    });
    return arr;
  }, [chartDataPurchasesValues]);

  // ---------- Prepare Chart.js Data Objects ----------
  const profitColor =
    totalProfitFiltered >= 0 ? "rgba(16,185,129,1)" : "rgba(239,68,68,1)";
  const profitFill =
    totalProfitFiltered >= 0 ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)";

  const chartDataSales = {
    labels: sortedDays,
    datasets: [
      {
        label: "Daily Sales",
        data: chartDataSalesValues,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.4,
      },
    ],
  };
  const chartDataProfit = {
    labels: sortedDays,
    datasets: [
      {
        label: "Daily Profit",
        data: chartDataProfitValues,
        fill: false,
        borderColor: profitColor,
        backgroundColor: profitFill,
        tension: 0.4,
      },
    ],
  };
  const chartDataPurchases = {
    labels: sortedDays,
    datasets: [
      {
        label: "Daily Purchases",
        data: chartDataPurchasesValues,
        fill: false,
        borderColor: "rgba(75,75,192,1)",
        tension: 0.4,
      },
    ],
  };
  const chartDataCumulativeSales = {
    labels: sortedDays,
    datasets: [
      {
        label: "Cumulative Sales",
        data: cumulativeSales,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.4,
      },
    ],
  };
  const chartDataCumulativeProfit = {
    labels: sortedDays,
    datasets: [
      {
        label: "Cumulative Profit",
        data: cumulativeProfit,
        fill: false,
        borderColor: profitColor,
        backgroundColor: profitFill,
        tension: 0.4,
      },
    ],
  };
  const chartDataCumulativePurchases = {
    labels: sortedDays,
    datasets: [
      {
        label: "Cumulative Purchases",
        data: cumulativePurchases,
        fill: false,
        borderColor: "rgba(192,192,75,1)",
        tension: 0.4,
      },
    ],
  };

  // Define chart options with explicit type.
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      x: {
        type: "category",
        labels: sortedDays,
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "center",
        fullSize: true,
        labels: {
          boxWidth: 20,
          padding: 10,
        },
      },
    },
    animation: { duration: 1000, easing: "easeInOutQuad" },
  };

  // ---------- Animation Variant for Summary Cards ----------
  const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  // ---------- Render Single Currency Summary Cards ----------
  const summaryData = [
    {
      title: "Total Sales",
      value: totalSalesFiltered,
      currency: businessCurrency,
    },
    {
      title: "Total Purchases",
      value: totalPurchasesFiltered,
      currency: businessCurrency,
    },
    {
      title: "Total Profit",
      value: totalProfitFiltered,
      currency: businessCurrency,
    },
    {
      title: "Total VAT Collected",
      value: totalVATFiltered,
      currency: businessCurrency,
    },
  ];

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p>
          Get <span className="text-green-500">Instant Reports</span> here
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-4">
        <label className="font-medium">Select Date Range:</label>
        <select
          value={range}
          onChange={(e) =>
            setRange(e.target.value as "1week" | "1month" | "1year")
          }
          className="p-2 border rounded"
        >
          <option value="1week">1 Week</option>
          <option value="1month">1 Month</option>
          <option value="1year">1 Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item, i: number) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariant}
          >
            <Card>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-xl font-bold ${
                    item.title === "Total Profit"
                      ? item.value >= 0
                        ? "text-green-500"
                        : "text-red-500"
                      : ""
                  }`}
                >
                  <CountUp
                    end={item.value}
                    duration={1.5}
                    prefix={
                      formatCurrency({ amount: 0, currency: item.currency }).slice(0, 1)
                    }
                    decimals={2}
                  />
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Profit Card (if desired) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-4 shadow">
          <h2 className="text-xl font-bold">Total Profit ({businessCurrency})</h2>
          <p className="text-2xl">
            {formatCurrency({ amount: totalProfitFiltered, currency: businessCurrency as any })}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Daily Sales Trend Chart */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Daily Sales Trend</h2>
          <div className="border border-green-500/50 rounded p-4">
            <Line data={chartDataSales} options={chartOptions} />
          </div>
        </div>

        {/* Daily Profit Trend Chart */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Daily Profit Trend</h2>
          <div
            className={`border rounded p-4 ${
              chartDataProfit.datasets[0].data.reduce((a: number, b: number) => a + b, 0) >= 0
                ? "border-green-500/50"
                : "border-red-500/50"
            }`}
          >
            <Line data={chartDataProfit} options={chartOptions} />
          </div>
        </div>

        {/* Daily Purchases Trend Chart */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Daily Purchases Trend</h2>
          <div className="border border-green-500/50 rounded p-4">
            <Line data={chartDataPurchases} options={chartOptions} />
          </div>
        </div>

        {/* Cumulative Sales Chart */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Cumulative Sales</h2>
          <div className="border border-green-500/50 rounded p-4">
            <Line data={chartDataCumulativeSales} options={chartOptions} />
          </div>
        </div>

        {/* Cumulative Profit Chart */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Cumulative Profit</h2>
          <div
            className={`border rounded p-4 ${
              chartDataCumulativeProfit.datasets[0].data.reduce((a: number, b: number) => a + b, 0) >= 0
                ? "border-green-500/50"
                : "border-red-500/50"
            }`}
          >
            <Line data={chartDataCumulativeProfit} options={chartOptions} />
          </div>
        </div>

        {/* Cumulative Purchases Chart */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Cumulative Purchases</h2>
          <div className="border border-green-500/50 rounded p-4">
            <Line data={chartDataCumulativePurchases} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
