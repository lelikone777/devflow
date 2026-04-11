"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useUrlQuery } from "@/hooks/use-url-query";

import { Input } from "../ui/input";

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
  iconPosition?: "left" | "right";
}

interface SearchFieldProps extends Props {
  initialQuery: string;
}

const SearchField = ({
  route,
  imgSrc,
  placeholder,
  otherClasses,
  iconPosition,
  initialQuery,
}: SearchFieldProps) => {
  const { pathname, pushQueryParam, removeQueryParams } = useUrlQuery();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        pushQueryParam("query", searchQuery.trim());
        return;
      }

      if (pathname === route) {
        removeQueryParams(["query"]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [pathname, pushQueryParam, removeQueryParams, route, searchQuery]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] w-full min-w-0 grow items-center gap-3 rounded-[10px] px-3 xs:gap-4 xs:px-4 ${otherClasses}`}
    >
      {iconPosition === "left" && (
        <Image
          src={imgSrc}
          width={24}
          height={24}
          alt="Search"
          className="cursor-pointer"
        />
      )}

      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        className="paragraph-regular no-focus min-w-0 placeholder text-dark400_light700 border-none shadow-none outline-none"
      />

      {iconPosition === "right" && (
        <Image
          src={imgSrc}
          width={15}
          height={15}
          alt="Search"
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

const LocalSearch = ({
  route,
  imgSrc,
  placeholder,
  otherClasses,
  iconPosition = "left",
}: Props) => {
  const { getParam } = useUrlQuery();
  const query = getParam("query");

  return (
    <SearchField
      key={query}
      route={route}
      imgSrc={imgSrc}
      placeholder={placeholder}
      otherClasses={otherClasses}
      iconPosition={iconPosition}
      initialQuery={query}
    />
  );
};

export default LocalSearch;
