import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  getMessage,
  isLocale,
  LOCALE_COOKIE_NAME,
  Locale,
} from "@/lib/i18n";

export const getServerLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  return locale && isLocale(locale) ? locale : DEFAULT_LOCALE;
};

export const getServerTranslator = async () => {
  const locale = await getServerLocale();

  return {
    locale,
    t: (key: string) => getMessage(locale, key),
  };
};
