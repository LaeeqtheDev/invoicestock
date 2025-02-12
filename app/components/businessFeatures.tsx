// app/components/BusinessFeatures.tsx
"use client";

import React from "react";

import {
  Store,
  Martini, // Use for Bars
  Coffee, // Use for Cafés
  ShoppingCart, // Use for Grocery
  Briefcase, // Use for Pharma
  Pizza, // Use for Restaurants
  Scissors, // Use for Beauty Salons
  Dumbbell, // Use for Fitness Centers
  Bed, // Use for Hotels
} from "lucide-react";

export function BusinessFeatures() {
  const features = [
    {
      title: "Retail",
      description:
        "Streamline inventory, sales, and invoicing for retail stores.",
      Icon: Store,
    },
    {
      title: "Bars",
      description:
        "Manage drink orders, stock, and finances effortlessly for bars.",
      Icon: Martini,
    },
    {
      title: "Cafés",
      description:
        "Keep track of daily sales and inventory to run a successful café.",
      Icon: Coffee,
    },
    {
      title: "Grocery",
      description:
        "Ensure your grocery store is always stocked with our inventory solutions.",
      Icon: ShoppingCart,
    },
    {
      title: "Pharma",
      description:
        "Meet regulatory standards and manage stock in pharmaceutical outlets.",
      Icon: Briefcase,
    },
    {
      title: "Restaurants",
      description:
        "Streamline orders, manage inventory, and optimize sales in restaurants.",
      Icon: Pizza,
    },
    {
      title: "Beauty Salons",
      description:
        "Handle appointments and product inventory in salons with ease.",
      Icon: Scissors,
    },
    {
      title: "Fitness Centers",
      description:
        "Manage memberships, merchandise, and equipment inventory effortlessly.",
      Icon: Dumbbell,
    },
    {
      title: "Hotels",
      description:
        "Integrate room service, inventory, and finances for seamless operations.",
      Icon: Bed,
    },
  ];

  return (
    <section className=" body-font ">
      <div className="container px-5 py-24 mx-auto">
        {/* Header */}

        <h1 className="sm:text-7xl text-3xl font-bold text-center text-black mb-20">
          More for your Business
        </h1>
        {/* Features List */}
        <div className="flex flex-wrap sm:-m-4 -mx-4 -mb-10 -mt-4 md:space-y-0 space-y-6 bg-black rounded-3xl">
          {features.map((feature, index) => (
            <div key={index} className="p-4 md:w-1/3 flex">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-white text-black mb-4 flex-shrink-0">
                <feature.Icon className="w-6 h-6" />
              </div>
              <div className="flex-grow pl-6">
                <h2 className="text-white text-lg title-font font-medium mb-2">
                  {feature.title}
                </h2>
                <p className="leading-relaxed text-white">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
