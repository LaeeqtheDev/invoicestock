// app/components/BusinessTestimonial.tsx
"use client";

import React from "react";
import Link from "next/link";
import { User } from "lucide-react";

export function BusinessTestimonial() {
  return (
    <section className="text-white body-font bg-black rounded-3xl">
      <div className="container px-5 py-14 mx-auto flex flex-col">
        {/* Header Image */}
        <div className="lg:w-4/6 mx-auto">
          {/* Testimonial Content */}
          <div className="flex flex-col sm:flex-row mt-10">
            {/* Left Column: CEO Image and Details */}
            <div className="sm:w-1/3 text-center sm:pr-8 sm:py-8">
              <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-white text-black mb-4 flex-shrink-0">
                <User className="w-10 h-10" />
              </div>
              <div className="flex flex-col items-center text-center justify-center">
                <h2 className="font-medium title-font mt-4 text-whit text-lg">
                  Edward Martin
                </h2>
                <div className="w-12 h-1 bg-white rounded mt-2 mb-4 text-center justify-center"></div>
                <p className="text-base"></p>
              </div>
            </div>
            {/* Right Column: Additional Testimonial Content */}
            <div className="sm:w-2/3 sm:pl-8 sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
              <p className="leading-relaxed text-lg mb-4">
                " With a deep understanding of the challenges faced by small
                businesses, I am committed to delivering innovative strategies
                and tools that drive growth and efficiency. My goal is to
                empower entrepreneurs with the solutions they need to thrive in
                a competitive market.""
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
