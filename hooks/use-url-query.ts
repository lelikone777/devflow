"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";

interface PushQueryParamOptions {
  scroll?: boolean;
  removeIfEmpty?: boolean;
  keysToRemove?: string[];
}

interface RemoveQueryParamsOptions {
  scroll?: boolean;
}

export function useUrlQuery() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const getParam = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams]
  );

  const pushQueryParam = useCallback(
    (key: string, value: string, options: PushQueryParamOptions = {}) => {
      const shouldRemove = options.removeIfEmpty && !value.trim();
      const nextUrl = shouldRemove
        ? removeKeysFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: options.keysToRemove ?? [key],
            pathname,
          })
        : formUrlQuery({
            params: searchParams.toString(),
            key,
            value,
            pathname,
          });

      router.push(nextUrl, { scroll: options.scroll ?? false });
    },
    [pathname, router, searchParams]
  );

  const removeQueryParams = useCallback(
    (keysToRemove: string[], options: RemoveQueryParamsOptions = {}) => {
      const nextUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove,
        pathname,
      });

      router.push(nextUrl, { scroll: options.scroll ?? false });
    },
    [pathname, router, searchParams]
  );

  const toggleQueryParam = useCallback(
    (key: string, value: string, options: RemoveQueryParamsOptions = {}) => {
      const currentValue = searchParams.get(key) ?? "";

      if (currentValue === value) {
        removeQueryParams([key], options);
        return;
      }

      pushQueryParam(key, value, options);
    },
    [pushQueryParam, removeQueryParams, searchParams]
  );

  return {
    pathname,
    searchParams,
    getParam,
    pushQueryParam,
    removeQueryParams,
    toggleQueryParam,
  };
}
