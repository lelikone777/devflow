"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { useTranslations } from "@/context/Language";
import { useUrlQuery } from "@/hooks/use-url-query";

import GlobalResult from "../GlobalResult";

interface SearchFieldProps {
  initialQuery: string;
}

const SearchField = ({ initialQuery }: SearchFieldProps) => {
  const { getParam, pushQueryParam, removeQueryParams } = useUrlQuery();
  const query = getParam("global");
  const [search, setSearch] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(Boolean(initialQuery));
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;

      if (
        searchContainerRef.current &&
        target instanceof Node &&
        !searchContainerRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim()) {
        pushQueryParam("global", search.trim());
        return;
      }

      if (query) {
        removeQueryParams(["global", "type"]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [pushQueryParam, query, removeQueryParams, search]);

  return (
    <div
      className="relative w-full max-w-[600px] max-lg:hidden"
      ref={searchContainerRef}
    >
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        <Image
          src="/icons/search.svg"
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />

        <Input
          type="text"
          placeholder={t("search.globalPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (e.target.value === "" && isOpen) setIsOpen(false);
          }}
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
        />
      </div>
      {isOpen && <GlobalResult />}
    </div>
  );
};

const GlobalSearch = () => {
  const { getParam } = useUrlQuery();
  const query = getParam("global");

  return <SearchField key={query} initialQuery={query} />;
};

export default GlobalSearch;
