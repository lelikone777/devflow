"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  DEFAULT_LOCALE,
  getMessage,
  getMessages,
  Locale,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  locale: Locale;
}

export const LanguageProvider = ({
  children,
  locale: initialLocale,
}: LanguageProviderProps) => {
  const router = useRouter();
  const [locale, setCurrentLocale] = useState<Locale>(initialLocale);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => {
        setCurrentLocale(nextLocale);
        document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh();
      },
      t: (key: string) => getMessage(locale, key),
    }),
    [locale, router]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
};

export const useTranslations = () => useLanguage().t;

export const getInitialMessages = (locale: Locale) => getMessages(locale);

export { DEFAULT_LOCALE };
