// app/components/Hero.tsx
"use client";

import { RainbowButton } from "@/components/ui/rainbow-button";
import Link from "next/link";
import Safari from "@/components/ui/safari";
import dashboardHero from "@/public/dashboardHero.png";

export function Hero() {
  return (
    <section className="relative py-16 lg:py-24 sm:py-2">
      <div className="container mx-auto px-4">
        {/* Flex container: one column on mobile, two columns on md+ */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Text & CTA Block */}
          <div className="flex-1 text-center">
            <h1 className="mt-8 text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              Manage Stock Track Finances Simplify Invoicing{" "}
              <span className="block bg-gradient-to-l from-blue-800 via-teal-500 to-green-500 text-transparent bg-clip-text">
                Anytime,
              </span>{" "}
              <span className="block bg-gradient-to-l from-orange-800 via-red-500 to-green-500 text-transparent bg-clip-text">
                <span className="inline-block overflow-hidden whitespace-nowrap">
                  <span className="animate-typewriter">Anywhere!</span>
                </span>
              </span>
            </h1>
            <p className="max-w-xl mx-auto mt-4 text-muted-foreground">
              Stock, sales, and invoices can be a{" "}
              <span className="font-semibold text-orange-500">JOKE!</span> We at
              InvoiceStock make it a seriously smooth ride!
            </p>
            <div className="mb-12 mt-7 sm:mb-0">
              <Link href="/login">
                <RainbowButton>Get Unlimited Access</RainbowButton>
              </Link>
            </div>
          </div>

          {/* Safari Component Block - Hidden on Mobile */}
          <div className="flex-1  md:block">
            <div className="relative w-full h-auto">
              <Safari
                url="www.InvoiceStock.com"
                imageSrc={dashboardHero.src}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
