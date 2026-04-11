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
    <div className="flex items-center gap-5 px-5">
      <p className="text-dark400_light900 body-medium">
        {t("search.filterType")}
      </p>
      <div className="flex gap-3">
        {GlobalSearchFilters.map((item) => (
          <button
            type="button"
            key={item.value}
            className={`light-border-2 small-medium rounded-2xl px-5 py-2 capitalize ${
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
