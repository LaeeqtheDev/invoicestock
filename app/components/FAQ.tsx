"use client";

import React from "react";

export function FAQ() {
  return (
    <div className="relative w-full bg-gradient-to-r from-white via-green-100 to-white ">
      <div className="mx-auto px-5">
        <div className="flex flex-col items-center">
          <h2 className="mt-5 text-center text-3xl font-bold tracking-tight md:text-5xl">
            FAQ
          </h2>
          <p className="mt-3 text-lg text-neutral-600 md:text-xl">
            Frequently asked questions
          </p>
        </div>
        <div className="mx-auto mt-8 grid max-w-xl divide-y divide-neutral-300">
          {faqItems.map((item, index) => (
            <div key={index} className="py-5">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  <span>{item.question}</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="group-open:animate-fadeIn mt-3 text-neutral-700">
                  {item.answer}
                </p>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const faqItems = [
  {
    question: "What is InvoiceStock?",
    answer:
      "InvoiceStock is a powerful stock and invoice management software designed to help businesses track inventory, manage transactions, and streamline invoicing with ease.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes! InvoiceStock offers a free trial so you can explore the features before making a commitment. No credit card required.",
  },
  {
    question: "Can I integrate InvoiceStock with my existing POS system?",
    answer:
      "Yes! InvoiceStock is designed to be compatible with barcode scanners, cash drawers, and other POS hardware for a seamless experience.",
  },
  {
    question: "Does InvoiceStock support multi-currency transactions?",
    answer:
      "Absolutely! Our platform allows you to manage transactions in multiple currencies, making it ideal for businesses operating internationally.",
  },
  {
    question: "How can I migrate my existing data to InvoiceStock?",
    answer:
      "We provide free data migration support. Just reach out to our team, and we'll assist you in transferring your existing data securely and efficiently.",
  },
  {
    question: "What kind of customer support do you offer?",
    answer:
      "We offer premium support, including email and chat assistance. Plus, we provide step-by-step guidance for setting up your business on InvoiceStock.",
  },
];
