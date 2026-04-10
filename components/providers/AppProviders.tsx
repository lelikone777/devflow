"use client";

import { ReactNode } from "react";

import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/context/Theme";

interface AppProvidersProps {
  children: ReactNode;
}

const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
};

export default AppProviders;
