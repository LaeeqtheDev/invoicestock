// /components/MobileSidebar.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import DashboardLinks from "./DashboardLinks";

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle button visible only on small screens */}
      <div className="md:hidden">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
          <Menu size={5} />
        </Button>
      </div>

      {isOpen && (
        <>
          {/* Sidebar overlay */}
          <div className="fixed inset-0 z-50 flex">
            {/* Sidebar panel */}
            <div className="relative w-4/5 sm:w-3/5 bg-white dark:bg-black h-full p-4">
              {/* Close button on top left */}
              <button
                className="absolute top-4 left-4"
                onClick={() => setIsOpen(false)}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
              <nav className="mt-10 px-4">
                <DashboardLinks />
              </nav>
            </div>
            {/* Semi-transparent backdrop */}
            <div
              className="flex-1 bg-black opacity-50"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
