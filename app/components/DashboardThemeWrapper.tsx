// components/DashboardThemeWrapper.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function DashboardThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}
