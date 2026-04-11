"use client";

import { GlobalSearchFilters } from "@/constants/filters";
import { useTranslations } from "@/context/Language";
import { useUrlQuery } from "@/hooks/use-url-query";

const GlobalFilter = () => {
  const { getParam, toggleQueryParam } = useUrlQuery();
  const t = useTranslations();

  const active = getParam("type");

  const handleTypeClick = (item: string) => {
    toggleQueryParam("type", item.toLowerCase());
  };

  return (
    <div className="flex flex-col items-start gap-3 px-3 xs:px-5 sm:flex-row sm:items-center sm:gap-5">
      <p className="text-dark400_light900 body-medium">
        {t("search.filterType")}
      </p>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:gap-3">
        {GlobalSearchFilters.map((item) => (
          <button
            type="button"
            key={item.value}
            className={`light-border-2 small-medium rounded-2xl px-4 py-2 capitalize xs:px-5 ${
              active === item.value
                ? "bg-primary-500 text-light-900"
                : "bg-light-700 text-dark-400 hover:text-primary-500 dark:bg-dark-500 dark:text-light-800 dark:hover:text-primary-500"
            }`}
            onClick={() => handleTypeClick(item.value)}
          >
            {t(`filters.${item.value}`)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GlobalFilter;
