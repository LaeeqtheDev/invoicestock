import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white rounded-lg shadow m-4 dark:bg-gray-800">
      <div className="w-full mx-auto max-w-screen-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        {/* Links Section (Row with justify-between on sm and larger) */}
        <ul className="flex justify-between sm:flex-row sm:items-center sm:justify-between sm:w-auto w-full text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          <li className="mb-2 sm:mb-0 sm:mx-4">
            <a href="#" className="hover:underline">
              About
            </a>
          </li>
          <li className="mb-2 sm:mb-0 sm:mx-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
          </li>
          <li className="mb-2 sm:mb-0 sm:mx-4">
            <a href="#" className="hover:underline">
              Licensing
            </a>
          </li>
        </ul>

        {/* Copyright Section (Centered Only on sm and below) */}
        <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-left text-center sm:mb-0 mb-4">
          © 2025{" "}
          <a href="https://invoicestock.com/" className="hover:underline">
            InvoiceStock™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
