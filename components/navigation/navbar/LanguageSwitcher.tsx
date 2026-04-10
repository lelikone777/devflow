"use client";

import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage, useTranslations } from "@/context/Language";
import { Locale } from "@/lib/i18n";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
};

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguage();
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Languages className="size-[1.1rem]" />
          <span className="absolute -bottom-1 right-0 text-[10px] font-semibold uppercase">
            {localeLabels[locale]}
          </span>
          <span className="sr-only">{t("common.language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("en")}>
          {t("common.english")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("ru")}>
          {t("common.russian")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
