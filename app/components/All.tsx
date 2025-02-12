// app/dashboard/ContactUs.tsx
"use client";

import { RainbowButton } from "@/components/ui/rainbow-button";
import React, { useState } from "react";
import Link from "next/link";

const ContactUs = () => {
  // Optional: State for form fields if you want to include their data in the mailto URL
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");

  const handleSendQuery = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Construct a mailto URL. You can update the email address, subject, and body as needed.
    const subject = encodeURIComponent("Inquiry from InvoiceStock");
    const body = encodeURIComponent(
      `Hello,\n\nMy name is ${firstName} ${lastName}. You can reach me at ${email} or ${phone}.\n\nDetails:\n${details}\n\nThank you!`,
    );
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-gradient-to-r from-white via-green-100 to-white max-w-[85rem] px-5 py-24 mx-auto text-center">
      <div className="max-w-2xl lg:max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-6xl font-semibold text-gray-800 sm:text-4xl dark:text-white">
            Contact us
          </h1>
          <p className="mt-1 text-gray-600 dark:text-neutral-400">
            We'd love to talk about how we can help you.
          </p>
        </div>

        <div className="mt-12">
          {/* Contact Form Card */}
          <div className="flex flex-col rounded-xl p-4 sm:p-6 lg:p-8 bg-white">
            <h2 className="mb-8 text-xl font-semibold text-gray-800 dark:text-neutral-200">
              Fill in the form
            </h2>

            <form>
              <div className="grid gap-4">
                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="sr-only">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="First Name"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="sr-only">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Email"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="sr-only">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Phone Number"
                  />
                </div>

                {/* Details */}
                <div>
                  <label htmlFor="details" className="sr-only">
                    Details
                  </label>
                  <textarea
                    id="details"
                    name="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Details"
                  ></textarea>
                </div>
              </div>

              <div className="mt-4 grid">
                <RainbowButton onClick={handleSendQuery}>
                  Send Query
                </RainbowButton>
              </div>

              <div className="mt-3 text-center">
                <p className="text-sm text-gray-500 dark:text-neutral-500">
                  We'll get back to you in 1-2 business days.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
