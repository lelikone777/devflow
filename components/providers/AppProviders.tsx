"use client";

import { ReactNode } from "react";

import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/context/Language";
import ThemeProvider from "@/context/Theme";
import { Locale } from "@/lib/i18n";

interface AppProvidersProps {
  children: ReactNode;
  locale: Locale;
}

const AppProviders = ({ children, locale }: AppProvidersProps) => {
  return (
    <LanguageProvider locale={locale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster />
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default AppProviders;
