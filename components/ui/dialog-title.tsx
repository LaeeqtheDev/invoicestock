// /components/ui/dialog-title.tsx
import React from "react";

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
  // The "sr-only" class from Tailwind CSS hides the element visually but leaves it accessible for screen readers.
  return <h2 className={`sr-only ${className}`}>{children}</h2>;
}
