// /components/ui/visually-hidden.tsx
import React from "react";

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
