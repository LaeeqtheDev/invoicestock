import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react"; // Import SessionProvider

const geistSans = { variable: "font-sans-fallback" };
const geistMono = { variable: "font-mono-fallback" };

export const metadata: Metadata = {
  title: "InvoiceStock",
  description:
    "Effortlessly manage your inventory, generate invoices, and streamline billing with our advanced stock and bill management platform. Perfect for businesses of all sizes to track inventory, automate invoicing, and optimize financial operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap the app in SessionProvider for session context */}
        <SessionProvider>
          <main>{children}</main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
